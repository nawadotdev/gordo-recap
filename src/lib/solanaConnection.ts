import { Connection } from "@solana/web3.js";
import "dotenv/config";
import logger from "./logger";

if (!process.env.SOLANA_RPC_URL) {
    logger.error("SOLANA_RPC_URL is not set");
    process.exit(1);
}

export const connection = new Connection(process.env.SOLANA_RPC_URL);