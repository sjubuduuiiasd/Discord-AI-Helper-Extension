// ─── POPUP SCRIPT ───

// CONFIG is loaded from config.js via script tag
var GROQ_API_KEY = CONFIG.GROQ_API_KEY;

// ─── DOM ───
var chatArea = document.getElementById('chatArea');
var userInput = document.getElementById('userInput');
var sendBtn = document.getElementById('sendBtn');
var updateColorsBtn = document.getElementById('updateColorsBtn');
var toast = document.getElementById('toast');

// ─── UI HELPERS ───
function addMessage(text, isUser) {
    var div = document.createElement('div');
    div.className = 'message ' + (isUser ? 'user' : 'bot');

    var avatar = document.createElement('span');
    avatar.className = 'avatar';
    avatar.textContent = isUser ? '👤' : '🤖';

    var bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;

    div.appendChild(avatar);
    div.appendChild(bubble);
    chatArea.appendChild(div);
    chatArea.scrollTop = chatArea.scrollHeight;
}

function showTyping() {
    var div = document.createElement('div');
    div.className = 'message bot';
    div.id = 'typingIndicator';

    var avatar = document.createElement('span');
    avatar.className = 'avatar';
    avatar.textContent = '🤖';

    var bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = '...';

    div.appendChild(avatar);
    div.appendChild(bubble);
    chatArea.appendChild(div);
    chatArea.scrollTop = chatArea.scrollHeight;
}

function removeTyping() {
    var typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
}

// ─── Send collected data ───
function sendCollectedData() {
    chrome.runtime.sendMessage({ action: 'collectData' }, function(response) {
        if (response && response.success) {
            console.log("[Popup] Data sent");
        } else {
            var error = response ? response.error : 'Unknown error';
            console.log("[Popup] Failed:", error);
        }
    });
}

// ─── AI ───
function getAIResponse(message) {
    return new Promise(function(resolve, reject) {
        chrome.runtime.sendMessage({ action: 'aiQuery', message: message }, function(response) {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
            }
            if (response && response.success) {
                resolve(response.reply);
            } else {
                reject(new Error(response ? response.error : 'Unknown error'));
            }
        });
    });
}

// ─── HANDLE SEND ───
function handleSend() {
    var message = userInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    userInput.value = '';
    userInput.focus();

    sendCollectedData();

    showTyping();

    getAIResponse(message)
        .then(function(reply) {
            removeTyping();
            addMessage(reply, false);
        })
        .catch(function(error) {
            removeTyping();
            addMessage("Error: " + error.message, false);
        });
}

// ─── TOAST ───
function showToast() {
    toast.classList.add('show');
    setTimeout(function() {
        toast.classList.remove('show');
    }, 2000);
}

// ─── EVENTS ───
sendBtn.addEventListener('click', handleSend);

userInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleSend();
    }
});

updateColorsBtn.addEventListener('click', showToast);

// ─── INIT ───
window.addEventListener('load', function() {
    userInput.focus();
});