let chatMessages = [];
let mediaRecorder = null;
let audioChunks = [];

const keywordResponses = {
    'привет': ['Привет!', 'Здравствуйте!', 'Рад вас видеть!'],
    'как дела': ['Отлично!', 'Учусь и программирую', 'Всё хорошо'],
    'проект': ['Работаю над несколькими проектами', 'Скоро добавлю новые проекты'],
    'учеба': ['Учёба в ВШЭ очень интересная'],
    'спасибо': ['Пожалуйста!', 'Всегда рад помочь'],
    'пока': ['До свидания!', 'Удачи']
};

function getBotResponse(userMessage) {
    userMessage = userMessage.toLowerCase();

    for (let [keyword, responses] of Object.entries(keywordResponses)) {
        if (userMessage.includes(keyword)) {
            return responses[Math.floor(Math.random() * responses.length)];
        }
    }

    const defaultResponses = [
        'Интересно. Расскажите подробнее.',
        'Я понял.',
        'Хорошо.',
        'Продолжайте.'
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

function addMessageToChat(text, isUser = false) {

    const messagesDiv = document.getElementById('chat-messages');
    if (!messagesDiv) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? "chat-message user-message" : "chat-message bot-message";

    const time = new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });

    messageDiv.innerHTML = `
        <div class="message-content">
            <span class="message-sender">${isUser ? 'Вы' : 'Автор'}</span>
            <span class="message-time">${time}</span>
            <p>${text}</p>
        </div>
    `;

    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

window.handleSendMessage = function () {

    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (!message) return;

    addMessageToChat(message, true);
    input.value = '';

    setTimeout(() => {
        addMessageToChat(getBotResponse(message), false);
    }, 800);
};

window.handleVoiceMessage = async function () {

    const voiceBtn = document.getElementById("voice-btn");

    try {

        if (!navigator.mediaDevices || !window.MediaRecorder) {
            alert("Ваш браузер не поддерживает запись звука");
            return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

        mediaRecorder.onstop = () => {

            addMessageToChat("[voice message]", true);

            setTimeout(() => {
                addMessageToChat("Я получил голосовое сообщение (демо-режим).", false);
            }, 1000);

            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();

        voiceBtn.textContent = "Recording...";
        voiceBtn.disabled = true;

        setTimeout(() => {

            mediaRecorder.stop();

            voiceBtn.textContent = "Voice";
            voiceBtn.disabled = false;

        }, 3000);

    } catch (error) {

        console.error(error);
        alert("Не удалось получить доступ к микрофону");

    }
};

function createChatHTML() {

    return `
<div class="chat-container">

<div class="chat-header">
<h3>Chat with author</h3>
<span class="chat-status">online</span>
</div>

<div id="chat-messages" class="chat-messages"></div>

<div class="chat-input-area">
<input id="chat-input" type="text" placeholder="Введите сообщение">
<button onclick="handleSendMessage()" class="send-btn">Send</button>
<button id="voice-btn" onclick="handleVoiceMessage()" class="voice-btn">Voice</button>
</div>

</div>
`;
}

function createMapHTML() {

    return `
<div class="map-container">

<h3>Campus location</h3>

<div id="map" style="width:100%;height:400px"></div>

</div>
`;
}

function initMap() {

    const mapElement = document.getElementById("map");
    if (!mapElement) return;

    if (typeof ol === "undefined") {
        mapElement.innerHTML = "Map failed to load";
        return;
    }

    const coords = [37.639, 55.760];

    const map = new ol.Map({
        target: "map",
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat(coords),
            zoom: 16
        })
    });

    const marker = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [
                new ol.Feature({
                    geometry: new ol.geom.Point(
                        ol.proj.fromLonLat(coords)
                    )
                })
            ]
        })
    });

    map.addLayer(marker);
}

window.onload = function () {

    const isContactPage = document.querySelector("#contact-form");

    if (isContactPage) {

        const form = document.getElementById("contact-form");

        const mapDiv = document.createElement("div");
        mapDiv.innerHTML = createMapHTML();

        form.after(mapDiv.firstChild);

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/ol@v7.3.0/ol.css";

        document.head.appendChild(link);

        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/ol@v7.3.0/dist/ol.js";

        script.onload = initMap;

        document.head.appendChild(script);

    } else {

        const aside = document.querySelector("aside");

        const chatDiv = document.createElement("div");
        chatDiv.innerHTML = createChatHTML();

        aside.after(chatDiv.firstChild);

    }

};
