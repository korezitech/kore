'use server'

import { GoogleGenAI } from '@google/genai';
import { getUserAccounts } from './accountActions';
import { getUserLoans } from './loanActions';
import { getLiveExchangeRates } from './currencyActions';

// Initialize the Gemini SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function getDailyBriefing(userId: string) {
    try {
        // 1. Gather the user's secure financial snapshot
        const [accounts, loans, rateData] = await Promise.all([
            getUserAccounts(userId),
            getUserLoans(userId),
            getLiveExchangeRates()
        ]);

        const rates = rateData?.success ? rateData.rates : { NGN: 1355.15, GBP: 0.79, USD: 1 };

        // 2. Build the Context String for Gemini
        let context = `Current Exchange Rates: $1 = ₦${rates.NGN}, £1 = ₦${(rates.NGN / rates.GBP).toFixed(2)}\n\n`;
        
        context += "USER ACCOUNTS:\n";
        (accounts || []).forEach((acc: any) => {
            context += `- ${acc.name} (${acc.type}): ${acc.currency} ${acc.balance}\n`;
        });

        context += "\nUSER OBLIGATIONS & BILLS:\n";
        (loans || []).forEach((loan: any) => {
            context += `- ${loan.name} (${loan.type}): ${loan.currency} ${loan.payment}/${loan.frequency}. Next due: ${loan.nextDate || 'N/A'}\n`;
        });

        // 3. Create the strict system instruction
        const prompt = `
        You are KORE Brain, a premium financial analyst AI. 
        Review the user's provided financial data and generate exactly 3 insights for their daily dashboard briefing.
        
        1. "Market insight": Comment on the exchange rates or their fiat balances.
        2. "Action required": Identify an upcoming bill, low balance, or urgent debt. If none, suggest a good financial habit.
        3. "Wealth opportunity": Suggest a smart move (e.g., investing idle cash from a specific account, paying off debt faster).

        Keep each insight under 2 sentences. Be concise, professional, and data-driven. Do NOT use markdown.
        
        You MUST return the output as a valid JSON array of exactly 3 objects matching this exact format:
        [
          { "type": "Market insight", "text": "...", "color": "purple" },
          { "type": "Action required", "text": "...", "color": "orange" },
          { "type": "Wealth opportunity", "text": "...", "color": "emerald" }
        ]
        
        USER DATA:
        ${context}
        `;

        // 4. Call Gemini 3 Flash
        const response = await ai.models.generateContent({
            model: 'gemini-3.0-flash', 
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        const jsonText = response.text || "[]";
        return { success: true, data: JSON.parse(jsonText) };

    } catch (error) {
        console.error("AI Briefing Error:", error);
        return { success: false, error: "Failed to generate AI briefing." };
    }
}