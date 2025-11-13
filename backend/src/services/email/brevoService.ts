import * as brevo from '@getbrevo/brevo';
import { Logger } from '../../utils/logger';

export interface EmailData {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export interface VerificationEmailData {
  to: string;
  name: string;
  verificationLink: string;
}

export interface PasswordRecoveryEmailData {
  to: string;
  name: string;
  recoveryLink: string;
}

export class BrevoService {
  private apiInstance: brevo.TransactionalEmailsApi;
  private sender: brevo.SendSmtpEmailSender;

  constructor() {
    // Configurar la API de Brevo
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      Logger.error('BREVO_API_KEY no está configurada');
      throw new Error('BREVO_API_KEY no está configurada');
    }

    // Configurar la autenticación de Brevo
    this.apiInstance = new brevo.TransactionalEmailsApi();
    this.apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

    // Configurar el remitente
    this.sender = {
      email: process.env.BREVO_SENDER_EMAIL || 'noreply@lubricentro.com',
      name: process.env.BREVO_SENDER_NAME || 'Lubricentro'
    };

    Logger.info('BrevoService inicializado correctamente', {
      senderEmail: this.sender.email,
      senderName: this.sender.name
    });
  }

  /**
   * Envía un email genérico
   */
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      Logger.info('Iniciando envío de email', {
        to: emailData.to,
        subject: emailData.subject
      });

      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.sender = this.sender;
      sendSmtpEmail.to = [{ email: emailData.to }];
      sendSmtpEmail.subject = emailData.subject;
      sendSmtpEmail.htmlContent = emailData.htmlContent;
      
      if (emailData.textContent) {
        sendSmtpEmail.textContent = emailData.textContent;
      }

      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      
      Logger.info('Email enviado exitosamente', {
        to: emailData.to,
        subject: emailData.subject,
        responseId: response.body?.messageId
      });
      
      return true;
    } catch (error) {
      Logger.error('Error enviando email', {
        to: emailData.to,
        subject: emailData.subject,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      return false;
    }
  }

  /**
   * Envía email de verificación
   */
  async sendVerificationEmail(data: VerificationEmailData): Promise<boolean> {
    Logger.info('Enviando email de verificación', {
      to: data.to,
      name: data.name
    });

    const htmlContent = this.getVerificationEmailTemplate(data);
    const textContent = this.getVerificationEmailTextTemplate(data);

    const success = await this.sendEmail({
      to: data.to,
      subject: 'Verifica tu cuenta - Lubricentro',
      htmlContent,
      textContent
    });

    if (success) {
      Logger.info('Email de verificación enviado exitosamente', {
        to: data.to,
        name: data.name
      });
    } else {
      Logger.error('Falló el envío del email de verificación', {
        to: data.to,
        name: data.name
      });
    }

    return success;
  }

  /**
   * Envía email de recuperación de contraseña
   */
  async sendPasswordRecoveryEmail(data: PasswordRecoveryEmailData): Promise<boolean> {
    Logger.info('Enviando email de recuperación de contraseña', {
      to: data.to,
      name: data.name
    });

    const htmlContent = this.getPasswordRecoveryEmailTemplate(data);
    const textContent = this.getPasswordRecoveryEmailTextTemplate(data);

    const success = await this.sendEmail({
      to: data.to,
      subject: 'Recuperar contraseña - Lubricentro',
      htmlContent,
      textContent
    });

    if (success) {
      Logger.info('Email de recuperación enviado exitosamente', {
        to: data.to,
        name: data.name
      });
    } else {
      Logger.error('Falló el envío del email de recuperación', {
        to: data.to,
        name: data.name
      });
    }

    return success;
  }

  /**
   * Template HTML para email de verificación
   */
  private getVerificationEmailTemplate(data: VerificationEmailData): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verifica tu cuenta</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #2c3e50;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .button {
            display: inline-block;
            background-color: #3498db;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>¡Bienvenido a nuestro Lubricentro!</h1>
        </div>
        <div class="content">
          <h2>Hola ${data.name},</h2>
          <p>Gracias por registrarte en nuestro sistema. Para completar tu registro y activar tu cuenta, necesitas verificar tu dirección de email.</p>
          
          <p>Haz clic en el siguiente botón para verificar tu cuenta:</p>
          
          <a href="${data.verificationLink}" class="button">Verificar mi cuenta</a>
          
          <p>Si el botón no funciona, puedes copiar y pegar el siguiente enlace en tu navegador:</p>
          <p style="word-break: break-all; background-color: #e9ecef; padding: 10px; border-radius: 4px;">
            ${data.verificationLink}
          </p>
          
          <p><strong>Importante:</strong> Este enlace expira en 24 horas por seguridad.</p>
          
          <p>Si no creaste esta cuenta, puedes ignorar este email.</p>
        </div>
        <div class="footer">
          <p>Este es un email automático, por favor no respondas a este mensaje.</p>
          <p>&copy; 2025 Lubricentro Renault. Todos los derechos reservados.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template de texto plano para email de verificación
   */
  private getVerificationEmailTextTemplate(data: VerificationEmailData): string {
    return `
      ¡Bienvenido a nuestro Lubricentro!
      
      Hola ${data.name},
      
      Gracias por registrarte en nuestro sistema. Para completar tu registro y activar tu cuenta, necesitas verificar tu dirección de email.
      
      Haz clic en el siguiente enlace para verificar tu cuenta:
      ${data.verificationLink}
      
      Importante: Este enlace expira en 24 horas por seguridad.
      
      Si no creaste esta cuenta, puedes ignorar este email.
      
      Este es un email automático, por favor no respondas a este mensaje.
      
      © 2025 Lubricentro Renault. Todos los derechos reservados.
    `;
  }

  /**
   * Template HTML para email de recuperación de contraseña
   */
  private getPasswordRecoveryEmailTemplate(data: PasswordRecoveryEmailData): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperar contraseña</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #e74c3c;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .button {
            display: inline-block;
            background-color: #e74c3c;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #666;
          }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Recuperar Contraseña</h1>
        </div>
        <div class="content">
          <h2>Hola ${data.name},</h2>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
          
          <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
          
          <a href="${data.recoveryLink}" class="button">Restablecer Contraseña</a>
          
          <p>Si el botón no funciona, puedes copiar y pegar el siguiente enlace en tu navegador:</p>
          <p style="word-break: break-all; background-color: #e9ecef; padding: 10px; border-radius: 4px;">
            ${data.recoveryLink}
          </p>
          
          <div class="warning">
            <p><strong>Importante:</strong></p>
            <ul>
              <li>Este enlace expira en 1 hora por seguridad</li>
              <li>Si no solicitaste este cambio, ignora este email</li>
              <li>Tu contraseña actual seguirá siendo válida hasta que la cambies</li>
            </ul>
          </div>
          
          <p>Si no solicitaste este cambio, puedes ignorar este email de forma segura.</p>
        </div>
        <div class="footer">
          <p>Este es un email automático, por favor no respondas a este mensaje.</p>
          <p>&copy; 2025 Lubricentro Renault. Todos los derechos reservados.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template de texto plano para email de recuperación de contraseña
   */
  private getPasswordRecoveryEmailTextTemplate(data: PasswordRecoveryEmailData): string {
    return `
      Recuperar Contraseña - Lubricentro
      
      Hola ${data.name},
      
      Recibimos una solicitud para restablecer la contraseña de tu cuenta.
      
      Haz clic en el siguiente enlace para crear una nueva contraseña:
      ${data.recoveryLink}
      
      IMPORTANTE:
      - Este enlace expira en 1 hora por seguridad
      - Si no solicitaste este cambio, ignora este email
      - Tu contraseña actual seguirá siendo válida hasta que la cambies
      
      Si no solicitaste este cambio, puedes ignorar este email de forma segura.
      
      Este es un email automático, por favor no respondas a este mensaje.
      
      © 2025 Lubricentro Renault. Todos los derechos reservados.
    `;
  }
}
