import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const adminEmail = process.env.ADMIN_EMAIL || 'joaopaulostangorlini@usp.br';

export type NotificationType = 'submission' | 'question' | 'comment' | 'profile_update' | 'bug_report';

interface NotificationData {
    type: NotificationType;
    authors?: string;
    title?: string;
    category?: string;
    question?: string;
    userName?: string;
    content?: string;
    submissionTitle?: string;
    details?: string;
    url?: string;
}

export async function sendAdminNotification(data: NotificationData) {
    if (!resend) {
        console.warn("RESEND_API_KEY is not defined. Email notification skipped.");
        return { success: true, warning: 'Email skipped, no API key' };
    }

    let subject = '';
    let emailTemplate = '';
    let dashboardLink = 'https://hub.labdiv.if.usp.br/admin';

    switch (data.type) {
        case 'submission':
            subject = `📦 Hub: Nova Submissão - ${data.title}`;
            dashboardLink = 'https://hub.labdiv.if.usp.br/admin/acervo';
            emailTemplate = `
                <h2 style="color: #1a1a1a; margin-top: 0; font-size: 20px;">Nova submissão aguardando análise</h2>
                <p style="color: #4a5568; line-height: 1.6; font-size: 15px;">Um novo material científico foi submetido ao Hub e precisa da sua aprovação.</p>
                <div style="background-color: #f8fafc; border-left: 4px solid #3B82F6; padding: 16px; margin: 24px 0; border-radius: 4px;">
                    <p style="margin: 0 0 8px 0; font-size: 14px;"><strong style="color: #1a1a1a;">Autor(es):</strong> <span style="color: #4a5568;">${data.authors}</span></p>
                    <p style="margin: 0 0 8px 0; font-size: 14px;"><strong style="color: #1a1a1a;">Título:</strong> <span style="color: #4a5568;">${data.title}</span></p>
                    <p style="margin: 0; font-size: 14px;"><strong style="color: #1a1a1a;">Categoria:</strong> <span style="color: #4a5568;">${data.category}</span></p>
                </div>`;
            break;

        case 'question':
            subject = `❓ Hub: Pergunta de ${data.userName}`;
            dashboardLink = 'https://hub.labdiv.if.usp.br/admin/perguntas';
            emailTemplate = `
                <h2 style="color: #1a1a1a; margin-top: 0; font-size: 20px;">Nova Pergunta Científica</h2>
                <p style="color: #4a5568; line-height: 1.6; font-size: 15px;">O usuário <strong>${data.userName}</strong> enviou uma nova dúvida.</p>
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; margin: 24px 0; border-radius: 8px; font-style: italic; color: #2d3748;">
                    "${data.question}"
                </div>`;
            break;

        case 'comment':
            subject = `💬 Hub: Comentário de ${data.userName}`;
            dashboardLink = 'https://hub.labdiv.if.usp.br/admin';
            emailTemplate = `
                <h2 style="color: #1a1a1a; margin-top: 0; font-size: 20px;">Novo Comentário</h2>
                <p style="color: #4a5568; line-height: 1.6; font-size: 15px;">O usuário <strong>${data.userName}</strong> comentou no material <strong>${data.submissionTitle}</strong>.</p>
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; margin: 24px 0; border-radius: 8px; font-style: italic; color: #2d3748;">
                    "${data.content}"
                </div>`;
            break;

        case 'profile_update':
            subject = `👤 Hub: Atualização de Perfil - ${data.userName}`;
            dashboardLink = 'https://hub.labdiv.if.usp.br/admin/papeis';
            emailTemplate = `
                <h2 style="color: #1a1a1a; margin-top: 0; font-size: 20px;">Perfil Editado</h2>
                <p style="color: #4a5568; line-height: 1.6; font-size: 15px;">O usuário <strong>${data.userName}</strong> atualizou suas informações de perfil e aguarda revisão.</p>
                <div style="background-color: #f8fafc; border-left: 4px solid #FFB300; padding: 16px; margin: 24px 0; border-radius: 4px;">
                    <p style="margin: 0; font-size: 14px;"><strong style="color: #1a1a1a;">Usuário:</strong> <span style="color: #4a5568;">${data.userName}</span></p>
                </div>`;
            break;

        case 'bug_report':
            subject = `🚨 Hub: Report de Bug - ${data.userName || 'Anônimo'}`;
            dashboardLink = 'https://hub.labdiv.if.usp.br/admin/reports';
            emailTemplate = `
                <h2 style="color: #1a1a1a; margin-top: 0; font-size: 20px;">Anomalia Reportada (Bug/Feedback)</h2>
                <p style="color: #4a5568; line-height: 1.6; font-size: 15px;">Um novo report foi enviado através do módulo de emergência.</p>
                <div style="background-color: #FEF2F2; border: 1px solid #FEE2E2; padding: 20px; margin: 24px 0; border-radius: 8px; color: #991B1B;">
                    <strong style="display: block; margin-bottom: 8px; text-transform: uppercase; font-size: 12px;">Descrição:</strong>
                    "${data.content}"
                </div>
                <p style="font-size: 12px; color: #718096;">URL: ${data.url || 'N/A'}</p>`;
            break;
    }

    const finalHtml = `
        <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="background-color: #004282; padding: 32px 24px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">LAB-DIV HUB</h1>
                <p style="color: #8bb8e8; margin: 6px 0 0 0; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">Instituto de Física | USP</p>
            </div>
            <div style="padding: 40px 32px; background-color: #ffffff;">
                ${emailTemplate}
                <div style="text-align: center; margin-top: 48px;">
                    <a href="${dashboardLink}" style="display: inline-block; padding: 14px 32px; background-color: #004282; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; box-shadow: 0 4px 6px rgba(0,66,130,0.2);">
                        Acessar Painel Central
                    </a>
                </div>
            </div>
            <div style="background-color: #f8f9fa; padding: 24px; text-align: center; border-top: 1px solid #eaeaea;">
                <p style="color: #6c757d; margin: 0; font-size: 12px; line-height: 1.5;">Este é um e-mail automático enviado pelo Hub de Comunicação Científica do Lab-Div.<br>Por favor, não responda diretamente a este endereço.</p>
            </div>
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
