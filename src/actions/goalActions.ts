'use server'

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const apiKey = process.env.KORE_API_SECRET_KEY;

export async function getUserGoals(userId: string) {
    try {
        const response = await fetch(`${apiUrl}?action=get_user_goals&userId=${userId}`, {
            method: 'GET',
            headers: { 'x-api-key': apiKey || '' },
            cache: 'no-store'
        });
        const data = await response.json();
        return data.goals || [];
    } catch (error) {
        return [];
    }
}

export async function createGoal(goalData: any) {
    try {
        const response = await fetch(`${apiUrl}?action=create_goal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey || '' },
            body: JSON.stringify(goalData)
        });
        const data = await response.json();
        return { success: !data.error, error: data.error };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}

export async function updateGoal(goalData: any) {
    try {
        const response = await fetch(`${apiUrl}?action=update_goal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey || '' },
            body: JSON.stringify(goalData)
        });
        const data = await response.json();
        return { success: !data.error, error: data.error };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}

export async function fundGoal(fundData: { userId: string, goalId: string, accountId: string, amount: number }) {
    try {
        const response = await fetch(`${apiUrl}?action=fund_goal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey || '' },
            body: JSON.stringify(fundData)
        });
        const data = await response.json();
        return { success: !data.error, error: data.error, newBalance: data.newBalance };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}

export async function deleteGoal(goalId: string, userId: string) {
    try {
        const response = await fetch(`${apiUrl}?action=delete_goal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey || '' },
            body: JSON.stringify({ goalId, userId })
        });
        const data = await response.json();
        return { success: !data.error, error: data.error };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}