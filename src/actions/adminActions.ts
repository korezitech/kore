'use server'

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const apiKey = process.env.KORE_API_SECRET_KEY;

export async function getPendingUsers() {
    try {
        const response = await fetch(`${apiUrl}/admin/users/pending`, {
            method: 'GET',
            headers: { 'x-api-key': apiKey || '' },
            cache: 'no-store' // Always fetch fresh data
        });
        const data = await response.json();
        return data.pendingUsers || [];
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return [];
    }
}

export async function generateNewToken() {
    try {
        const response = await fetch(`${apiUrl}/tokens/generate`, {
            method: 'POST',
            headers: { 'x-api-key': apiKey || '' }
        });
        const data = await response.json();
        return data.token || null;
    } catch (error) {
        console.error("Failed to generate token:", error);
        return null;
    }
}

export async function activatePendingUser(userId: string) {
    try {
        const response = await fetch(`${apiUrl}/admin/users/activate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey || ''
            },
            body: JSON.stringify({ userId })
        });
        return await response.json();
    } catch (error) {
        console.error("Failed to activate user:", error);
        return { error: "Network error" };
    }
}