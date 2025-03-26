import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import axios from "redaxios";
import type { User } from "../../lib/users";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export const APIRoute = createAPIFileRoute("/api/scrape")({
  GET: async ({ request }) => {
    console.log("Scraping...");

    console.log(request);

    return json({ message: "Scraping..." });
  },
});
