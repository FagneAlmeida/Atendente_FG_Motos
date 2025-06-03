// --- PASSO FINAL: COLE SUA CHAVE DE API AQUI ---
const API_KEY = 'AIzaSyBTMLgu3Dqao9-EhnfaqIWYpXMNqU1ixRg'; 
// ---------------------------------------------

const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const chatMessages = document.getElementById('chat-messages');
const chatWindow = document.getElementById('chat-window');

const systemPrompt = `
Voce e uma atendente virtual e assistente de mecanica da "Oficina FG Motos". Seu nome e "Assistente FG".
Seu objetivo e ajudar os clientes com suas duvidas sobre motocicletas de forma amigavel e prestativa.

Regras principais:
1.  Apresentacao: Sempre se apresente como a assistente da Oficina FG Motos.
2.  Diagnostico Preliminar: Ao receber a descricao de um problema (ex: "moto falhando", "barulho estranho"), forneca uma lista de 2 a 4 causas mais comuns.
3.  AVISO OBRIGATORIO: Apos listar as possiveis causas, SEMPRE inclua a seguinte frase ou uma variacao muito proxima: "Importante: Este e um pre-diagnostico para te dar uma ideia. Para uma analise precisa e garantir sua seguranca, o ideal e trazer sua moto para uma avaliacao completa por um de nossos mecanicos."
4.  Chamar para Acao: Sempre finalize a resposta de diagnostico convidando o cliente a agendar um horario na Oficina FG Motos.
5.  Tom: Seja profissional, mas amigavel e didatico. Use emojis de forma moderada (ex: 🏍️, 👍,🔧).
6.  Informacoes da Oficina e BOTOES: Quando perguntarem sobre endereco ou contato, use as informacoes abaixo. Para links, use OBRIGATORIAMENTE o formato especial [BUTTON:Texto do Botao|URL_COMPLETA].
    - Endereco: Av. Fabio Zahran, 6628, Vila Carvalho, Campo Grande-MS.
    - WhatsApp: (67) 99927-1603.
    - Horario de Atendimento: Segunda a Sexta, das 8h as 18h.
    - INSTRUCAO PARA MAPA: Se pedirem o endereco ou localizacao, responda com o endereco em texto e, em uma nova linha, use o formato: [BUTTON:Ver no Mapa|https://www.google.com/maps/search/?api=1&query=Av.+Fabio+Zahran,+6628,+Vila+Carvalho,+Campo+Grande-MS]
    - INSTRUCAO PARA WHATSAPP: Se pedirem o contato ou WhatsApp, responda com o numero em texto e, em uma nova linha, use o formato: [BUTTON:Abrir WhatsApp|https://wa.me/5567999271603]
`;

let conversationHistory = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    { role: 'model', parts: [{ text: "Olá! Eu sou a assistente virtual da Oficina FG Motos. Como posso te ajudar com a sua moto hoje? 🏍️" }] }
];

// --- FUNÇÃO addMessage ATUALIZADA PARA NÃO SER BLOQUEADA ---
function addMessage(sender, text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'assistant-message');
    
    const buttonRegex = /\[BUTTON:(.+?)\|(.+?)\]/g;
    
    const formattedText = text.replace(buttonRegex, (match, buttonText, url) => {
        // Criamos um link <a> em vez de um botão <button>
        const linkButton = document.createElement('a');
        linkButton.className = 'chat-button'; // Usamos a mesma classe de estilo
        linkButton.href = url;
        linkButton.target = '_blank'; // Para abrir em nova aba
        linkButton.innerText = buttonText;
        linkButton.style.textDecoration = 'none'; // Para remover o sublinhado do link
        
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
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Erro da API:", errorData);
            throw new Error(`Erro na API: ${response.statusText}`);
        }
        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;
        conversationHistory.push({ role: 'model', parts: [{ text: aiText }] });
        return aiText;
    } catch (error) {
        console.error("Não foi possível obter a resposta da IA:", error);
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
    chatWindow.scrollTop = chatWindow.scrollHeight;
    const aiResponse = await getAIResponse(userInput);
    chatMessages.removeChild(typingIndicator);
    addMessage('assistant', aiResponse);
}

sendBtn.addEventListener('click', handleSend);
chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { handleSend(); }
});

addMessage('assistant', "Olá! Eu sou a assistente virtual da Oficina FG Motos. Como posso te ajudar com a sua moto hoje? 🏍️");