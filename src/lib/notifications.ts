import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const adminEmail = process.env.ADMIN_EMAIL || 'joao@stangorlini.com';

export type NotificationType = 'submission' | 'question' | 'comment' | 'reproduction';

interface NotificationData {
    type: NotificationType;
    authors?: string;
    title?: string;
    category?: string;
    question?: string;
    userName?: string;
    content?: string;
    submissionTitle?: string;
}

export async function sendAdminNotification(data: NotificationData) {
    if (!resend) {
        console.warn("RESEND_API_KEY is not defined. Email notification skipped.");
        return { success: true, warning: 'Email skipped, no API key' };
    }

    let subject = '';
    let emailTemplate = '';
    let dashboardLink = 'https://hub-labdiv--hub-lab-div-f7f28.us-east4.hosted.app/admin';

    switch (data.type) {
        case 'submission':
            subject = `Nova submissão pendente: ${data.title}`;
            dashboardLink = 'https://hub.lab-div.com/admin/perguntas'; // FormStep.tsx suggest this link
            emailTemplate = `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #0b2e59;">Nova submissão pendente no Hub Lab-Div</h2>
                    <p>Uma nova submissão foi enviada para moderação.</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8fafc;">
                        <tr><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Autor(es):</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${data.authors}</td></tr>
                        <tr><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Título:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${data.title}</td></tr>
                        <tr><td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Categoria:</td><td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${data.category}</td></tr>
                    </table>
                </div>`;
            break;

        case 'question':
            subject = `Nova pergunta de ${data.userName}`;
            dashboardLink = 'https://hub-labdiv--hub-lab-div-f7f28.us-east4.hosted.app/admin/perguntas';
            emailTemplate = `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #0b2e59;">Nova pergunta: Pergunte a um Cientista</h2>
                    <p><strong>De:</strong> ${data.userName}</p>
                    <p><strong>Pergunta:</strong> ${data.question}</p>
                </div>`;
            break;

        case 'comment':
            subject = `Novo comentário pendente: ${data.userName}`;
            dashboardLink = 'https://hub.lab-div.com/admin';
            emailTemplate = `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #0b2e59;">Novo comentário pendente</h2>
                    <p><strong>Autor:</strong> ${data.userName}</p>
                    <p><strong>No material:</strong> ${data.submissionTitle}</p>
                    <p><strong>Conteúdo:</strong> ${data.content}</p>
                </div>`;
            break;

        case 'reproduction':
            subject = `Nova reprodução pendente: ${data.userName}`;
            dashboardLink = 'https://hub.lab-div.com/admin';
            emailTemplate = `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #0b2e59;">Nova reprodução: Eu Reproduzi!</h2>
                    <p><strong>Autor:</strong> ${data.userName}</p>
                    <p><strong>No material:</strong> ${data.submissionTitle}</p>
                    <p><strong>Relato:</strong> ${data.content}</p>
                </div>`;
            break;
    }

    const finalHtml = `
        ${emailTemplate}
        <div style="text-align: center; margin-top: 30px;">
            <a href="${dashboardLink}" style="display: inline-block; padding: 12px 24px; background-color: #0b2e59; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Acessar Painel Admin
            </a>
        </div>
    `;

    try {
        const result = await resend.emails.send({
            from: 'Hub Lab-Div <onboarding@resend.dev>',
            to: [adminEmail],
            subject: subject,
            html: finalHtml,
        });
        return { success: true, result };
    } catch (error: any) {
        console.error("Resend error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Helper to trigger a notification from the client side.
 * This should be used instead of raw fetch calls to /api/notify.
 */
export async function triggerNotification(data: NotificationData) {
    try {
        const response = await fetch('/api/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error("Client-side notification error:", error);
        return { success: false, error: 'Failed to reach notification API' };
    }
}
