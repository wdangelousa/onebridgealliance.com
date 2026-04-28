/* 
 * Experimento 626 - Inicializando Motor Lógico SPA e Integração SignWell
 * Arquitetura de arquivos modular.
 */

document.addEventListener('DOMContentLoaded', () => {

    /* --- MÓDULO 1: Roteamento Dimensional (Abas/Tabs) --- */
    const tabs = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.section');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                targetSection.classList.add('active');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });

    /* --- MÓDULO 2: Decodificador de Mensagens (FAQ Accordion) --- */
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            faqItems.forEach(i => i.classList.remove('active'));

            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    /* --- MÓDULO SIGNWELL: Integração via /api/signwell-document ---
     * Toda a comunicação com a SignWell é feita pelo backend serverless.
     * Nenhuma API key da SignWell deve ser referenciada neste arquivo.
     * Para acionar a criação de documento, faça POST para /api/signwell-document
     * com { partner_name, partner_email, partner_company, partner_country,
     *      partner_tax_id, partner_address } e use a embedded_signing_url
     * retornada pelo endpoint.
     */
    const createBtn = document.getElementById('create-signwell-btn');
    const signContainer = document.getElementById('signwell-container');
    const iframe = document.querySelector('.signwell-iframe');
    const btnText = document.getElementById('btn-text');
    const btnLoader = document.getElementById('btn-loader');

    if (createBtn && signContainer) {
        createBtn.addEventListener('click', async () => {
            const partnerName = document.getElementById('partner-name').value;
            const partnerCompany = document.getElementById('partner-company').value;
            const partnerCountry = document.getElementById('partner-country').value;
            const partnerTaxId = document.getElementById('partner-taxid').value;
            const partnerAddress = document.getElementById('partner-address').value;
            const partnerEmail = document.getElementById('partner-email').value;

            if (!partnerName || !partnerEmail || !partnerCountry) {
                alert("Por favor, preencha os campos obrigatórios (*) para iniciar o framework.");
                return;
            }

            createBtn.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnLoader) btnLoader.style.display = 'block';

            try {
                const response = await fetch('/api/signwell-document', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        partner_name: partnerName,
                        partner_email: partnerEmail,
                        partner_company: partnerCompany,
                        partner_country: partnerCountry,
                        partner_tax_id: partnerTaxId,
                        partner_address: partnerAddress
                    })
                });

                const data = await response.json().catch(() => ({}));

                if (!response.ok || !data.ok) {
                    throw new Error(data.error || "Falha na comunicação com o servidor.");
                }

                const embeddedLink = data.embedded_signing_url;
                if (!embeddedLink) {
                    throw new Error("URL de assinatura não retornada pelo servidor.");
                }

                const formContainer = document.getElementById('signwell-form-container');
                if (formContainer) formContainer.style.display = 'none';
                iframe.src = embeddedLink;
                signContainer.style.display = 'block';
                signContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });

            } catch (error) {
                console.error("Erro no SignWell:", error);
                alert("Houve uma falha ao iniciar a assinatura. Tente novamente em instantes ou contate o suporte.");

                createBtn.disabled = false;
                if (btnText) btnText.style.display = 'block';
                if (btnLoader) btnLoader.style.display = 'none';
            }
        });
    }

    /* Log de Inicialização do Console */
    console.log("%c[Stitch 626] Motores Modulares operacionais!", "color: #B8965A; font-size: 14px; font-weight: bold; background: #0B131A; padding: 10px; border: 1px solid #B8965A;");

    /* --- MÓDULO AI CONCIERGE: Interface e Lógica --- */
    const aiFab = document.getElementById('aiChatFab');
    const aiChatbox = document.getElementById('aiChatbox');
    const aiCloseBtn = document.getElementById('aiCloseBtn');
    const aiInput = document.getElementById('aiInput');
    const aiSendBtn = document.getElementById('aiSendBtn');
    const aiMessages = document.getElementById('aiChatMessages');

    if (aiFab && aiChatbox) {
        // Toggle Chatbox
        aiFab.addEventListener('click', () => {
            const isVisible = aiChatbox.style.display === 'flex';
            aiChatbox.style.display = isVisible ? 'none' : 'flex';
            if (!isVisible) aiInput.focus();
        });

        aiCloseBtn.addEventListener('click', () => {
            aiChatbox.style.display = 'none';
        });

        // Enviar Mensagem
        const sendMessage = () => {
            const text = aiInput.value.trim();
            if (!text) return;

            // Renderizar Mensagem do Usuário
            renderMessage(text, 'user');
            aiInput.value = '';

            // Stub para Integração Futura (Webhook)
            handleAiResponse(text);
        };

        aiSendBtn.addEventListener('click', sendMessage);
        aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });

        function renderMessage(text, side) {
            const msgDiv = document.createElement('div');
            msgDiv.className = `ai-message ${side}`;
            msgDiv.innerHTML = `<p>${text}</p>`;
            aiMessages.appendChild(msgDiv);
            aiMessages.scrollTop = aiMessages.scrollHeight;
        }

        async function handleAiResponse(userText) {
            /** 
             * SYSTEM PROMPT — CONCIERGE ESTRATÉGICO v2.0
             * Framework: Identidade Institucional + Retaguarda White Label
             */

            // Simulação de Processo de Raciocínio (Chain-of-Thought)
            setTimeout(() => {
                let response = "";
                const input = userText.toLowerCase();

                // 1. Identificação de Perfil: Advogado / Escritório Societário
                if (input.includes("advogado") || input.includes("societário") || input.includes("escritório") || input.includes("oab")) {
                    response = "Escritórios societários são parte central da nossa rede de parceiros. Nosso sócio fundador, Walter D'Angelo, é advogado licenciado (OAB/PE 23.359), o que ajuda a manter uma interlocução técnica compatível com firmas jurídicas. <br><br>O modelo é simples: sua firma define a orientação profissional e a relação com o cliente; nós coordenamos a infraestrutura operacional em solo americano, em formato white-label ou co-branded. Seus honorários e sua relação comercial permanecem com você. <br><br>Qual é o perfil da sua carteira hoje — famílias com ativos nos EUA, empresas em expansão, ou ambos? Isso nos ajuda a alinhar o primeiro briefing profissional.";
                }
                // 2. Identificação de Perfil: Contador / FBAR / Compliance
                else if (input.includes("contador") || input.includes("contabilidade") || input.includes("fbar") || input.includes("fatca") || input.includes("imposto")) {
                    response = "Questões de compliance e reporting, como FBAR e FATCA, exigem organização, documentação e coordenação profissional. Operamos como a infraestrutura americana que ajuda a manter entidades, calendários e documentos em ordem para que você entregue uma experiência mais completa ao cliente. <br><br>Nós cuidamos de fluxos como Annual Reports, Registered Agent e coordenação com profissionais americanos licenciados quando necessário. Em cenários sensíveis, a avaliação deve ser feita com assessores qualificados nas jurisdições aplicáveis. <br><br>Gostaria de agendar um briefing confidencial para mapearmos esses casos e entender como podemos fortalecer sua entrega?";
                }
                // 3. Identificação de Perfil: Consultor Patrimonial / Family Office
                else if (input.includes("consultor") || input.includes("patrimonial") || input.includes("investimento") || input.includes("family office")) {
                    response = "Para famílias que buscam sucessão organizada e eficiência multigeracional, a Onebridge Stalwart atua como infraestrutura operacional em Orlando. Focamos em governança, organização patrimonial, holdings, trusts e estruturas avançadas quando adequadas ao perfil do cliente. <br><br>Nossa base em Horizon West funciona como ponto de coordenação para diversificação geográfica e suporte a estruturas como a Wyoming Statutory Foundation, sempre com análise profissional apropriada. <br><br>Vale uma conversa mais aprofundada para entender o perfil da sua carteira e como nossa infraestrutura operacional pode apoiar suas estratégias?";
                }
                // 4. Identificação de Perfil: Proteção & Seguros / Blindagem
                else if (input.includes("proteção") || input.includes("seguro") || input.includes("blindagem") || input.includes("sucessão") || input.includes("apólice")) {
                    response = "Asset protection planning pode ser uma camada relevante em estruturas de Family Office ou Holding Operacional nos EUA, desde que alinhada a compliance, disclosure e aconselhamento profissional adequado. Sob a liderança técnica de Walter D'Angelo (OAB/PE 23.359), a Onebridge coordena seguros internacionais de vida e saúde como ferramentas de liquidez, sucessão e continuidade familiar. <br><br>Nossa equipe integra essas soluções com estruturas jurídicas e corporativas revisadas por profissionais licenciados quando necessário. <br><br>Gostaria de um resumo profissional sobre essa camada de planejamento ou prefere agendar um briefing com nossos diretores?";
                }
                // 5. Identificação de Perfil: Cliente Final / Abertura de Empresa
                else if (input.includes("abrir") || input.includes("empresa") || input.includes("casa") || input.includes("visto") || input.includes("orlando")) {
                    response = "A abertura de uma entidade nos EUA é apenas o passo inicial; o ponto central é o propósito estratégico. Seja uma LLC para holding imobiliária ou uma Corporation para operação ativa, a estrutura deve considerar documentação, banking, governança e obrigações recorrentes. <br><br>Localizada em Orlando (Horizon West), nossa equipe oferece coordenação operacional desde a estruturação inicial até o banking e o compliance contínuo. <br><br>O que você tem em mente para essa expansão — é um veículo de investimento, um negócio operacional, ou parte de um planejamento familiar?";
                }
                // 5. Resposta Geral Estratégica
                else {
                    response = "Na Onebridge Stalwart, atuamos como infraestrutura operacional white-label para expansão internacional, estruturação corporativa, documentação, banking support, compliance e private client coordination. <br><br>Para alinhar uma análise preliminar ao seu cenário, recomendo um briefing profissional direto com nossos diretores operacionais. Como posso direcionar nossa conversa agora?";
                }

                renderMessage(response, 'bot');
            }, 1000);

            // Integração futura com LLM deve passar por uma rota serverless dedicada
            // (ex: /api/ai-concierge), nunca chamando o webhook diretamente do front-end.
        }
    }
});

/* --- MÓDULO 3: Projeção Holográfica (Pitch Deck Carousel) --- */
let currentSlideIndex = 0;
const pitchSlides = document.querySelectorAll('.pitch-slide');
const pitchDots = document.querySelectorAll('.slide-dot');

window.changeSlide = function (index) {
    pitchSlides.forEach(s => s.classList.remove('active'));
    pitchDots.forEach(d => d.classList.remove('active'));

    currentSlideIndex = index % pitchSlides.length;

    pitchSlides[currentSlideIndex].classList.add('active');
    pitchDots[currentSlideIndex].classList.add('active');
};

/* Auto-piloto do holograma: Atualização do slide */
setInterval(() => {
    const painelSection = document.getElementById('pitch-deck');
    if (painelSection && painelSection.classList.contains('active')) {
        changeSlide(currentSlideIndex + 1);
    }
}, 6500);

/* --- MÓDULO FAQ: Formulário de Pergunta Específica (24h) --- */
window.submitFaqForm = async function (e) {
    e.preventDefault();
    const form = document.getElementById('faqContactForm');
    const btn = document.getElementById('faqSubmitBtn');
    const success = document.getElementById('faqSuccess');

    btn.disabled = true;
    btn.textContent = 'Enviando…';

    const nome = document.getElementById('faqName').value.trim();
    const email = document.getElementById('faqEmail').value.trim();
    const categoria = document.getElementById('faqCategory').value;
    const mensagem = document.getElementById('faqMessage').value.trim();

    try {
        const FORMSPREE_URL = 'https://formspree.io/f/xpwrlkoa';
        const res = await fetch(FORMSPREE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ nome, email, categoria, mensagem, _subject: `[FAQ Onebridge] ${categoria} — ${nome}` })
        });
        if (!res.ok) throw new Error('fetch failed');
    } catch (_) {
        const subject = encodeURIComponent(`[FAQ Onebridge] ${categoria} - ${nome}`);
        const body = encodeURIComponent(`Nome/Firma: ${nome}\nE-mail: ${email}\nCategoria: ${categoria}\n\nPergunta:\n${mensagem}`);
        window.open(`mailto:contact@onebridgestalwart.com?subject=${subject}&body=${body}`);
    }

    form.style.display = 'none';
    success.style.display = 'block';
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
};
