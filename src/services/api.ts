export const getOhlcv = async (
    tokenAddress: string,
    amount: number = 24,
    interval: number = 60
) => {

    try{

        const resp = await fetch(`https://ohlcv-plum.vercel.app/api?token=${tokenAddress}&interval=${interval}&amount=${amount}`)

        if(!resp.ok){
            throw new Error("Failed to fetch ohlcv data")
        }

        const data = await resp.json()

        return data

    }catch(error){

    }
}