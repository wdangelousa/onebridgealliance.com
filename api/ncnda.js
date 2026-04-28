const ALLOWED_METHODS = ['POST'];

module.exports = async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');

    if (!ALLOWED_METHODS.includes(req.method)) {
        res.setHeader('Allow', ALLOWED_METHODS.join(', '));
        return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    }

    const webhookUrl = process.env.MAKE_NCNDA_WEBHOOK_URL;
    if (!webhookUrl) {
        return res.status(500).json({
            ok: false,
            error: 'Server misconfigured: MAKE_NCNDA_WEBHOOK_URL is not set.'
        });
    }

    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (_) { body = {}; }
    }
    body = body || {};

    const partnerName = String(body.partner_name || body.name || '').trim();
    const email = String(body.email || '').trim();
    const status = String(body.status || 'aceite_termo_digital').trim();

    if (!partnerName || !email) {
        return res.status(400).json({
            ok: false,
            error: 'Campos obrigatórios ausentes: partner_name e email.'
        });
    }

    const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailLooksValid) {
        return res.status(400).json({ ok: false, error: 'E-mail inválido.' });
    }

    const payload = {
        partner_name: partnerName,
        email,
        status,
        submitted_at: new Date().toISOString(),
        source: 'onebridge-website'
    };

    try {
        const upstream = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!upstream.ok) {
            const text = await upstream.text().catch(() => '');
            console.error('[/api/ncnda] webhook upstream failed', upstream.status, text);
            return res.status(502).json({
                ok: false,
                error: 'Falha ao registrar adesão no provedor de automação.'
            });
        }

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error('[/api/ncnda] unexpected error', err);
        return res.status(500).json({
            ok: false,
            error: 'Erro inesperado ao processar a adesão.'
        });
    }
};
