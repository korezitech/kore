'use server'

export async function redeemInviteToken(formData: FormData) {
    const token = formData.get('token') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    try {
        // Pointing directly to our new PHP verification script on Hostinger
        const response = await fetch('https://api.korefinanceapp.com/api/verify_token.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // PHP is expecting the body to contain token and email
            body: JSON.stringify({ token, email, name }),
        });
        
        const data = await response.json();
        
        // Our PHP script returns a JSON object with a "status" key
        if (data.status === 'error' || !response.ok) {
            return { error: data.message || 'Failed to redeem token.' };
        }
        
        return { success: data.message };
    } catch (error) {
        return { error: 'A network error occurred while reaching the authentication server.' };
    }
}