'use server'

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const apiKey = process.env.KORE_API_SECRET_KEY;

export async function redeemInviteToken(formData: FormData) {
    const token = formData.get('token') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    try {
        const response = await fetch(`${apiUrl}?action=redeem_token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey || ''
            },
            body: JSON.stringify({ token, email, name }),
        });
        
        const data = await response.json();
        
        if (data.error) {
            return { error: data.error };
        }
        
        return { success: data.message };
    } catch (error) {
        return { error: 'A network error occurred while reaching the authentication server.' };
    }
}

export async function resend2FACode(email: string) {
  try {
    const response = await fetch(`${apiUrl}?action=resend_2fa_code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey || '' },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    return { success: !data.error, error: data.error, message: data.message };
  } catch (error) {
    return { success: false, error: "Network error while resending code." };
  }
}

// --- NEW: REQUEST PASSWORD RESET ---
export async function requestPasswordReset(email: string) {
    try {
      const response = await fetch(`${apiUrl}?action=forgot_password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey || '' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      return { success: !data.error, error: data.error, message: data.message };
    } catch (error) {
      return { success: false, error: "Network error while requesting reset." };
    }
}

// --- NEW: CONFIRM PASSWORD RESET ---
export async function resetPassword(email: string, code: string, newPassword: string) {
    try {
      const response = await fetch(`${apiUrl}?action=reset_password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey || '' },
        body: JSON.stringify({ email, code, newPassword })
      });
      
      const data = await response.json();
      return { success: !data.error, error: data.error, message: data.message };
    } catch (error) {
      return { success: false, error: "Network error while resetting password." };
    }
}