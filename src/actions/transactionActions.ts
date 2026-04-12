'use server'

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const apiKey = process.env.KORE_API_SECRET_KEY;

export async function getUserTransactions(userId: string) {
    try {
        const response = await fetch(`${apiUrl}?action=get_transactions&userId=${userId}`, {
            method: 'GET',
            headers: { 'x-api-key': apiKey || '' },
            cache: 'no-store'
        });
        const data = await response.json();
        return data.transactions || [];
    } catch (error) {
        console.error("Fetch transactions error:", error);
        return [];
    }
}

export async function createTransaction(transactionData: any) {
    try {
        const response = await fetch(`${apiUrl}?action=create_transaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey || ''
            },
            // This is the important part: we need to make sure type is in this JSON!
            body: JSON.stringify(transactionData)
        });
        const data = await response.json();
        if (data.error) return { success: false, error: data.error };
        return { success: true, transactionId: data.transactionId };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}

export async function deleteTransaction(transactionId: string, userId: string, reverseBalance: boolean = true) {
    try {
        const response = await fetch(`${apiUrl}?action=delete_transaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey || ''
            },
            body: JSON.stringify({ transactionId, userId, reverseBalance }) // Added flag
        });
        const data = await response.json();
        return { success: !data.error, error: data.error };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}

export async function bulkDeleteTransactions(transactionIds: string[], userId: string, reverseBalance: boolean = true) {
    try {
        const response = await fetch(`${apiUrl}?action=bulk_delete_transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey || ''
            },
            body: JSON.stringify({ transactionIds, userId, reverseBalance })
        });
        const data = await response.json();
        return { success: !data.error, error: data.error };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}

export async function updateTransactionNotes(transactionId: string, userId: string, notes: string) {
    try {
        const response = await fetch(`${apiUrl}?action=update_transaction_notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey || ''
            },
            body: JSON.stringify({ transactionId, userId, notes })
        });
        const data = await response.json();
        return { success: !data.error, error: data.error };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}