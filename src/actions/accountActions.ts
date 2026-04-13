'use server'

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const apiKey = process.env.KORE_API_SECRET_KEY;

export async function getUserAccounts(userId: string) {
    try {
        const response = await fetch(`${apiUrl}?action=get_user_accounts&userId=${userId}`, {
            method: 'GET',
            headers: { 'x-api-key': apiKey || '' },
            cache: 'no-store'
        });
        const data = await response.json();
        return data.accounts || [];
    } catch (error) {
        console.error("Fetch accounts error:", error);
        return [];
    }
}

export async function createAccount(accountData: any) {
    try {
        const response = await fetch(`${apiUrl}?action=create_account`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey || '' },
            body: JSON.stringify(accountData)
        });
        const data = await response.json();
        return { success: !data.error, error: data.error };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}

export async function updateAccount(accountData: any) {
    try {
        const response = await fetch(`${apiUrl}?action=update_account`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey || '' },
            body: JSON.stringify(accountData)
        });
        const data = await response.json();
        return { success: !data.error, error: data.error };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}

export async function deleteAccount(accountId: string, userId: string) {
    try {
        const response = await fetch(`${apiUrl}?action=delete_account`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey || '' },
            body: JSON.stringify({ accountId, userId })
        });
        const data = await response.json();
        return { success: !data.error, error: data.error };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}

export async function togglePinAccount(accountId: string, userId: string, isPinned: boolean) {
    try {
        const response = await fetch(`${apiUrl}?action=toggle_pin_account`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey || '' },
            body: JSON.stringify({ accountId, userId, isPinned: isPinned ? 1 : 0 })
        });
        const data = await response.json();
        return { success: !data.error, error: data.error };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}

// NEW: Trigger the backend to pull fresh data from the ERP
export async function syncLiveAccount(accountId: string, userId: string) {
    try {
        const response = await fetch(`${apiUrl}?action=sync_account`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey || '' },
            body: JSON.stringify({ accountId, userId })
        });
        const data = await response.json();
        return { success: !data.error, error: data.error, newBalance: data.newBalance };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}