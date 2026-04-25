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

// --- PHASE 2: MULTI-ITEM RECEIPT & STATEMENT SCANNER ---
export async function extractReceiptData(base64Image: string, mimeType: string) {
    try {
        const prompt = `
        Analyze this receipt, invoice, or bank statement image. 
        Extract ALL visible transactions. For each transaction, extract:
        1. "merchant": The name of the store, business, or entity.
        2. "amount": The total amount (as a pure number, no currency symbols).
        3. "date": The date of the transaction in YYYY-MM-DD format.

        Return ONLY a valid JSON ARRAY of objects matching this exact structure. Do not use markdown.
        Example:
        [
          { "merchant": "Uber", "amount": 5500, "date": "2026-04-24" },
          { "merchant": "Starbucks", "amount": 3200, "date": "2026-04-25" }
        ]
        If no transactions are found, return an empty array: []
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

        const jsonText = response.text || "[]";
        return { success: true, data: JSON.parse(jsonText) };

    } catch (error) {
        console.error("Receipt Scan Error:", error);
        return { success: false, error: "Failed to read the document image." };
    }
}

// --- PHASE 3: KORE BRAIN CHAT ENGINE ---
import { getUserTransactions } from './transactionActions';

export async function chatWithKoreBrain(userId: string, chatHistory: any[], modelName: string) {
    try {
        // 1. Fetch live context silently
        const [accounts, loans, transactions] = await Promise.all([
            getUserAccounts(userId),
            getUserLoans(userId),
            getUserTransactions(userId)
        ]);

        // 2. Build the System Prompt (The AI's hidden brain)
        let systemPrompt = `You are KORE Brain, a highly advanced, premium financial fiduciary AI. You are talking directly to the user.
        Format your responses beautifully using markdown, bolding, and bullet points to make them highly readable. 
        Be concise, highly analytical, and confident. Never say "As an AI".
        
        HERE IS THE USER'S LIVE FINANCIAL LEDGER:
        
        ACCOUNTS:
        ${(accounts || []).map((a: any) => `- ${a.name} (${a.type}): ${a.currency} ${a.balance}`).join('\n')}
        
        LIABILITIES / BILLS:
        ${(loans || []).map((l: any) => `- ${l.name}: ${l.currency} ${l.payment}/${l.frequency} (Due: ${l.nextDate})`).join('\n')}
        
        RECENT TRANSACTIONS (Last 10):
        ${(transactions || []).slice(0, 10).map((t: any) => `- ${t.date} | ${t.title} | ${t.type === 'income' ? '+' : '-'}${t.currency}${t.amount} (${t.accountName})`).join('\n')}
        `;

        // 3. Format history for the Gemini SDK
        const formattedContents = chatHistory.map(msg => ({
            role: msg.role === 'ai' ? 'model' : 'user', // Translate 'ai' to 'model' for Google's SDK
            parts: [{ text: msg.content }]
        }));

        // 4. Call the chosen model (Flash or Pro)
        const response = await ai.models.generateContent({
            model: modelName,
            contents: formattedContents,
            config: {
                systemInstruction: systemPrompt,
            }
        });

        return { success: true, text: response.text || "I'm sorry, I couldn't process that request." };

    } catch (error) {
        console.error("KORE Brain Chat Error:", error);
        return { success: false, error: "Connection to KORE Brain interrupted." };
    }
}