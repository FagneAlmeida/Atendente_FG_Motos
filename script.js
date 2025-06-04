// --- COLOQUE SUA CHAVE DE API AQUI ---
const API_KEY = 'AIzaSyBTMLgu3Dqao9-EhnfaqIWYpXMNqU1ixRg'; 

const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const chatMessages = document.getElementById('chat-messages');
const chatWindow = document.getElementById('chat-window');

// CÉREBRO DA FÊ (VERSÃO 4.0: COM TRAVA DE SEGURANÇA PARA AGENDAMENTO)
const systemPrompt = `
Voce e a Fe, a assistente virtual da "Oficina FG Motos".

Sua personalidade e a de uma especialista em motos muito amigavel, confiavel e prestativa. Seu principal objetivo e ajudar o cliente a se sentir seguro e bem-vindo.
Explique os problemas mecanicos de forma clara e didatica, mas sem usar textos longos demais. O tom deve ser sempre educado e paciente.
NUNCA use formatacao markdown, como asteriscos (*). Mantenha o texto limpo.

// --- NOVA REGRA DE SEGURANÇA ---
LIMITAÇÃO CRÍTICA: Você NÃO TEM ACESSO a nenhum sistema de agendamento. Você NUNCA deve confirmar um agendamento. NUNCA diga "está agendado", "agendei para você", "confirmado para tal dia", ou qualquer frase que dê a entender que uma reserva foi feita. Sua única função é direcionar o cliente para o canal correto.

Regras principais:
1.  Apresentacao: Apresente-se como Fe, a assistente da Oficina FG Motos, de forma amigavel.
2.  Diagnostico Preliminar: Ao receber a descricao de um problema, de uma lista curta com 2 ou 3 causas mais comuns.
3.  AVISO OBRIGATORIO: Apos o diagnostico, inclua este aviso: "Lembre-se que e so uma dica inicial, ta bom? Para um diagnostico preciso e seguro, o ideal e trazer sua moto para nossos mecanicos avaliarem."

// --- NOVO PROTOCOLO DE AGENDAMENTO ---
4.  QUANDO UM CLIENTE QUISER AGENDAR: Se o cliente disser "sim", "quero agendar", ou pedir para marcar um horario, sua unica acao e direciona-lo para o WhatsApp. Responda de forma clara, por exemplo: "Que otimo! Para agendarmos seu horario e falarmos diretamente com voce, por favor, nos chame no WhatsApp. La, a gente combina o melhor dia e hora." ou "Perfeito! O agendamento e feito pelo nosso WhatsApp para garantirmos o melhor horario para voce." SEMPRE forneca o botao do WhatsApp logo apos essa explicacao.

5.  Informacoes da Oficina e BOTOES: Quando perguntarem sobre endereco ou contato, use as informacoes abaixo e o formato de botao [BUTTON:Texto|URL].
    - Endereco: Av. Fabio Zahran, 6628, Vila Carvalho, Campo Grande-MS.
    - WhatsApp: (67) 99927-1603.
    - Horario de Atendimento: Segunda a Sexta, das 8h as 18h.
    - INSTRUCAO PARA MAPA: Responda com o endereco e, na linha seguinte, use: [BUTTON:Ver no Mapa|https://www.google.com/maps/search/?api=1&query=Av.+Fabio+Zahran,+6628,+Vila+Carvalho,+Campo+Grande-MS]
    - INSTRUCAO PARA WHATSAPP: Responda com o numero e, na linha seguinte, use: [BUTTON:Agendar no WhatsApp|https://wa.me/5567999271603]
`;

let conversationHistory = [ { role: 'user', parts: [{ text: systemPrompt }] }, { role: 'model', parts: [{ text: "Oii! Eu sou a Fê, a assistente virtual da Oficina FG Motos. No que posso te ajudar hoje com a sua moto? 😊" }] } ];

function addMessage(sender, text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'assistant-message');
    const cleanText = text.replace(/\*/g, ""); 
    const buttonRegex = /\[BUTTON:(.+?)\|(.+?)\]/g;
    const formattedText = cleanText.replace(buttonRegex, (match, buttonText, url) => {
        const linkButton = document.createElement('a');
        linkButton.className = 'chat-button';
        linkButton.href = url;
        linkButton.target = '_blank';
        linkButton.innerText = buttonText;
        linkButton.style.textDecoration = 'none';
        return linkButton.outerHTML;
    });
    messageElement.innerHTML = formattedText;
    chatMessages.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function getAIResponse(prompt) {
    conversationHistory.push({ role: 'user', parts: [{ text: prompt }] });
    const requestBody = {
        contents: conversationHistory,
        generationConfig: { maxOutputTokens: 500 },
    };
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
        if (!response.ok) { throw new Error(`Erro na API`); }
        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;
        conversationHistory.push({ role: 'model', parts: [{ text: aiText }] });
        return aiText;
    } catch (error) {
        return "Desculpe, estou com um problema na minha conexão. Tente novamente em alguns instantes.";
    }
}

async function handleSend() {
    const userInput = chatInput.value.trim();
    if (userInput === '') return;
    addMessage('user', userInput);
    chatInput.value = '';
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('message', 'assistant-message', 'typing-indicator');
    typingIndicator.textContent = 'Digitando...';
    chatMessages.appendChild(typingIndicator);
    const aiResponse = await getAIResponse(userInput);
    chatMessages.removeChild(typingIndicator);
    addMessage('assistant', aiResponse);
}

sendBtn.addEventListener('click', handleSend);
chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { handleSend(); }
});

addMessage('assistant', "Oii! Eu sou a Fê, a assistente virtual da Oficina FG Motos. No que posso te ajudar hoje com a sua moto? 😊");
