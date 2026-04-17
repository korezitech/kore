'use server'

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const apiKey = process.env.KORE_API_SECRET_KEY;

export async function getNotifications(userId: string, limit: number = 50) {
    try {
        const response = await fetch(`${apiUrl}?action=get_notifications&userId=${userId}&limit=${limit}`, {
            method: 'GET',
            headers: { 'x-api-key': apiKey || '' },
            cache: 'no-store'
        });
        const data = await response.json();
        return data.notifications || [];
    } catch (error) {
        console.error("Failed to fetch notifications:", error);
        return [];
    }
}

export async function markNotificationsRead(userId: string, notificationId: string = 'all') {
    try {
        const response = await fetch(`${apiUrl}?action=mark_notifications_read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey || '' },
            body: JSON.stringify({ userId, notificationId })
        });
        const data = await response.json();
        return { success: !data.error, error: data.error };
    } catch (error) {
        return { success: false, error: "Network error while marking read." };
    }
}

export async function deleteNotifications(userId: string, notificationId: string = 'all') {
    try {
        const response = await fetch(`${apiUrl}?action=delete_notifications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey || '' },
            body: JSON.stringify({ userId, notificationId })
        });
        const data = await response.json();
        return { success: !data.error, error: data.error };
    } catch (error) {
        return { success: false, error: "Network error while deleting." };
    }
}

// Development helper to trigger a test notification
export async function createTestNotification(userId: string) {
    try {
        const response = await fetch(`${apiUrl}?action=create_test_notification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey || '' },
            body: JSON.stringify({ userId })
        });
        const data = await response.json();
        return { success: !data.error, error: data.error };
    } catch (error) {
        return { success: false, error: "Network error while creating test notification." };
    }
}