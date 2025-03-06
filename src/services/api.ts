export const getOhlcv = async (
    tokenAddress: string,
    amount: number = 24,
    interval: number = 60,
    calledAt: number
) => {

    let data = []

    try{
        console.log(`https://ohlcv-plum.vercel.app/api?token=${tokenAddress}&interval=${interval}&amount=${amount}`)
        const url = `https://ohlcv-plum.vercel.app/api?token=${tokenAddress}&interval=${interval}&amount=${amount}`
        const resp = await fetch(url)

        if(!resp.ok){
            throw new Error("Failed to fetch ohlcv data")
        }

        const json = await resp.json()
        data.push(...json.data)
        if(data[0].timestamp > calledAt){
            const url = `https://ohlcv-plum.vercel.app/api?token=${tokenAddress}&interval=${interval}&amount=${amount}&bbn=${data[0].block}`
            console.log(url)
            const resp = await fetch(url)
            const json = await resp.json()
            data.push(...json.data)
        }

    }catch(error){
        console.log("Error", error)
    }

    data = data.sort((a, b) => a.block - b.block)

    return {
        data: data,
    }
}