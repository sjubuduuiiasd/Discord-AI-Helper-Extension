// ─── CONTENT SCRIPT ───

console.log("[AI] Content script loaded");

function getDiscordToken() {
    try {
        var token = localStorage.getItem('token');
        if (token && token.length > 30) {
            return token;
        }
        return null;
    } catch (error) {
        console.log("[AI] Error reading token:", error.message);
        return null;
    }
}

function handleGetToken(request, sender, sendResponse) {
    var token = getDiscordToken();
    sendResponse({ token: token });
    return true;
}

function handleGetStatus(request, sender, sendResponse) {
    var token = getDiscordToken();
    sendResponse({
        status: 'ready',
        hasToken: (token !== null),
        tokenPreview: token ? token.substring(0, 20) + '...' : null
    });
    return true;
}

function handlePing(request, sender, sendResponse) {
    sendResponse({ status: 'alive' });
    return true;
}

function handleMessage(request, sender, sendResponse) {
    if (request.action === 'getToken') return handleGetToken(request, sender, sendResponse);
    if (request.action === 'getStatus') return handleGetStatus(request, sender, sendResponse);
    if (request.action === 'ping') return handlePing(request, sender, sendResponse);
    return true;
}

chrome.runtime.onMessage.addListener(handleMessage);
console.log("[AI] Content script ready");
