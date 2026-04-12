'use server'

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const apiKey = process.env.KORE_API_SECRET_KEY;

export async function getRecycledItems(userId: string) {
    try {
        const response = await fetch(`${apiUrl}?action=get_recycled_items&userId=${userId}`, {
            method: 'GET',
            headers: { 'x-api-key': apiKey || '' },
            cache: 'no-store'
        });
        const data = await response.json();
        return data.items || [];
    } catch (error) {
        console.error("Fetch recycle bin error:", error);
        return [];
    }
}

export async function restoreItem(itemId: string, itemType: string, userId: string) {
    try {
        const response = await fetch(`${apiUrl}?action=restore_item`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey || ''
            },
            body: JSON.stringify({ itemId, itemType, userId })
        });
        const data = await response.json();
        return { success: !data.error, error: data.error };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}

export async function permanentDeleteItem(itemId: string, itemType: string, userId: string) {
    try {
        const response = await fetch(`${apiUrl}?action=permanent_delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey || ''
            },
            body: JSON.stringify({ itemId, itemType, userId })
        });
        const data = await response.json();
        return { success: !data.error, error: data.error };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}

export async function emptyRecycleBin(userId: string) {
    try {
        const response = await fetch(`${apiUrl}?action=empty_recycle_bin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey || ''
            },
            body: JSON.stringify({ userId })
        });
        const data = await response.json();
        return { success: !data.error, error: data.error };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}