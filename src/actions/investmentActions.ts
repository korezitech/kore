'use server'

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const apiKey = process.env.KORE_API_SECRET_KEY;

export async function getUserInvestments(userId: string) {
    try {
        const response = await fetch(`${apiUrl}?action=get_user_investments&userId=${userId}`, {
            method: 'GET',
            headers: { 'x-api-key': apiKey || '' },
            cache: 'no-store'
        });
        const data = await response.json();
        return data.investments || [];
    } catch (error) {
        return [];
    }
}

export async function createInvestment(invData: any) {
    try {
        const response = await fetch(`${apiUrl}?action=create_investment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey || '' },
            body: JSON.stringify(invData)
        });
        const data = await response.json();
        return { success: !data.error, error: data.error };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}

export async function updateInvestment(invData: any) {
    try {
        const response = await fetch(`${apiUrl}?action=update_investment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey || '' },
            body: JSON.stringify(invData)
        });
        const data = await response.json();
        return { success: !data.error, error: data.error };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}

export async function deleteInvestment(investmentId: string, userId: string) {
    try {
        const response = await fetch(`${apiUrl}?action=delete_investment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey || '' },
            body: JSON.stringify({ investmentId, userId })
        });
        const data = await response.json();
        return { success: !data.error, error: data.error };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}

// ========================================================
// THE "NGX HACK" LIVE PRICE FETCHER
// ========================================================
export async function getLiveAssetPrices(assets: any[]) {
    const prices: Record<string, { price: number, change24h: number }> = {};

    await Promise.all(assets.map(async (asset) => {
        try {
            let queryTicker = asset.ticker.toUpperCase();
            
            // Format trick based on asset type/region
            if (asset.type === 'Crypto' && !queryTicker.includes('-')) queryTicker = `${queryTicker}-USD`;
            if (asset.region === 'NGN' && !queryTicker.includes('.')) queryTicker = `${queryTicker}.LG`;
            if (asset.region === 'GBP' && !queryTicker.includes('.')) queryTicker = `${queryTicker}.L`;

            // Hit the public, undocumented Yahoo Finance endpoint
            const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${queryTicker}`, { cache: 'no-store' });
            const data = await res.json();

            if (data.chart && data.chart.result && data.chart.result.length > 0) {
                const result = data.chart.result[0];
                const currentPrice = result.meta.regularMarketPrice;
                const prevClose = result.meta.previousClose;
                let change = 0;
                
                if (prevClose > 0) {
                    change = ((currentPrice - prevClose) / prevClose) * 100;
                }

                prices[asset.ticker] = {
                    price: currentPrice,
                    change24h: Number(change.toFixed(2))
                };
            }
        } catch (e) {
            // Silently fail if ticker is invalid/unsupported, will just fallback to AvgPrice on frontend
        }
    }));

    return prices;
}