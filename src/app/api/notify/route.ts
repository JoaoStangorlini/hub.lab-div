import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Configure the Resend client with your API key from .env.local
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const adminEmail = process.env.ADMIN_EMAIL || 'joao@stangorlini.com'; // Fallback for safety

export async function POST(request: Request) {
    try {
        const { authors, title, category } = await request.json();

        // If Resend is not configured, we gracefully skip sending the email 
        // without breaking the submission flow for the user.
        if (!resend) {
            console.warn("RESEND_API_KEY is not defined. Email notification skipped.");
            return NextResponse.json({ success: true, warning: 'Email skipped, no API key' });
        }

        const emailTemplate = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #0b2e59;">Nova submissão pendente no Hub Lab-Div</h2>
        <p>Olá,</p>
        <p>Uma nova submissão acabou de ser enviada e requires sua aprovação no Painel Admin.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8fafc;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; width: 30%;">Autor(es):</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${authors}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Título do Trabalho:</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${title}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Categoria:</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${category}</td>
          </tr>
        </table>

        <div style="text-align: center; margin-top: 30px;">
          <a href="https://hub.lab-div.com/admin/perguntas" style="display: inline-block; padding: 12px 24px; background-color: #0b2e59; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Acessar Painel Admin
          </a>
        </div>
      </div>
    `;

        const data = await resend.emails.send({
            from: 'Hub Lab-Div <onboarding@resend.dev>', // You should verify a domain in Resend for production
            to: [adminEmail],
            subject: `Nova submissão pendente no Hub Lab-Div de ${authors}`,
            html: emailTemplate,
        });

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("Resend Email Notification Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
