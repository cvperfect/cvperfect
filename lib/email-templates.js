// STEP 12: Email templates for post-payment confirmations
export const getPaymentConfirmationTemplate = (email, plan, amount, sessionId) => {
  const planNames = {
    'basic': 'Basic',
    'gold': 'Gold', 
    'premium': 'Premium'
  }
  
  const planName = planNames[plan] || plan
  const recoveryUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/success?session_id=${sessionId}`
  
  return {
    subject: `✅ Płatność potwierdzona - Plan ${planName} | CVPerfect.pl`,
    
    html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Potwierdzenie płatności - CVPerfect.pl</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0; font-size: 24px;">CVPerfect.pl</h1>
        <p style="color: #666; margin: 5px 0 0 0;">Profesjonalna optymalizacja CV</p>
    </div>

    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 30px; text-align: center;">
        <h2 style="margin: 0 0 10px 0; font-size: 20px;">🎉 Płatność potwierdzona!</h2>
        <p style="margin: 0; opacity: 0.9;">Dziękujemy za wybór planu ${planName}</p>
    </div>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #1e293b;">Szczegóły zamówienia:</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Plan:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">${planName}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Email:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">${email}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><strong>Kwota:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">${amount} PLN</td>
            </tr>
            <tr>
                <td style="padding: 8px 0;"><strong>Data:</strong></td>
                <td style="padding: 8px 0; text-align: right;">${new Date().toLocaleDateString('pl-PL')}</td>
            </tr>
        </table>
    </div>

    <div style="text-align: center; margin: 30px 0;">
        <a href="${recoveryUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            📄 Zobacz swoje zoptymalizowane CV
        </a>
    </div>

    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #92400e;"><strong>💡 Ważne:</strong> Zapisz ten email - zawiera link do Twojego CV który będzie aktywny przez 48 godzin.</p>
    </div>

    <div style="border-top: 2px solid #e2e8f0; padding-top: 20px; margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
        <p>W razie problemów z dostępem do CV, skontaktuj się z nami:</p>
        <p>📧 <a href="mailto:support@cvperfect.pl" style="color: #2563eb;">support@cvperfect.pl</a></p>
        <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
            CVPerfect.pl - Profesjonalna optymalizacja CV<br>
            Ten email został wysłany automatycznie po potwierdzeniu płatności.
        </p>
    </div>

</body>
</html>`,

    text: `
CVPerfect.pl - Potwierdzenie płatności

🎉 Płatność potwierdzona!

Dziękujemy za wybór planu ${planName}.

Szczegóły zamówienia:
- Plan: ${planName}
- Email: ${email} 
- Kwota: ${amount} PLN
- Data: ${new Date().toLocaleDateString('pl-PL')}

📄 Link do Twojego zoptymalizowanego CV:
${recoveryUrl}

💡 Ważne: Zapisz ten email - zawiera link do Twojego CV który będzie aktywny przez 48 godzin.

W razie problemów z dostępem do CV, skontaktuj się z nami:
📧 support@cvperfect.pl

--
CVPerfect.pl - Profesjonalna optymalizacja CV
Ten email został wysłany automatycznie po potwierdzeniu płatności.
`
  }
}