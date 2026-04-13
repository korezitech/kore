'use server'

export async function getLiveExchangeRates() {
    // Note: In production, you should move this key to your .env file like: process.env.EXCHANGE_RATE_API_KEY
    const apiKey = '53459f4eeb51047f39869d4d'; 
    
    try {
        // We fetch USD as the base, which allows us to calculate perfect cross-rates for any currency
        const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`, {
            next: { revalidate: 3600 } // Cache the rates for 1 hour to save API quota
        });
        
        const data = await response.json();
        
        if (data.result === 'success') {
            return { success: true, rates: data.conversion_rates };
        } else {
            return { success: false, error: "Failed to fetch rates" };
        }
    } catch (error) {
        console.error("Currency API Error:", error);
        return { success: false, error: "Network error" };
    }
}