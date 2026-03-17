let mediaRecorder = null;
let audioChunks = [];

const keywordResponses = {
    'привет': ['Привет!', 'Здравствуйте!', 'Рад вас видеть!'],
    'как дела': ['Отлично!', 'Учусь и программирую', 'Всё хорошо'],
    'проект': ['Работаю над несколькими проектами', 'Скоро добавлю новые проекты'],
    'учеба': ['Учёба в ВШЭ очень интересная', 'ВШЭ даёт отличные знания'],
    'спасибо': ['Пожалуйста!', 'Всегда рад помочь'],
    'пока': ['До свидания!', 'Удачи'],
    'вшэ': ['Лучший университет!', 'Вышка - это сила!'],
    'миэм': ['МИЭМ - лучший институт!', 'Учимся на Таллинской'],
    'хочу': ['Отличное желание!', 'Дерзайте!']
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
        'Я понял вас.',
        'Хорошо, продолжай.',
        'Записано.'
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

window.handleSendMessage = function() {
    const input = document.getElementById('chat-input');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    addMessageToChat(message, true);
    input.value = '';
    
    setTimeout(() => {
        addMessageToChat(getBotResponse(message), false);
    }, 800);
};

window.handleVoiceMessage = async function() {
    const voiceBtn = document.getElementById("voice-btn");
    if (!voiceBtn) return;
    
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
            addMessageToChat("🎤 Голосовое сообщение", true);
            
            setTimeout(() => {
                addMessageToChat("Я получил голосовое сообщение (демо-режим)", false);
            }, 1000);
            
            stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        
        voiceBtn.textContent = "⏺";
        voiceBtn.disabled = true;
        
        setTimeout(() => {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
            }
            voiceBtn.textContent = "🎤";
            voiceBtn.disabled = false;
        }, 3000);
        
    } catch (error) {
        console.error(error);
        alert("Не удалось получить доступ к микрофону");
        voiceBtn.textContent = "🎤";
        voiceBtn.disabled = false;
    }
};

function createChatHTML() {
    return `
    <div class="chat-container">
        <div class="chat-header">
            <h3>Чат с автором</h3>
            <span class="chat-status">🟢 online</span>
        </div>
        <div id="chat-messages" class="chat-messages">
            <div class="chat-message bot-message">
                <div class="message-content">
                    <span class="message-sender">Автор</span>
                    <span class="message-time">${new Date().toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}</span>
                    <p>Можно что-нибудь написать</p>
                </div>
            </div>
        </div>
        <div class="chat-input-area">
            <input id="chat-input" type="text" placeholder="Введите сообщение...">
            <button onclick="window.handleSendMessage()" class="send-btn">📨</button>
            <button id="voice-btn" onclick="window.handleVoiceMessage()" class="voice-btn">🎤</button>
        </div>
    </div>
    `;
}

function createMapHTML() {
    return `
    <div class="map-container">
        <h3>📍 МИЭМ НИУ ВШЭ</h3>
        <div id="map" style="width:100%; height:400px;"></div>
        <p><strong>Адрес:</strong> г. Москва, ул. Таллинская, д. 34</p>
        <p><small>Московский институт электроники и математики им. А.Н. Тихонова</small></p>
    </div>
    `;
}

function initMap() {
    const mapElement = document.getElementById("map");
    if (!mapElement) return;
    
    if (typeof ol === "undefined") {
        mapElement.innerHTML = '<div style="background:#eee; padding:40px; text-align:center;">Карта: МИЭМ ВШЭ, ул. Таллинская, 34</div>';
        return;
    }
    
    const coords = [37.3976, 55.8165];
    
    const map = new ol.Map({
        target: "map",
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat(coords),
            zoom: 17
        })
    });
    
    const markerStyle = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 12,
            fill: new ol.style.Fill({color: '#FF6B6B'}),
            stroke: new ol.style.Stroke({color: '#fff', width: 3})
        })
    });
    
    const marker = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat(coords))
    });
    marker.setStyle(markerStyle);
    
    const vectorSource = new ol.source.Vector({
        features: [marker]
    });
    
    const vectorLayer = new ol.layer.Vector({
        source: vectorSource
    });
    
    map.addLayer(vectorLayer);
}

window.onload = function() {
    const isContactPage = document.querySelector("#contact-form");
    const isIndexPage = document.querySelector("#feature1");
    
    if (isContactPage) {
        const form = document.getElementById("contact-form");
        if (form) {
            form.onsubmit = function(e) {
                e.preventDefault();
                alert('Демо-режим: данные не сохраняются');
                form.reset();
            };
            
            const mapDiv = document.createElement("div");
            mapDiv.innerHTML = createMapHTML();
            form.after(mapDiv.firstChild);
            setTimeout(initMap, 500);
        }
    }
    
    if (isIndexPage) {
        const aside = document.querySelector("aside");
        if (aside) {
            const chatDiv = document.createElement("div");
            chatDiv.innerHTML = createChatHTML();
            aside.after(chatDiv.firstChild);
        }
    }
};
