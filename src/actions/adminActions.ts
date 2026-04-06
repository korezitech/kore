'use server'

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const apiKey = process.env.KORE_API_SECRET_KEY;

export async function getPendingUsers() {
    try {
        const response = await fetch(`${apiUrl}?action=get_pending_users`, {
            method: 'GET',
            headers: { 'x-api-key': apiKey || '' },
            cache: 'no-store'
        });
        const data = await response.json();
        return data.pendingUsers || [];
    } catch (error) {
        return [];
    }
}

export async function generateNewToken() {
    try {
        const response = await fetch(`${apiUrl}?action=generate_token`, {
            method: 'POST',
            headers: { 'x-api-key': apiKey || '' },
            cache: 'no-store'
        });
        const data = await response.json();
        
        // STOP SWALLOWING ERRORS: If the API failed, return the exact SQL Error to the UI!
        if (data.error) return data.error; 
        
        return data.token || null;
    } catch (error) {
        return null;
    }
}

export async function activatePendingUser(userId: string) {
    try {
        const response = await fetch(`${apiUrl}?action=activate_user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey || ''
            },
            body: JSON.stringify({ userId })
        });
        return await response.json();
    } catch (error) {
        return { error: "Network error" };
    }
}

// --- NEW: Email Sender Action ---
export async function sendTokenEmail(email: string, token: string) {
    try {
        const response = await fetch(`${apiUrl}?action=send_token_email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey || ''
            },
            body: JSON.stringify({ email, token })
        });
        const data = await response.json();
        if (data.error) return { error: data.error };
        return { success: true };
    } catch (error) {
        return { error: "Network error" };
    }
}