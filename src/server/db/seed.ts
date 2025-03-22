import { env } from "~/env";
import { auth } from "../auth";
import { APIError } from "better-auth/api";

console.log("Seeding database");

try {
  await auth.api.signUpEmail({
    body: {
      name: "Admin",
      displayUsername: "Admin",
      email: "admin@example.com",
      password: env.ADMIN_PASSWORD,
      username: env.ADMIN_USERNAME,
    },
  });
} catch (error) {
  if (error instanceof APIError) {
    console.error(error.message);
    process.exit(0);
  }
  throw error;
}

console.log("Database seeded");
