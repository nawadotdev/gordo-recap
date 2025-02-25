import { model, Schema } from "mongoose";
import { ICall } from "../types";

const callSchema = new Schema<ICall>({
    publicKey: {
        type: String,
        required: true,
    },
    symbol: {
        type: String,
        required: true,
    },
    marketCap: {
        type: Number,
        required: true,
    },
    calledAt: {
        type: Number,
        required: true,
    }
})

export const Call = model<ICall>("Call", callSchema)