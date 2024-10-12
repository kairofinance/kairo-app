import mysql from "mysql2/promise";
import { ethers } from "ethers";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: true,
  },
});

export async function query(sql: string, params: any[]) {
  const [results] = await pool.execute(sql, params);
  return results;
}

export async function authenticateUser(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  // TODO: Implement proper token verification
  // For now, we'll just check if it's a valid Ethereum address
  if (ethers.utils.isAddress(token)) {
    return token;
  }

  return null;
}
