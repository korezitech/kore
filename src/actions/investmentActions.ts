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

    // 🇳🇬 2. NGX MARKETS (The Cloudflare-Bypass Proxy Bridge)
    if (ngxAssets.length > 0) {
        try {
            // We route the URLs through AllOrigins to strip Cloudflare blocks and get pure HTML
            const kwayisiUrl1 = encodeURIComponent("https://afx.kwayisi.org/ngx/");
            const kwayisiUrl2 = encodeURIComponent("https://afx.kwayisi.org/ngx/?page=2");
            
            const [page1Res, page2Res] = await Promise.all([
                fetch(`https://api.allorigins.win/raw?url=${kwayisiUrl1}`, { cache: 'no-store' }),
                fetch(`https://api.allorigins.win/raw?url=${kwayisiUrl2}`, { cache: 'no-store' })
            ]);
            
            const combinedHtml = (await page1Res.text()) + (await page2Res.text());

            const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
            const scrapedData: Record<string, { price: number, change: number }> = {};
            let match;
            
            while ((match = trRegex.exec(combinedHtml)) !== null) {
                const rowHtml = match[1];
                
                // Only extract <td> cells to prevent <th> misalignments
                const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
                const cols = [];
                let cellMatch;
                
                while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
                    cols.push(cellMatch[1].replace(/<[^>]*>?/gm, '').trim());
                }
                
                // Kwayisi Columns: [0:Ticker, 1:Name, 2:Volume, 3:Price, 4:Change]
                if (cols.length >= 5) {
                    const ticker = cols[0].toUpperCase();
                    const price = parseFloat(cols[3].replace(/,/g, '')); 
                    
                    // Handle Kwayisi's change format which includes raw +/- signs
                    let changeRaw = cols[4].replace(/,/g, '').replace(/\+/g, '').trim();
                    const change = parseFloat(changeRaw) || 0;
                    
                    if (!isNaN(price) && ticker) {
                        scrapedData[ticker] = { price, change };
                    }
                }
            }

            // Map the freshly scraped data to the user's specific assets
            ngxAssets.forEach(asset => {
                const assetTicker = asset.ticker.toUpperCase();
                
                // Fuzzy Match (Handles cases like "ACCESSCORP" vs "ACCESS")
                const matchedKey = Object.keys(scrapedData).find(t => 
                    t === assetTicker || assetTicker.startsWith(t) || t.startsWith(assetTicker)
                );

                if (matchedKey) {
                    const data = scrapedData[matchedKey];
                    let changePercent = 0;
                    
                    // Convert raw numeric change back into a percentage for the UI
                    if (data.change !== 0) {
                        const prevClose = data.price - data.change;
                        if (prevClose > 0) changePercent = (data.change / prevClose) * 100;
                    }
                    prices[asset.ticker] = { price: data.price, change24h: Number(changePercent.toFixed(2)) };
                }
            });

        } catch (e) {
            console.error("Proxy Bridge Scrape Failed:", e);
        }
    }

    return prices;
}