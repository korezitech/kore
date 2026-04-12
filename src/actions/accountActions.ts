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
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey || ''
            },
            body: JSON.stringify(accountData)
        });
        const data = await response.json();
        if (data.error) return { success: false, error: data.error };
        return { success: true, accountId: data.accountId };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}

export async function updateAccount(accountData: any) {
    try {
        const response = await fetch(`${apiUrl}?action=update_account`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey || ''
            },
            body: JSON.stringify(accountData)
        });
        const data = await response.json();
        if (data.error) return { success: false, error: data.error };
        return { success: true };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}

export async function deleteAccount(accountId: string, userId: string) {
    try {
        const response = await fetch(`${apiUrl}?action=delete_account`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey || ''
            },
            body: JSON.stringify({ accountId, userId })
        });
        const data = await response.json();
        if (data.error) return { success: false, error: data.error };
        return { success: true };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}