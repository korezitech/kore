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
        // Point this to your new Hostinger PHP script
        const response = await fetch('https://api.korefinanceapp.com/api/send_token.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, token }),
        });

        const data = await response.json();

        if (data.status === 'success') {
            return { success: true };
        } else {
            return { success: false, error: data.message || 'Failed to send email.' };
        }
    } catch (error) {
        return { success: false, error: 'A network error occurred while sending the email.' };
    }
}

// --- NEW: Deactivate User Action ---
export async function deactivateUser(userId: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiKey = process.env.KORE_API_SECRET_KEY;
    try {
        const response = await fetch(`${apiUrl}?action=deactivate_user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey || ''
            },
            body: JSON.stringify({ userId })
        });
        const data = await response.json();
        if (data.error) return { error: data.error };
        return { success: true };
    } catch (error) {
        return { error: "Network error" };
    }
}

// --- NEW: Delete User Action ---
export async function deleteUser(userId: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiKey = process.env.KORE_API_SECRET_KEY;
    try {
        const response = await fetch(`${apiUrl}?action=delete_user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey || ''
            },
            body: JSON.stringify({ userId })
        });
        const data = await response.json();
        if (data.error) return { error: data.error };
        return { success: true };
    } catch (error) {
        return { error: "Network error" };
    }
}

export async function getAllTokens() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiKey = process.env.KORE_API_SECRET_KEY;
    try {
        const response = await fetch(`${apiUrl}?action=get_all_tokens`, {
            method: 'GET',
            headers: { 'x-api-key': apiKey || '' },
            cache: 'no-store'
        });
        const data = await response.json();
        return data.tokens || [];
    } catch (error) {
        return [];
    }
}

export async function deleteToken(tokenId: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiKey = process.env.KORE_API_SECRET_KEY;
    try {
        const response = await fetch(`${apiUrl}?action=delete_token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey || ''
            },
            body: JSON.stringify({ tokenId })
        });
        const data = await response.json();
        if (data.error) return { success: false, error: data.error };
        return { success: true };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}

// --- NEW: Edit User Action ---
export async function editUser(userData: { userId: string, name: string, email: string, phone: string, role: string, tier: string }) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiKey = process.env.KORE_API_SECRET_KEY;
    try {
        const response = await fetch(`${apiUrl}?action=edit_user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey || ''
            },
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        if (data.error) return { success: false, error: data.error };
        return { success: true };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}