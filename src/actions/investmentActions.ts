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
// THE DUAL-MARKET LIVE ENGINE (YAHOO + KWAYISI SCRAPER)
// ========================================================
export async function getLiveAssetPrices(assets: any[]) {
    const prices: Record<string, { price: number, change24h: number }> = {};

    // 1. Separate assets by region
    const globalAssets = assets.filter(a => a.region !== 'NGN');
    const ngxAssets = assets.filter(a => a.region === 'NGN');

    // ==========================================
    // 🌍 GLOBAL MARKETS (Yahoo Finance)
    // ==========================================
    await Promise.all(globalAssets.map(async (asset) => {
        try {
            let queryTicker = asset.ticker.toUpperCase();
            
            // Format trick based on asset type/region
            if (asset.type === 'Crypto' && !queryTicker.includes('-')) queryTicker = `${queryTicker}-USD`;
            if (asset.region === 'GBP' && !queryTicker.includes('.')) queryTicker = `${queryTicker}.L`;

            // Hit the public Yahoo Finance endpoint
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
            // Silently fail if ticker is invalid
        }
    }));

    // ==========================================
    // 🇳🇬 NGX MARKETS (Your Kwayisi Scraper translated to Node.js)
    // ==========================================
    if (ngxAssets.length > 0) {
        try {
            // Fetch both pages concurrently just like your PHP array
            const fetchOptions = { 
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, 
                cache: 'no-store' as RequestCache 
            };
            
            const [page1Res, page2Res] = await Promise.all([
                fetch("https://afx.kwayisi.org/ngx/", fetchOptions),
                fetch("https://afx.kwayisi.org/ngx/?page=2", fetchOptions)
            ]);
            
            const combinedHtml = (await page1Res.text()) + (await page2Res.text());

            // Regex parser that perfectly mimics XPath: //table//tr/td[4]
            const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
            const scrapedData: Record<string, number> = {};
            let match;
            
            while ((match = trRegex.exec(combinedHtml)) !== null) {
                const rowHtml = match[1];
                const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
                const cols = [];
                let tdMatch;
                
                while ((tdMatch = tdRegex.exec(rowHtml)) !== null) {
                    // Strip HTML tags (like <a>) to get raw text
                    cols.push(tdMatch[1].replace(/<[^>]*>?/gm, '').trim());
                }
                
                // Ensure the row has enough columns (Ticker is col 0, Price is col 3)
                if (cols.length >= 4) {
                    const ticker = cols[0].toUpperCase();
                    const price = parseFloat(cols[3].replace(/,/g, '')); // Remove commas
                    if (!isNaN(price)) {
                        scrapedData[ticker] = price;
                    }
                }
            }

            // Map the scraped data to your portfolio
            ngxAssets.forEach(asset => {
                const ticker = asset.ticker.toUpperCase();
                if (scrapedData[ticker]) {
                    // Kwayisi doesn't provide easy 24h %, so we set it to 0 to prevent UI crashes
                    prices[ticker] = { price: scrapedData[ticker], change24h: 0 };
                }
            });

        } catch (e) {
            // Silently fail if scraping fails
        }
    }

    return prices;
}