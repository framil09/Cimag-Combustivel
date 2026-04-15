import nodemailer from 'nodemailer'
import crypto from 'crypto'

export function generatePassword(length = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  const bytes = crypto.randomBytes(length)
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars[bytes[i] % chars.length]
  }
  return password
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendWelcomeEmail(to: string, name: string, password: string) {
  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"CIMAG Sistema" <noreply@cimag.com>',
    to,
    subject: 'CIMAG - Suas credenciais de acesso',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(to right, #0D3640, #2A7A8A); padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">CIMAG</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0; font-size: 14px;">Controle de KM e Combustível</p>
        </div>
        <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
          <p style="color: #374151;">Olá <strong>${name}</strong>,</p>
          <p style="color: #374151;">Sua conta foi criada no sistema CIMAG. Use as credenciais abaixo para acessar:</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 4px 0; color: #374151;"><strong>Email:</strong> ${to}</p>
            <p style="margin: 4px 0; color: #374151;"><strong>Senha:</strong> ${password}</p>
          </div>
          <a href="${appUrl}/login" style="display: inline-block; background: linear-gradient(to right, #0D3640, #2A7A8A); color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Acessar o Sistema</a>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">Recomendamos que altere sua senha após o primeiro acesso.</p>
        </div>
      </div>
    `,
  })
}
