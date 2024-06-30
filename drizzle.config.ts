import { defineConfig } from "drizzle-kit"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
    host: process.env.POSTGRES_HOST!,
  },
})
