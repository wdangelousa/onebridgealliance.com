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

    /* --- MÓDULO SIGNWELL: Integração via API (Privado) --- */
    const createBtn = document.getElementById('create-signwell-btn');
    const signContainer = document.getElementById('signwell-container');
    const iframe = document.querySelector('.signwell-iframe');
    const btnText = document.getElementById('btn-text');
    const btnLoader = document.getElementById('btn-loader');

    // Mantenha essa chave segura. Como o app é privado, estamos rodando client-side.
    const SIGNWELL_API_KEY = "YWNjZXNzOmFkMTAwZGRiMDhjNWZlMjhhOWZjNzM5ZGY2YjM1OGJl";
    // IMPORTANTE: Insira aqui o Template ID do NCNDA lá do seu painel do SignWell
    const TEMPLATE_ID = "SEU_TEMPLATE_ID_AQUI";

    if (createBtn && signContainer) {
        createBtn.addEventListener('click', async () => {
            const partnerName = document.getElementById('partner-name').value;
            const partnerCompany = document.getElementById('partner-company').value;
            const partnerCountry = document.getElementById('partner-country').value;
            const partnerTaxId = document.getElementById('partner-taxid').value;
            const partnerAddress = document.getElementById('partner-address').value;
            const partnerEmail = document.getElementById('partner-email').value;

            if (!partnerName || !partnerEmail || !partnerCountry) {
                alert("Por favor, preencha os campos obrigatórios (*) para iniciar o pacto.");
                return;
            }

            // Estado de carregamento 
            createBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'block';

            try {
                // 1. Requisito para API SignWell para criar o documento
                const response = await fetch('https://www.signwell.com/api/v1/document_templates/' + TEMPLATE_ID + '/documents', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Api-Key': SIGNWELL_API_KEY
                    },
                    body: JSON.stringify({
                        test_mode: false, // Pode mudar pra true em testes
                        name: `NCNDA - ${partnerName} ${partnerCompany ? '(' + partnerCompany + ')' : ''} & Onebridge Stalwart`,
                        template_id: TEMPLATE_ID,
                        embedded_signing: true,
                        embedded_signing_dialog: true,
                        // Injetando toda a qualificação global do Parceiro no Documento
                        template_fields: [
                            {
                                api_id: "Name", // Nome Completo do Representante
                                value: partnerName
                            },
                            {
                                api_id: "Company", // Nome da Entidade (LLC/LTDA/Corp)
                                value: partnerCompany || "N/A - Pessoa Física"
                            },
                            {
                                api_id: "Country", // País Base
                                value: partnerCountry
                            },
                            {
                                api_id: "TaxID", // EIN, CNPJ, SSN, NIF, etc.
                                value: partnerTaxId || "Não Informado"
                            },
                            {
                                api_id: "Address", // Endereço Completo
                                value: partnerAddress || "Não Informado"
                            }
                        ],
                        recipients: [
                            {
                                id: "1",
                                name: partnerName,
                                email: partnerEmail
                            }
                        ]
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Falha na comunicação com o servidor.");
                }

                // 2. Extrai a URL para o iFrame onde o usuário vai assinar
                const embeddedLink = data.recipients[0].embedded_signing_url;

                // 3. Oculta o form, Mostra o iFrame com o Doc
                document.getElementById('signwell-form-container').style.display = 'none';
                iframe.src = embeddedLink;
                signContainer.style.display = 'block';

                // Rola a página suavemente pro documento
                signContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });

            } catch (error) {
                console.error("Erro no SignWell:", error);
                alert("Houve uma falha na matriz de assinaturas. Verifique se o Template ID foi inserido no código ou contate o Engenheiro.");

                // Reseta estado
                createBtn.disabled = false;
                btnText.style.display = 'block';
                btnLoader.style.display = 'none';
            }
        });
    }

    /* Log de Inicialização do Console */
    console.log("%c[Stitch 626] Motores Modulares operacionais!", "color: #1ED697; font-size: 14px; font-weight: bold; background: #0B131A; padding: 10px; border: 1px solid #1ED697;");

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
            // Contexto Estratégico: Onebridge Stalwart Concierge
            // Regra: Nunca mencionar que é um protótipo ou tem limitações.

            // Simulação de processamento inteligente
            setTimeout(() => {
                let response = "";
                const input = userText.toLowerCase();

                if (input.includes("parceria") || input.includes("advogado") || input.includes("escritório")) {
                    response = "Com certeza. Escritórios de advocacia societária e contabilidades internacionais são os pilares da nossa rede de alianças. Como nosso sócio fundador possui background jurídico, a Onebridge Stalwart foi desenhada para atuar como a extensão operacional das estratégias que você cria para seus clientes em solo americano. Operamos de forma invisível (White Label) para que você mantenha o protagonismo. Gostaria de agendar um briefing tático com nossos diretores para alinhar nossa retaguarda à sua estrutura?";
                } else if (input.includes("orlando") || input.includes("flórida") || input.includes("usa")) {
                    response = "Nossa base de operações em Orlando (Horizon West) está estrategicamente posicionada para gerenciar a retaguarda de Family Offices e Holdings Operacionais. Garantimos que a presença internacional de seus clientes seja executada com precisão cirúrgica. Deseja conhecer mais sobre nosso setup físico e operacional na Flórida?";
                } else {
                    response = "Entendo perfeitamente sua demanda. Na Onebridge Stalwart, focamos em soluções de alta gravidade para proteção patrimonial e expansão imigratória. Para que eu possa fornecer uma análise técnica mais precisa, gostaria de agendar um briefing tático com nossos diretores operacionais?";
                }

                renderMessage(response, 'bot');
            }, 1000);

            // Futuro: Integração com Webhook de LLM (Make.com / OpenAI)
            /*
            try {
                const res = await fetch('https://hook.us2.make.com/sua_url_aqui', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: userText, persona: "Senior Concierge" })
                });
                const data = await res.json();
                renderMessage(data.response, 'bot');
            } catch(e) { ... }
            */
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
