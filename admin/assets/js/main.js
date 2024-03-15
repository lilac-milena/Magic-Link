// This code comes from the open source project Magic Link
// https://github.com/lilac-milena/Magic-Link
// Licensed via MPL-2.0 license
const customUrl = ""

// copy
function copyLink(text) {
    var input = document.createElement('input');
    input.setAttribute('readonly', 'readonly');
    input.setAttribute('value', text);
    document.body.appendChild(input);
    input.select();
    if (document.execCommand('copy')) {
        document.execCommand('copy');
        alert('Copied: '+ text);
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

// logout
function logout(path) {

    if (path == undefined) {
        path = '';
    }

   localStorage.removeItem("auth")

    // redirect
    window.location.href = '/admin/?to='+path;
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

// Magic Link
function ml_getCustomUrl() {
    return customUrl;
}

function ml_sessionLogin(auth) {
    return new Promise((resolve, reject) => {
        var settings = {
            "url": customUrl+"/admin/api/auth",
            "method": "GET",
            "timeout": 0,
            "headers": {
                "type": auth.type,
                "session": auth.session
            },
            async: false,
            error: function (xhr, status, error) {
                // 获取状态码
                var s = xhr.status;
                if (s == 401) {
                    // 未登录
                    // alert('Login failed')
                    resolve({"status":false})
                } else {
                    // 获取返回信息
                    var msg = xhr.responseText;
                    msg = msg.error
                    resolve({"status":false, msg:msg})
                }
            }
        };

        $.ajax(settings).done(function(response) {
            // console.log(response);
            if (response.status == "OK") {
                resolve({"status":true, response})
            } else {
                resolve({"status":false})
            }
        });  
    })
}

function ml_convert(to, path, auth) {
    if (to == undefined || to == "") {
        return({"status":false, "msg":"URL can't be empty"})
    }

    if (path[0] != "/" && path != "") {
        path = "/" + path
    }

    var requestAdd = ""
    if(path != "") {
        requestAdd = "&path="+btoa(path)
    }

    if (to.startsWith("http://") == false && to.startsWith("https://") == false && to.startsWith("mailto:") == false && to.startsWith("ftp://") == false) {
        to = "https://" + to
    }

    return new Promise((resolve, reject) => {
        var settings = {
            "url": customUrl+"/admin/api/create?to="+btoa(to)+requestAdd,
            "method": "GET",
            "timeout": 0,
            "headers": {
                "type": auth.type,
                "session": auth.session
            },
            async: false,
            error: function (xhr, status, error) {
                // 获取状态码
                var s = xhr.status;
                if (s == 401) {
                    resolve({"status":false,"msg":"401"})
                } else {
                    resolve({"status":false, "msg":xhr.responseJSON.error})
                }
            }
        };

        $.ajax(settings).done(function(response) {
            console.log(response);
            if (response.error == undefined) {
                var furl = ""
                if (customUrl == "" || customUrl == undefined) {
                    furl = fullUrl()
                } else {
                    furl = customUrl
                }
                resolve({"status":true,"url": furl + response.path, "to": to})
            } else {
                resolve({"status":false,"msg":response.error})
            }
        });
    })
}

function ml_list() {

}
