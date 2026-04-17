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

export async function logInvestmentTrade(tradeData: any) {
    try {
        const response = await fetch(`${apiUrl}?action=log_investment_trade`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey || '' },
            body: JSON.stringify(tradeData)
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
// THE DUAL-MARKET LIVE ENGINE (YAHOO + KWAYISI PROXY BRIDGE)
// ========================================================
export async function getLiveAssetPrices(assets: any[]) {
    const prices: Record<string, { price: number, change24h: number }> = {};

    const globalAssets = assets.filter(a => a.region !== 'NGN');
    const ngxAssets = assets.filter(a => a.region === 'NGN');

    // 🌍 1. GLOBAL MARKETS (Yahoo Finance)
    await Promise.all(globalAssets.map(async (asset) => {
        try {
            let queryTicker = asset.ticker.toUpperCase();
            if (asset.type === 'Crypto' && !queryTicker.includes('-')) queryTicker = `${queryTicker}-USD`;
            if (asset.region === 'GBP' && !queryTicker.includes('.')) queryTicker = `${queryTicker}.L`;

            const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${queryTicker}`, { cache: 'no-store' });
            const data = await res.json();

            if (data.chart && data.chart.result && data.chart.result.length > 0) {
                const result = data.chart.result[0];
                const currentPrice = result.meta.regularMarketPrice;
                const prevClose = result.meta.previousClose;
                let change = prevClose > 0 ? ((currentPrice - prevClose) / prevClose) * 100 : 0;
                prices[asset.ticker] = { price: currentPrice, change24h: Number(change.toFixed(2)) };
            }
        } catch (e) {
            // Silently fail, frontend handles defaults
        }
    }));

    // 🇳🇬 2. NGX MARKETS (The Hostinger PHP Bridge)
    if (ngxAssets.length > 0) {
        try {
            // Extract the tickers your user owns
            const tickers = ngxAssets.map(a => a.ticker.toUpperCase());
            
            // Automatically swap api.php in your environment variable to point to ngx_scraper.php
            const scraperUrl = apiUrl?.replace('api.php', 'ngx_scraper.php') || '';

            // Ask Hostinger to scrape Kwayisi for us
            const res = await fetch(scraperUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tickers }),
                cache: 'no-store'
            });

            const responseData = await res.json();

            // Map Hostinger's clean JSON back into the Next.js UI
            if (responseData.status === 'success' && responseData.data) {
                ngxAssets.forEach(asset => {
                    const ticker = asset.ticker.toUpperCase();
                    
                    if (responseData.data[ticker]) {
                        const { price, change } = responseData.data[ticker];
                        let changePercent = 0;
                        
                        // Convert absolute change to percentage
                        if (change !== 0) {
                            const prevClose = price - change;
                            if (prevClose > 0) changePercent = (change / prevClose) * 100;
                        }
                        
                        prices[asset.ticker] = { 
                            price: price, 
                            change24h: Number(changePercent.toFixed(2)) 
                        };
                    }
                });
            }
        } catch (e) {
            console.error("Hostinger PHP Bridge Failed:", e);
        }
    }

    return prices;
}