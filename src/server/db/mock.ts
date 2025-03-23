import { db, schema } from "./index";
import { count, eq, and } from "drizzle-orm";
import { z } from "zod";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import type { Platform, Sentiment } from "./schema";

const gemini = google("gemini-2.0-flash-001");

// Define Zod schema for mention generation
const mentionSchema = z.object({
  platform: z.enum(["X", "YouTube", "Reddit", "Bluesky"]),
  url: z.string(),
  name: z.string(),
  username: z.string(),
  title: z.string().optional(),
  content: z.string(),
  date: z.string(),
  sentiment: z.enum(["POSITIVE", "NEGATIVE", "NEUTRAL"]),
});

type GeneratedMention = z.infer<typeof mentionSchema>;

// Function to generate realistic mentions using Gemini
const generateRealisticMentions = async (): Promise<GeneratedMention[]> => {
  // Create a prompt for Gemini to generate realistic social media mentions
  const prompt = `Generate 30 realistic mentions for a given platform and sentiment. include line breaks and emojis in some of them`;

  try {
    // Generate text with Gemini
    const completion = await generateObject({
      model: gemini,
      schema: z.array(mentionSchema),
      prompt,
    });

    return completion.object;
  } catch (error) {
    console.error("Error generating mentions:", error);
    return [];
  }
};

// Main function to create mock data
const createMockData = async () => {
  console.log("Creating mock data...");

  const adminUser = (
    await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.username, "admin"))
      .limit(1)
  )[0];

  if (!adminUser)
    throw new Error("Admin user not found - please create admin user first");
  console.log("Found admin user:", adminUser.id);

  // Wrap all operations in a single transaction
  return await db.transaction(async (tx) => {
    // Find admin account
    const adminAccounts = await tx
      .select()
      .from(schema.account)
      .where(eq(schema.account.userId, adminUser.id))
      .limit(1);

    const adminAccount = adminAccounts[0];
    if (!adminAccount)
      throw new Error(
        "Admin account not found - please create admin account first"
      );
    console.log("Found admin account:", adminAccount.id);

    // 4. Create email group for admin account if not exists
    const existingEmailGroups = await tx
      .select()
      .from(schema.emailGroup)
      .where(eq(schema.emailGroup.accountId, adminAccount.id))
      .limit(1);

    let adminEmailGroup = existingEmailGroups[0];

    if (adminEmailGroup) {
      console.log("Found existing email group:", adminEmailGroup.id);
    } else {
      const adminEmailGroups = await tx
        .insert(schema.emailGroup)
        .values({
          name: "Default Group",
          from: "notifications@example.com",
          accountId: adminAccount.id,
        })
        .returning();

      adminEmailGroup = adminEmailGroups[0];
      if (!adminEmailGroup) throw new Error("Failed to create email group");
      console.log("Created email group:", adminEmailGroup.id);
    }

    // Now we ensure adminEmailGroup is defined
    if (!adminEmailGroup)
      throw new Error("Failed to get or create email group");

    // 5. Create or update account config
    const existingAccountConfigs = await tx
      .select()
      .from(schema.accountConfig)
      .where(eq(schema.accountConfig.accountId, adminAccount.id))
      .limit(1);

    let adminAccountConfig = existingAccountConfigs[0];

    if (adminAccountConfig) {
      // Update existing config with new AI prompt
      await tx
        .update(schema.accountConfig)
        .set({
          aiPrompt:
            "Analyze sentiment (positive, negative, neutral) of mentions and reject any unrelated content.",
          defaultEmailGroupId: adminEmailGroup.id,
        })
        .where(eq(schema.accountConfig.id, adminAccountConfig.id));
      console.log("Updated account config:", adminAccountConfig.id);
    } else {
      // Create new config
      const adminAccountConfigs = await tx
        .insert(schema.accountConfig)
        .values({
          defaultEmailGroupId: adminEmailGroup.id,
          aiPrompt:
            "Analyze sentiment (positive, negative, neutral) of mentions and reject any unrelated content.",
          accountId: adminAccount.id,
        })
        .returning();

      adminAccountConfig = adminAccountConfigs[0];
      if (!adminAccountConfig)
        throw new Error("Failed to create account config");
      console.log("Created account config:", adminAccountConfig.id);
    }

    // Ensure adminAccountConfig is defined
    if (!adminAccountConfig)
      throw new Error("Failed to get or create account config");

    // 6. Create search configs for each platform if not exist
    const platforms: Platform[] = ["X", "YouTube", "Reddit", "Bluesky"];
    const searchConfigsPromises = platforms.map(async (platform) => {
      // Check if config already exists
      const existingConfigs = await tx
        .select()
        .from(schema.searchConfig)
        .where(
          and(
            eq(schema.searchConfig.platform, platform),
            eq(schema.searchConfig.accountId, adminAccount.id)
          )
        )
        .limit(1);

      const existingConfig = existingConfigs[0];

      if (existingConfig) {
        // Update existing config
        await tx
          .update(schema.searchConfig)
          .set({
            aiPrompt: `Analyze ${platform} mentions for sentiment and reject unrelated mentions.`,
            emailGroupId: adminEmailGroup.id,
            accountConfigId: adminAccountConfig.id,
          })
          .where(eq(schema.searchConfig.id, existingConfig.id));

        console.log(`Updated search config for ${platform}`);
        return existingConfig;
      } else {
        // Create new config
        const configs = await tx
          .insert(schema.searchConfig)
          .values({
            platform,
            query: `${platform} search query`,
            emailGroupId: adminEmailGroup.id,
            aiPrompt: `Analyze ${platform} mentions for sentiment and reject unrelated mentions.`,
            accountConfigId: adminAccountConfig.id,
            accountId: adminAccount.id,
          })
          .returning();

        const config = configs[0];
        if (!config)
          throw new Error(`Failed to create search config for ${platform}`);
        console.log(`Created search config for ${platform}`);
        return config;
      }
    });

    const searchConfigs = await Promise.all(searchConfigsPromises);

    // Generate realistic mentions
    const generatedMentions = await generateRealisticMentions();

    // Create mentions for each platform - one search config at a time
    for (const config of searchConfigs) {
      const platform = config.platform as Platform;
      const mentions = generatedMentions.filter(
        (mention) => mention.platform === platform
      );

      if (mentions.length > 0) {
        // Prepare values for batch insertion
        const mentionValues = mentions.map((mention) => ({
          platform: mention.platform,
          url: mention.url,
          name: mention.name,
          username: mention.username,
          title: mention.title,
          content: mention.content,
          date: new Date(mention.date), // Convert string to Date
          sentiment: mention.sentiment as Sentiment,
          query: config.query,
          emailGroupId: adminEmailGroup.id,
          searchConfigId: config.id,
          accountId: adminAccount.id,
        }));

        // Insert all mentions for this platform in a single query
        await tx.insert(schema.mention).values(mentionValues);
        console.log(`Added ${mentionValues.length} mentions for ${platform}`);
      }
    }

    console.log("Created mentions for all platforms");

    // Verify data was created
    const mentionsCount = await tx
      .select({ count: { value: count() } })
      .from(schema.mention);
    console.log(
      `Total mentions created: ${mentionsCount[0]?.count?.value ?? 0}`
    );

    return {
      user: adminUser,
      account: adminAccount,
      emailGroup: adminEmailGroup,
      accountConfig: adminAccountConfig,
      searchConfigs,
    };
  });
};

// Execute the mock data creation with top-level await
const mockData = await createMockData();

// Export mock data for potential use elsewhere
export default mockData;
