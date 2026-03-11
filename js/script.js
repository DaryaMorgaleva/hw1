let chatMessages = [];
let mediaRecorder = null;
let audioChunks = [];

const keywordResponses = {
    'привет': ['Привет!', 'Здравствуй!', 'Рад тебя видеть!'],
    'здравствуй': ['Привет!', 'Здравствуйте!', 'Добрый день!'],
    'как дела': ['Отлично!', 'Всё хорошо, учусь в ВШЭ', 'Программирую помаленьку'],
    'что делаешь': ['Пишу код', 'Готовлюсь к семинарам', 'Изучаю новые технологии'],
    'проект': ['Могу рассказать о своих проектах', 'Работаю над несколькими проектами', 'Скоро выложу новые проекты'],
    'учеба': ['Учёба в ВШЭ - это интересно!', 'Много новых знаний', 'Нравится учиться'],
    'вшэ': ['Лучший университет!', 'Горжусь, что учусь здесь', 'ВШЭ - это возможности'],
    'хобби': ['Люблю программировать', 'Увлекаюсь веб-дизайном', 'Изучаю новые языки'],
    'спасибо': ['Пожалуйста!', 'Всегда рад помочь!', 'Обращайся :)'],
    'пока': ['До свидания!', 'Пока! Заходи ещё', 'Удачи!']
};

function getBotResponse(userMessage) {
    userMessage = userMessage.toLowerCase();
    
    for (let [keyword, responses] of Object.entries(keywordResponses)) {
        if (userMessage.includes(keyword)) {
            const randomIndex = Math.floor(Math.random() * responses.length);
            return responses[randomIndex];
        }
    }
    
    const defaultResponses = [
        'Интересно... Расскажи подробнее',
        'Я понял. А что ещё?',
        'Хорошо, продолжай',
        'Занимательно!',
        'Спасибо, что делишься'
    ];
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

function addMessageToChat(text, isUser = false) {
    const messagesDiv = document.getElementById('chat-messages');
    if (!messagesDiv) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <span class="message-sender">${isUser ? 'Вы' : 'Автор'}</span>
            <span class="message-time">${time}</span>
            <p>${text}</p>
        </div>
    `;
    
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    chatMessages.push({
        text: text,
        isUser: isUser,
        time: time
    });
}

window.handleSendMessage = function() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (message) {
        addMessageToChat(message, true);
        input.value = '';
        
        setTimeout(() => {
            const botResponse = getBotResponse(message);
            addMessageToChat(botResponse, false);
        }, 1000);
    }
};

window.handleVoiceMessage = async function() {
    try {
        if (!navigator.mediaDevices || !window.MediaRecorder) {
            alert('\u26A0\uFE0F Ваш браузер не поддерживает запись голоса');
            return;
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
            addMessageToChat('\uD83C\uDFA4 Голосовое сообщение (имитация)', true);
            
            setTimeout(() => {
                addMessageToChat('\uD83D\uDCDD Получил ваше голосовое сообщение! В демо-версии я просто отвечаю текстом. Спасибо!', false);
            }, 1500);
            
            stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        
        setTimeout(() => {
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
            }
        }, 3000);
        
        const voiceBtn = document.getElementById('voice-btn');
        const originalText = voiceBtn.innerHTML;
        voiceBtn.innerHTML = '\uD83D\uDD34 Запись... 3с';
        voiceBtn.disabled = true;
        
        setTimeout(() => {
            voiceBtn.innerHTML = originalText;
            voiceBtn.disabled = false;
        }, 3000);
        
    } catch (error) {
        console.error('Ошибка доступа к микрофону:', error);
        alert('\u26A0\uFE0F Не удалось получить доступ к микрофону');
    }
};

function createChatHTML() {
    return `
        <div class="chat-container">
            <div class="chat-header">
                <h3>\uD83D\uDCAC Чат с автором</h3>
                <span class="chat-status">\uD83D\uDFE2 В сети</span>
            </div>
            <div class="chat-messages" id="chat-messages">
                <div class="chat-message bot-message">
                    <div class="message-content">
                        <span class="message-sender">Автор</span>
                        <span class="message-time">${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                        <p>Привет! Я автор этого сайта. Задавай вопросы, я отвечу (в демо-режиме) \uD83D\uDE0A</p>
                    </div>
                </div>
            </div>
            <div class="chat-input-area">
                <input type="text" id="chat-input" placeholder="Напишите сообщение...">
                <button onclick="handleSendMessage()" class="send-btn">\uD83D\uDCE4</button>
                <button onclick="handleVoiceMessage()" class="voice-btn">\uD83C\uDFA4</button>
            </div>
        </div>
    `;
}

function createMapHTML() {
    return `
        <div class="map-container">
            <h3>\uD83D\uDCCD Где меня найти</h3>
            <div id="map" style="width: 100%; height: 400px;"></div>
            <p class="map-note"><small>* Интерактивная карта кампуса ВШЭ на Мясницкой</small></p>
        </div>
    `;
}

function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;
    
    if (typeof ol === 'undefined') {
        console.error('OpenLayers не загружен');
        mapElement.innerHTML = '<p style="color: red; padding: 20px;">\u26A0\uFE0F Не удалось загрузить карту</p>';
        return;
    }
    
    try {
        const hseCoordinates = [37.639, 55.760];
        
        const map = new ol.Map({
            target: 'map',
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                })
            ],
            view: new ol.View({
                center: ol.proj.fromLonLat(hseCoordinates),
                zoom: 16
            })
        });
        
        const markerLayer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [
                    new ol.Feature({
                        geometry: new ol.geom.Point(ol.proj.fromLonLat(hseCoordinates))
                    })
                ]
            }),
            style: new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 1],
                    src: 'https://openlayers.org/en/latest/examples/data/icon.png',
                    scale: 0.5
                })
            })
        });
        
        map.addLayer(markerLayer);
        console.log('Карта успешно инициализирована');
    } catch (error) {
        console.error('Ошибка при создании карты:', error);
        mapElement.innerHTML = '<p style="color: red; padding: 20px;">\u26A0\uFE0F Не удалось создать карту</p>';
    }
}

function initMapFallback() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;
    
    mapElement.innerHTML = `
        <div style="background: #f0f0f0; padding: 40px; text-align: center; border-radius: 10px;">
            <p style="font-size: 2rem; margin: 0;">📍</p>
            <p><strong>НИУ ВШЭ, ул. Мясницкая, д. 20</strong></p>
            <p>Москва, Россия</p>
            <p style="color: #666; margin-top: 20px;"><small>Карта временно недоступна. Попробуйте позже.</small></p>
        </div>
    `;
}

window.onload = function() {
    console.log('Страница загружена, инициализация функций...');
    
    const isContactPage = document.getElementById('contact-form') !== null;
    
    const style = document.createElement('style');
    style.textContent = `
        .chat-container {
            margin: 20px 0;
            border: 2px solid #667eea;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.3);
            background: white;
        }
        
        .chat-header {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .chat-header h3 {
            margin: 0;
            color: white;
        }
        
        .chat-status {
            font-size: 0.9rem;
            padding: 5px 10px;
            background: rgba(255,255,255,0.2);
            border-radius: 20px;
        }
        
        .chat-messages {
            height: 300px;
            overflow-y: auto;
            padding: 20px;
            background: #f8f9fa;
            display: flex;
            flex-direction: column;
        }
        
        .chat-message {
            margin-bottom: 15px;
            max-width: 80%;
        }
        
        .user-message {
            align-self: flex-end;
        }
        
        .bot-message {
            align-self: flex-start;
        }
        
        .message-content {
            padding: 10px 15px;
            border-radius: 15px;
            position: relative;
        }
        
        .user-message .message-content {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border-bottom-right-radius: 5px;
        }
        
        .bot-message .message-content {
            background: white;
            border: 1px solid #e0e0e0;
            border-bottom-left-radius: 5px;
        }
        
        .message-sender {
            font-size: 0.8rem;
            font-weight: bold;
            margin-right: 10px;
        }
        
        .message-time {
            font-size: 0.7rem;
            opacity: 0.7;
        }
        
        .message-content p {
            margin: 5px 0 0 0;
        }
        
        .chat-input-area {
            display: flex;
            padding: 15px;
            background: white;
            border-top: 1px solid #e0e0e0;
        }
        
        .chat-input-area input {
            flex: 1;
            padding: 10px 15px;
            border: 2px solid #e0e0e0;
            border-radius: 25px;
            font-size: 1rem;
            transition: border-color 0.3s;
        }
        
        .chat-input-area input:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .send-btn, .voice-btn {
            width: 45px;
            height: 45px;
            margin-left: 10px;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.2rem;
            transition: all 0.3s;
        }
        
        .send-btn {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
        }
        
        .voice-btn {
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
        }
        
        .send-btn:hover, .voice-btn:hover {
            transform: scale(1.1);
        }
        
        .send-btn:disabled, .voice-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .map-container {
            margin: 30px 0;
            padding: 20px;
            background: white;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }
        
        .map-container h3 {
            color: #2d3e50;
            margin-bottom: 15px;
        }
        
        #map {
            border-radius: 10px;
            overflow: hidden;
            border: 2px solid #667eea;
            min-height: 400px;
        }
        
        .map-note {
            text-align: center;
            margin-top: 10px;
            color: #666;
        }
        
        @media screen and (max-width: 768px) {
            .chat-message {
                max-width: 90%;
            }
            
            #map {
                height: 300px;
                min-height: 300px;
            }
        }
    `;
    document.head.appendChild(style);
    
    if (isContactPage) {
        console.log('Страница контактов, добавляем карту...');
        
        const mainElement = document.querySelector('main');
        if (mainElement) {
            const form = document.getElementById('contact-form');
            if (form) {
                const mapDiv = document.createElement('div');
                mapDiv.innerHTML = createMapHTML();
                form.parentNode.insertBefore(mapDiv.firstChild, form.nextSibling);
                
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://cdn.jsdelivr.net/npm/ol@v7.3.0/ol.css';
                document.head.appendChild(link);
                
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/ol@v7.3.0/dist/ol.js';
                script.onload = function() {
                    console.log('OpenLayers загружен, инициализация карты...');
                    setTimeout(initMap, 500);
                };
                script.onerror = function() {
                    console.error('Не удалось загрузить OpenLayers');
                    initMapFallback();
                };
                document.head.appendChild(script);
            }
        }
    } else {
        console.log('Главная страница, добавляем чат...');
        
        const mainElement = document.querySelector('main');
        if (mainElement) {
            const aside = document.querySelector('aside');
            if (aside) {
                const chatDiv = document.createElement('div');
                chatDiv.innerHTML = createChatHTML();
                aside.parentNode.insertBefore(chatDiv.firstChild, aside.nextSibling);
            } else {
                const mainContent = document.querySelector('main');
                const chatDiv = document.createElement('div');
                chatDiv.innerHTML = createChatHTML();
                mainContent.appendChild(chatDiv.firstChild);
            }
        }
    }
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
            console.log('Принудительный запуск...');
            if (window.location.pathname.includes('contact.html')) {
                if (!document.querySelector('.map-container')) {
                    console.log('Карта не найдена, создаю...');
                    const form = document.getElementById('contact-form');
                    if (form) {
                        const mapDiv = document.createElement('div');
                        mapDiv.innerHTML = createMapHTML();
                        form.parentNode.insertBefore(mapDiv.firstChild, form.nextSibling);
                    }
                }
            } else {
                if (!document.querySelector('.chat-container')) {
                    console.log('Чат не найден, создаю...');
                    const aside = document.querySelector('aside');
                    if (aside) {
                        const chatDiv = document.createElement('div');
                        chatDiv.innerHTML = createChatHTML();
                        aside.parentNode.insertBefore(chatDiv.firstChild, aside.nextSibling);
                    }
                }
            }
        }, 1000);
    });
} else {
    console.log('Страница уже загружена, запускаю...');
    if (window.location.pathname.includes('contact.html')) {
        const form = document.getElementById('contact-form');
        if (form && !document.querySelector('.map-container')) {
            const mapDiv = document.createElement('div');
            mapDiv.innerHTML = createMapHTML();
            form.parentNode.insertBefore(mapDiv.firstChild, form.nextSibling);
        }
    } else {
        if (!document.querySelector('.chat-container')) {
            const aside = document.querySelector('aside');
            if (aside) {
                const chatDiv = document.createElement('div');
                chatDiv.innerHTML = createChatHTML();
                aside.parentNode.insertBefore(chatDiv.firstChild, aside.nextSibling);
            }
        }
    }
}

};
