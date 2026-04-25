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

        // 2. Build the Context String with EXPLICIT Liability Formatting
        let context = `Current Exchange Rates: $1 = ₦${rates.NGN}, £1 = ₦${(rates.NGN / rates.GBP).toFixed(2)}\n\n`;
        
        context += "USER ACCOUNTS (ASSETS & DEBTS):\n";
        (accounts || []).forEach((acc: any) => {
            // THE FIX: Explicitly translate credit types into "Debt" language
            const isDebt = acc.type.toLowerCase() === 'credit' || acc.type.toLowerCase() === 'loan';
            
            if (isDebt) {
                context += `- ${acc.name} (Credit/Debt): User OWES ${acc.currency} ${Math.abs(parseFloat(acc.balance))}\n`;
            } else {
                context += `- ${acc.name} (${acc.type}): Available Cash is ${acc.currency} ${acc.balance}\n`;
            }
        });

        context += "\nUSER UPCOMING BILLS (MONEY LEAVING THE ACCOUNT):\n";
        (loans || []).forEach((loan: any) => {
            context += `- ${loan.name} (${loan.type}): User MUST PAY ${loan.currency} ${loan.payment} per ${loan.frequency}. Next due: ${loan.nextDate || 'N/A'}\n`;
        });

        // 3. Create the strict system instruction
        const prompt = `
        You are KORE Brain, a premium financial analyst AI. 
        Review the user's provided financial data and generate exactly 3 insights for their daily dashboard briefing.
        
        IMPORTANT: Accounts labeled "Credit/Debt" represent money the user owes to a bank. This is a liability, not cash. Do NOT suggest using credit balances to pay for things.
        
        1. "Market insight": Comment on the exchange rates or their fiat balances.
        2. "Action required": Identify an upcoming bill, high debt, or urgent obligation. If none, suggest a good financial habit.
        3. "Wealth opportunity": Suggest a smart move (e.g., investing idle cash, paying down "Credit/Debt" faster to save on interest).

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

        // 4. Call Gemini 2.5 Flash
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
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

// --- NEW: PHASE 2 RECEIPT SCANNER ---
export async function extractReceiptData(base64Image: string, mimeType: string) {
    try {
        const prompt = `
        Analyze this receipt or invoice image. 
        Extract the following information:
        1. "merchant": The name of the store, business, or entity.
        2. "amount": The total final amount paid (as a pure number, no currency symbols).
        3. "date": The date of the transaction in YYYY-MM-DD format.

        If you cannot find a value, leave it blank.
        Return ONLY a valid JSON object matching exactly those three keys. Do not use markdown.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                prompt,
                { inlineData: { data: base64Image, mimeType: mimeType } }
            ],
            config: {
                responseMimeType: "application/json",
            }
        });

        const jsonText = response.text || "{}";
        return { success: true, data: JSON.parse(jsonText) };

    } catch (error) {
        console.error("Receipt Scan Error:", error);
        return { success: false, error: "Failed to read the receipt image." };
    }
}