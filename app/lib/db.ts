import mysql from "serverless-mysql";
import { isAddress } from "viem";

// Create a database connection pool
const db = mysql({
  config: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: true,
    },
  },
});

// Execute SQL queries
export async function query(sql: string, params: any[]) {
  try {
    const results = await db.query(sql, params);
    await db.end();
    return results;
  } catch (error) {
    return { error };
  }
}

// Authenticate user based on Ethereum address
export async function authenticateUser(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  // TODO: Implement proper token verification
  // For now, we'll just check if it's a valid Ethereum address
  if (isAddress(token)) {
    return token;
  }

  return null;
}
