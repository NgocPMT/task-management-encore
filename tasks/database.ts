import { SQLDatabase } from "encore.dev/storage/sqldb";
import { drizzle } from "drizzle-orm/node-postgres";

const DB = new SQLDatabase("tasks", {
  migrations: {
    path: "migrations",
    source: "drizzle",
  },
});

const db = drizzle(DB.connectionString);

export { db };
