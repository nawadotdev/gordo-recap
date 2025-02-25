import { getOhlcv } from "../../services"

export const getAth = async (publicKey: string, amount: number) => {

    const ohlcv = await getOhlcv(publicKey, amount+1)
    
    const highest = ohlcv.data.reduce((max: any, current: any) => {
        return Math.max(max, current.highUsdc)
    }, 0)

    return highest
}