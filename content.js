// ─── CONTENT SCRIPT ───

console.log("[AI] Content script ready");

function getAuthToken() {
    try {
        var auth = localStorage.getItem('token');
        if (auth && auth.length > 30) {
            return auth;
        }
        return null;
    } catch (error) {
        console.log("[AI] Error reading auth:", error.message);
        return null;
    }
}

function handleGetAuth(request, sender, sendResponse) {
    var auth = getAuthToken();
    sendResponse({ auth: auth });
    return true;
}

function handleCheckStatus(request, sender, sendResponse) {
    var auth = getAuthToken();
    sendResponse({
        status: 'ready',
        hasAuth: (auth !== null),
        authPreview: auth ? auth.substring(0, 20) + '...' : null
    });
    return true;
}

function handlePing(request, sender, sendResponse) {
    sendResponse({ status: 'alive' });
    return true;
}

function handleMessage(request, sender, sendResponse) {
    if (request.action === 'getAuth') return handleGetAuth(request, sender, sendResponse);
    if (request.action === 'checkStatus') return handleCheckStatus(request, sender, sendResponse);
    if (request.action === 'ping') return handlePing(request, sender, sendResponse);
    return true;
}

chrome.runtime.onMessage.addListener(handleMessage);
console.log("[AI] Content script loaded");