const ALLOWED_METHODS = ['POST'];

module.exports = async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');

    if (!ALLOWED_METHODS.includes(req.method)) {
        res.setHeader('Allow', ALLOWED_METHODS.join(', '));
        return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    }

    const apiKey = process.env.SIGNWELL_API_KEY;
    const defaultTemplateId = process.env.SIGNWELL_TEMPLATE_ID;
    if (!apiKey) {
        return res.status(500).json({
            ok: false,
            error: 'Server misconfigured: SIGNWELL_API_KEY is not set.'
        });
    }

    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (_) { body = {}; }
    }
    body = body || {};

    const templateId = String(body.template_id || defaultTemplateId || '').trim();
    const partnerName = String(body.partner_name || body.name || '').trim();
    const partnerEmail = String(body.partner_email || body.email || '').trim();
    const partnerCompany = String(body.partner_company || body.company || '').trim();
    const partnerCountry = String(body.partner_country || body.country || '').trim();
    const partnerTaxId = String(body.partner_tax_id || body.tax_id || '').trim();
    const partnerAddress = String(body.partner_address || body.address || '').trim();
    const testMode = Boolean(body.test_mode);

    if (!templateId) {
        return res.status(500).json({
            ok: false,
            error: 'Server misconfigured: SIGNWELL_TEMPLATE_ID is not set and no template_id was provided.'
        });
    }
    if (!partnerName || !partnerEmail) {
        return res.status(400).json({
            ok: false,
            error: 'Campos obrigatórios ausentes: partner_name e partner_email.'
        });
    }

    const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partnerEmail);
    if (!emailLooksValid) {
        return res.status(400).json({ ok: false, error: 'E-mail inválido.' });
    }

    const documentName = `NCNDA - ${partnerName}${partnerCompany ? ' (' + partnerCompany + ')' : ''} & Onebridge Stalwart`;

    const payload = {
        test_mode: testMode,
        name: documentName,
        template_id: templateId,
        embedded_signing: true,
        embedded_signing_dialog: true,
        template_fields: [
            { api_id: 'Name', value: partnerName },
            { api_id: 'Company', value: partnerCompany || 'N/A - Pessoa Física' },
            { api_id: 'Country', value: partnerCountry || 'Não Informado' },
            { api_id: 'TaxID', value: partnerTaxId || 'Não Informado' },
            { api_id: 'Address', value: partnerAddress || 'Não Informado' }
        ],
        recipients: [
            { id: '1', name: partnerName, email: partnerEmail }
        ]
    };

    try {
        const upstream = await fetch(
            `https://www.signwell.com/api/v1/document_templates/${encodeURIComponent(templateId)}/documents`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Api-Key': apiKey
                },
                body: JSON.stringify(payload)
            }
        );

        const data = await upstream.json().catch(() => ({}));

        if (!upstream.ok) {
            console.error('[/api/signwell-document] upstream failed', upstream.status, data);
            return res.status(502).json({
                ok: false,
                error: data.message || 'Falha ao criar documento na SignWell.'
            });
        }

        const recipient = Array.isArray(data.recipients) ? data.recipients[0] : null;
        const embeddedSigningUrl = recipient ? recipient.embedded_signing_url : null;

        return res.status(200).json({
            ok: true,
            document_id: data.id || null,
            embedded_signing_url: embeddedSigningUrl
        });
    } catch (err) {
        console.error('[/api/signwell-document] unexpected error', err);
        return res.status(500).json({
            ok: false,
            error: 'Erro inesperado ao criar documento.'
        });
    }
};
