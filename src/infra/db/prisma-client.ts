import { PrismaClient } from "@/generated/prisma/client";
import { databaseCircuitBreaker } from "@/infra/circuit-breaker";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number.parseInt(process.env.DB_POOL_MAX || "10", 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error(
    "[PostgreSQL Pool] Unexpected error on idle client:",
    err.message,
  );
});

const originalConnect = pool.connect.bind(pool);
(pool as any).connect = async () => {
  const client = await databaseCircuitBreaker.execute(() => originalConnect());
  const originalQuery = client.query.bind(client);
  (client as any).query = (...args: any[]) =>
    databaseCircuitBreaker.execute(() => (originalQuery as any)(...args));
  return client;
};

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
