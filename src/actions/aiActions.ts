'use server'

import { GoogleGenAI } from '@google/genai';
import { getUserAccounts } from './accountActions';
import { getUserLoans } from './loanActions';
import { getLiveExchangeRates } from './currencyActions';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const apiKey = process.env.KORE_API_SECRET_KEY;

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

// --- PHASE 3: KORE BRAIN CHAT ENGINE (WITH WRITE TOOLS) ---
import { getUserTransactions } from './transactionActions';

export async function chatWithKoreBrain(userId: string, chatHistory: any[], modelName: string) {
    try {
        // 1. Fetch live context silently
        const [accounts, loans, transactions] = await Promise.all([
            getUserAccounts(userId),
            getUserLoans(userId),
            getUserTransactions(userId)
        ]);

        // 2. Build the System Prompt (Advanced Tool Rules)
        let systemPrompt = `You are KORE Brain, an elite, highly intelligent financial advisor and interactive assistant. 
        You have FULL authorization to analyze the user's provided ledger, calculate net worth, suggest debt payoff strategies, and give portfolio risk assessments. 
        DO NOT refuse to answer financial questions. DO NOT say "I cannot provide financial advice." The user owns this data and expects your direct, confident, and highly analytical advice.

        Format your conversational responses beautifully using markdown. Be empathetic, sharp, and conversational.

        CRITICAL TOOL RULES: 
        - You are equipped with a 'create_transaction' tool. 
        - ONLY use this tool if the user explicitly asks to log, add, record, or save a new expense, bill, or income.
        - For all other questions (analysis, chatting, debt advice), reply with normal text. 
        - BEFORE you call the tool, you MUST ensure you have all required pieces of information: Amount, Merchant/Description, Type (income/expense), Category, Account, and Date.
        - If the user's request is missing ANY of these (e.g., they didn't specify the merchant or the account), you MUST ask them for the missing details conversationally. DO NOT trigger the tool until you have everything.

        USER'S LIVE ACCOUNTS:
        ${(accounts || []).map((a: any) => `- ${a.name} (ID: ${a.id}, Type: ${a.type}): ${a.currency} ${a.balance}`).join('\n')}
        
        USER'S LIABILITIES / BILLS:
        ${(loans || []).map((l: any) => `- ${l.name}: ${l.currency} ${l.payment}/${l.frequency}`).join('\n')}

        RECENT TRANSACTIONS:
        ${(transactions || []).slice(0, 10).map((t: any) => `- ${t.date} | ${t.title} | ${t.type === 'income' ? '+' : '-'}${t.currency}${t.amount}`).join('\n')}
        `;

        const formattedContents = chatHistory.map(msg => ({
            role: msg.role === 'ai' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        // 3. Define the Write Capabilities (The Tools)
        const tools = [{
            functionDeclarations: [
                {
                    name: "create_transaction",
                    description: "Prepares a new financial transaction (income or expense) to be saved to the ledger.",
                    parameters: {
                        type: "OBJECT",
                        properties: {
                            amount: { type: "NUMBER", description: "The amount of the transaction. Must be a positive number." },
                            merchant: { type: "STRING", description: "The name of the store, person, or business." },
                            type: { type: "STRING", description: "Must be exactly 'income' or 'expense'." },
                            category: { type: "STRING", description: "E.g., Expense, Income, Dining, Shopping, Travel, Transfer" },
                            accountId: { type: "STRING", description: "The exact ID string of the account used, pulled from the context." },
                            date: { type: "STRING", description: "The date of the transaction in YYYY-MM-DD format. Use today if not specified." }
                        },
                        required: ["amount", "merchant", "type", "category", "accountId", "date"]
                    }
                }
            ]
        }];

        // 4. Call the model with tools equipped
        const response = await ai.models.generateContent({
            model: modelName,
            contents: formattedContents,
            config: {
                systemInstruction: systemPrompt,
                tools: tools as any, // Attach the tools
            }
        });

        // 5. THE INTERCEPT: Check if the AI decided to use a tool instead of talking
        if (response.functionCalls && response.functionCalls.length > 0) {
            const call = response.functionCalls[0];
            return {
                success: true,
                isToolCall: true,         // Flag to tell the frontend to show the UI widget
                toolName: call.name,      // "create_transaction"
                toolArgs: call.args,      // The JSON data it extracted
                text: "I have prepared that transaction for you. Please review and confirm the details below."
            };
        }

        // Otherwise, return normal text chat
        return { success: true, isToolCall: false, text: response.text || "I'm sorry, I couldn't process that request." };

    } catch (error) {
        console.error("KORE Brain Chat Error:", error);
        return { success: false, error: "Connection to KORE Brain interrupted." };
    }
}

// ==========================================
// KORE BRAIN: CHAT HISTORY DATABASE ACTIONS
// ==========================================

export async function getChatHistory(userId: string) {
    try {
        const response = await fetch(`${apiUrl}?action=get_chat&userId=${userId}`, {
            method: 'GET',
            headers: { 'x-api-key': apiKey || '' },
            cache: 'no-store'
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: "Failed to fetch chat history" };
    }
}

export async function saveChatMessage(data: any) {
    try {
        const response = await fetch(`${apiUrl}?action=save_chat`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-api-key': apiKey || '' 
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: "Failed to save message" };
    }
}

export async function updateChatToolStatus(messageId: number | string, toolStatus: string) {
    try {
        const response = await fetch(`${apiUrl}?action=update_chat_tool`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-api-key': apiKey || '' 
            },
            body: JSON.stringify({ messageId, toolStatus })
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: "Failed to update tool status" };
    }
}

export async function clearChatHistory(userId: string) {
    try {
        const response = await fetch(`${apiUrl}?action=clear_chat`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-api-key': apiKey || '' 
            },
            body: JSON.stringify({ userId })
        });
        return await response.json();
    } catch (error) {
        return { success: false, error: "Failed to clear chat" };
    }
}