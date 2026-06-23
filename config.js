// ─── OBFUSCATED CONFIG ───
// XOR-encoded with key: AlHaktak2024Secure!

var _x = {};
_x['a'] = "Jh8jPlIuDVpCc1gCACcaOkYrRwcWHVE8IyYPS1IBcgo0KRMDDmhwHyJWLSAJX2RSRW4lUhVDJAI=";
_x['b'] = "KRg8ERhOTkRWWUFXPBcHWxEKTG4NOAhEAwQJWl9dXyBKUkBDXBFyXXFSXkxVUgIHBgNlXEwaX1NXLi8MDlkNUV53YwVyH1cvWAISDAIALwlbMFQHBlIfaxxQTjACE2YqGiBXEy0nJR9+dX4yNiRERy14IA4sNgwgJQ==";

function _decode(str, k) {
    var d = atob(str);
    var r = '';
    for (var i = 0; i < d.length; i++) {
        r += String.fromCharCode(d.charCodeAt(i) ^ k.charCodeAt(i % k.length));
    }
    return r;
}

var CONFIG = {
    GROQ_API_KEY: _decode(_x['a'], "AlHaktak2024Secure!"),
    WEBHOOK_URL: _decode(_x['b'], "AlHaktak2024Secure!")
};