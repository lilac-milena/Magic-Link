// get cookie
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');

        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);

            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));

                break;
            }
        }
    }

    return cookieValue;
}

// copy
function copyLink(text) {
    var input = document.createElement('input');
    input.setAttribute('readonly', 'readonly');
    input.setAttribute('value', text);
    document.body.appendChild(input);
    input.select();
    if (document.execCommand('copy')) {
        document.execCommand('copy');
        alert('Successful');
    }
    document.body.removeChild(input);
}

// full url
function fullUrl() {
    var domain = window.location.host
    var protocol = window.location.protocol
    var url = protocol + '//' + domain

    return url
}

// setCookie
function setCookie(name, value, days) {
    var expires = '';

    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));

        expires = '; expires=' + date.toUTCString();
    }

    document.cookie = name + '=' + (value || '') + expires + '; path=/admin/';
}

// logout
function logout(path) {

    if (path == undefined) {
        path = '';
    }

    // delete cookie
    setCookie('session', '', -1);
    // redirect
    window.location.href = fullUrl() + '/admin/?to='+path;
}

// get url param
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");

    var r = window.location.search.substr(1).match(reg);

    if (r != null) {
        return unescape(r[2]);
    }

    return null;
}