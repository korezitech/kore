'use server'

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const apiKey = process.env.KORE_API_SECRET_KEY;

export async function getUserLoans(userId: string) {
    try {
        const response = await fetch(`${apiUrl}?action=get_user_loans&userId=${userId}`, {
            method: 'GET',
            headers: { 'x-api-key': apiKey || '' },
            cache: 'no-store'
        });
        const data = await response.json();
        return data.loans || [];
    } catch (error) {
        return [];
    }
}

export async function getLoanHistory(userId: string, loanId: string) {
    try {
        const response = await fetch(`${apiUrl}?action=get_loan_history&userId=${userId}&loanId=${loanId}`, {
            method: 'GET',
            headers: { 'x-api-key': apiKey || '' },
            cache: 'no-store'
        });
        const data = await response.json();
        return data.history || [];
    } catch (error) {
        return [];
    }
}

export async function createLoan(loanData: any) {
    try {
        const response = await fetch(`${apiUrl}?action=create_loan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey || '' },
            body: JSON.stringify(loanData)
        });
        const data = await response.json();
        return { success: !data.error, error: data.error };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}

export async function processLoanPayment(paymentData: { userId: string, loanId: string, accountId: string, amount: number }) {
    try {
        const response = await fetch(`${apiUrl}?action=process_loan_payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey || '' },
            body: JSON.stringify(paymentData)
        });
        const data = await response.json();
        return { success: !data.error, error: data.error, newBalance: data.newBalance };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}

export async function updateLoan(loanData: any) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiKey = process.env.KORE_API_SECRET_KEY;
    try {
        const response = await fetch(`${apiUrl}?action=update_loan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey || '' },
            body: JSON.stringify(loanData)
        });
        const data = await response.json();
        return { success: !data.error, error: data.error };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}

export async function deleteLoan(loanId: string, userId: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiKey = process.env.KORE_API_SECRET_KEY;
    try {
        const response = await fetch(`${apiUrl}?action=delete_loan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey || '' },
            body: JSON.stringify({ loanId, userId })
        });
        const data = await response.json();
        return { success: !data.error, error: data.error };
    } catch (error) {
        return { success: false, error: "Network error" };
    }
}