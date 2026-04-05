'use server'

export async function redeemInviteToken(formData: FormData) {
    const token = formData.get('token') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiKey = process.env.KORE_API_SECRET_KEY;

    try {
        const response = await fetch(`${apiUrl}/tokens/redeem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey || '',
            },
            body: JSON.stringify({ token, name, email }),
        });

        const data = await response.json();

        if (!response.ok) {
            return { error: data.error || 'Failed to redeem token.' };
        }

        return { success: data.message };
    } catch (error) {
        console.error("Redeem token error:", error);
        return { error: 'A network error occurred. Please try again.' };
    }
}