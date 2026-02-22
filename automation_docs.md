# Automação de Onboarding (Make.com)

Este documento descreve o fluxo de automação e o template de e-mail "High-Ticket" para o novo processo de adesão simplificado.

## 1. Fluxo no Make.com

**Cenário:** `Portal Onboarding -> Welcome Email`

1.  **Módulo Webhook (Custom Webhook):**
    *   **URL:** `https://hook.us2.make.com/wpwban74ivy8vym5i8osgvgbwpf3t5sw`
    *   **Payload esperado:**
        ```json
        {
          "partner_name": "João Silva",
          "email": "joao@firma.com",
          "status": "aceite_termo_digital"
        }
        ```
2.  **Módulo Gmail / Email (Send an Email):**
    *   **To:** `{{email}}`
    *   **Subject:** 🤝 Bem-vindo à Aliança Onebridge Stalwart | Operação Ativa
    *   **Content:** HTML (veja abaixo)

---

## 2. Template de E-mail (High-Ticket HTML)

Este template foi desenhado para transmitir autoridade, exclusividade e profissionalismo.

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f9f9f9; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { font-size: 24px; font-weight: bold; color: #000; letter-spacing: 1px; }
        .brand-green { color: #1ED697; }
        .content h1 { font-size: 22px; margin-bottom: 20px; font-weight: 700; color: #0b131a; }
        .content p { margin-bottom: 20px; font-size: 16px; color: #444; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 13px; color: #888; text-align: center; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #0b131a; color: #fff !important; text-decoration: none; border-radius: 4px; font-weight: 600; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">ONEBRIDGE <span class="brand-green">STALWART</span></div>
        </div>
        <div class="content">
            <h1>Prezado(a) {{partner_name}},</h1>
            <p>É com satisfação que confirmamos o recebimento do seu aceite digital. A partir deste momento, a aliança estratégica entre sua firma e a <strong>Onebridge Stalwart</strong> está formalmente ativa.</p>
            <p>Nossa infraestrutura em Orlando já está posicionada para atuar como seu back-office técnico, garantindo que suas operações nos EUA ocorram com precisão cirúrgica e blindagem absoluta.</p>
            <p><strong>Próximo Passo Imediato:</strong><br>
            Para iniciarmos a integração técnica e liberação das tabelas wholesale, por favor, agende seu <strong>Briefing Tático</strong> com nossa diretoria operacional clicando no botão abaixo:</p>
            <p style="text-align: center;">
                <a href="https://wa.me/14078219738" class="btn">Agendar Briefing por WhatsApp</a>
            </p>
            <p>Seja bem-vindo ao ecossistema invisível que move os grandes capitais.</p>
            <p>Atenciosamente,</p>
            <p><strong>Board of Directors</strong><br>
            Onebridge Stalwart LLC | Orlando, FL</p>
        </div>
        <div class="footer">
            Este é um e-mail confidencial enviado automaticamente após o aceite do Termo de Adesão B2B.
        </div>
    </div>
</body>
</html>
```
