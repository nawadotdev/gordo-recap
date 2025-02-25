import { PublicKey } from "@solana/web3.js";
import { connection } from "../lib";

export const getSupply = async (tokenAddress: string) => {

    const supply = await connection.getTokenSupply(new PublicKey(tokenAddress))
    return supply.value.uiAmount
}
