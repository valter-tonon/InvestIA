import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { INotificationService } from '../../domain/interfaces/notification.interface';

@Injectable()
export class EmailNotificationService implements INotificationService {
    private readonly logger = new Logger(EmailNotificationService.name);
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
            port: Number(process.env.SMTP_PORT) || 2525,
            auth: {
                user: process.env.SMTP_USER || '',
                pass: process.env.SMTP_PASS || '',
            },
        });
    }

    async sendPriceAlert(
        userEmail: string,
        userName: string,
        assetTicker: string,
        currentPrice: number,
        targetPrice: number,
        condition: string,
    ): Promise<void> {
        const conditionText = condition === 'ABOVE' ? 'acima de' : condition === 'BELOW' ? 'abaixo de' : 'igual a';

        // Simple HTML template
        const html = `
      <h1>🔔 Alerta de Preço - InvestIA</h1>
      <p>Olá, <strong>${userName}</strong>!</p>
      
      <p>O ativo <strong>${assetTicker}</strong> atingiu sua condição de alerta.</p>
      
      <ul>
        <li><strong>Preço Atual:</strong> R$ ${currentPrice.toFixed(2)}</li>
        <li><strong>Condição:</strong> ${conditionText} R$ ${targetPrice.toFixed(2)}</li>
      </ul>
      
      <p>Acesse o dashboard para mais detalhes.</p>
    `;

        try {
            if (process.env.NODE_ENV === 'test' || !process.env.SMTP_USER) {
                this.logger.log(`[MOCK EMAIL] To: ${userEmail} | Asset: ${assetTicker} | Price: ${currentPrice}`);
                return;
            }

            await this.transporter.sendMail({
                from: '"InvestIA Alertas" <alerts@investia.com>',
                to: userEmail,
                subject: `🔔 Alerta: ${assetTicker} atingiu o alvo!`,
                html,
            });

            this.logger.log(`Email sent to ${userEmail} for asset ${assetTicker}`);
        } catch (error) {
            this.logger.error(`Failed to send email to ${userEmail}: ${error.message}`);
        }
    }
}
