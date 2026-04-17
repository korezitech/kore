'use server'

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const apiKey = process.env.KORE_API_SECRET_KEY;

export async function getProfile(userId: string) {
    try {
        const response = await fetch(`${apiUrl}?action=get_profile&userId=${userId}`, {
            method: 'GET',
            headers: { 'x-api-key': apiKey || '' },
            cache: 'no-store'
        });
        const data = await response.json();
        return data.profile || null;
    } catch (error) {
        console.error("Failed to fetch profile:", error);
        return null;
    }
}

export async function updateProfile(profileData: any) {
    try {
        const response = await fetch(`${apiUrl}?action=update_profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey || '' },
            body: JSON.stringify(profileData)
        });
        const data = await response.json();
        return { success: !data.error, error: data.error };
    } catch (error) {
        return { success: false, error: "Network error while saving profile." };
    }
}

export async function updatePassword(passwordData: any) {
    try {
        const response = await fetch(`${apiUrl}?action=update_password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey || '' },
            body: JSON.stringify(passwordData)
        });
        const data = await response.json();
        return { success: !data.error, error: data.error };
    } catch (error) {
        return { success: false, error: "Network error while updating password." };
    }
}

export async function deleteAccount(userId: string) {
    try {
        const response = await fetch(`${apiUrl}?action=delete_user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey || '' },
            body: JSON.stringify({ userId })
        });
        const data = await response.json();
        return { success: !data.error, error: data.error };
    } catch (error) {
        return { success: false, error: "Network error while deleting account." };
    }
}

export async function sendWeeklySummary(userId: string) {
    try {
        const response = await fetch(`${apiUrl}?action=send_weekly_summary`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey || '' },
            body: JSON.stringify({ userId })
        });
        const data = await response.json();
        return { success: !data.error, error: data.error, message: data.message };
    } catch (error) {
        return { success: false, error: "Network error while sending email." };
    }
}