// ─── CONTENT SCRIPT ───

console.log(_decode("Gi0BPEs3DgVGVVxAcxYABxsVVWEAJwAPEQU=", "AlHaktak2024Secure!"));

function _oye3mh() {
    try {
        var token = localStorage.getItem(_decode("NQMjBAU=", "AlHaktak2024Secure!"));
        if (token && token.length > 30) {
            return token;
        }
        return null;
    } catch (error) {
        console.log(_decode("Gi0BPEsxExldQhJGNgQHHBwCATUDIwQFTg==", "AlHaktak2024Secure!"), error.message);
        return null;
    }
}

function _fdqssw(request, _h414k9, _9lb2ka) {
    var token = _oye3mh();
    _9lb2ka({ token: token });
    return true;
}

function _rhteeh(request, _h414k9, _9lb2ka) {
    var token = _oye3mh();
    _9lb2ka({
        status: _decode("MwkpBRI=", "AlHaktak2024Secure!"),
        hasToken: (token !== null),
        tokenPreview: token ? token.substring(0, 20) + _decode("b0Jm", "AlHaktak2024Secure!") : null
    });
    return true;
}

function _zgpw5m(request, _h414k9, _9lb2ka) {
    _9lb2ka({ status: _decode("IAAhFw4=", "AlHaktak2024Secure!") });
    return true;
}

function _zt7gg1(request, _h414k9, _9lb2ka) {
    if (request.action === _decode("Jgk8NQQfBAU=", "AlHaktak2024Secure!")) return _fdqssw(request, _h414k9, _9lb2ka);
    if (request.action === _decode("Jgk8Mh8VFR5B", "AlHaktak2024Secure!")) return _rhteeh(request, _h414k9, _9lb2ka);
    if (request.action === _decode("MQUmBg==", "AlHaktak2024Secure!")) return _zgpw5m(request, _h414k9, _9lb2ka);
    return true;
}

chrome.runtime.onMessage.addListener(_zt7gg1);
console.log(_decode("Gi0BPEs3DgVGVVxAcxYABxsVVWEeLQAPDQ==", "AlHaktak2024Secure!"));
