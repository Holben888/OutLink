
var elementURL = chrome.runtime.getURL("app/pages/floating-charm/charm.html");
var imgs = {
    outlookLogo: chrome.runtime.getURL("images/outlook-logo-white.png"),
    loading: chrome.runtime.getURL("images/loading.gif")
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.greeting == "hello")
            sendResponse({ farewell: "goodbye" });
    });

function makeHttpObject() {
    try { return new XMLHttpRequest(); }
    catch (error) { }
    try { return new ActiveXObject("Msxml2.XMLHTTP"); }
    catch (error) { }
    try { return new ActiveXObject("Microsoft.XMLHTTP"); }
    catch (error) { }

    throw new Error("Could not create HTTP request object.");
}
var request = makeHttpObject();
request.open("GET", elementURL, true);
request.send(null);
//Creates a node to append the Charm layout to
var idiv = document.createElement("div");
var iframe = document.createElement("iframe");


$(document).ready(function () {
    console.log("ready");
    idiv.setAttribute('style', charmStyle['idiv']);
    iframe.src = elementURL;
    iframe.height = 80;
    iframe.width = 45;
    iframe.frameBorder = 0;
    iframe.scrolling = 'no';
    iframe.id = "charm-iframe"
    idiv.appendChild(iframe);

    document.body.appendChild(idiv);
    /*iframe.document.addEventListener('click', function(event) {
        console.log(event);
    },false)

    addEventListener("message", function (event) {
        if (event.origin + "/" == chrome.extension.getURL(""))
            alert(event.data);
    }, false);*/
})

/*request.onreadystatechange = function () {
    if (request.readyState == 4) {
        node.innerHTML = request.responseText;
        iframe.src = elementURL;
        iframe.style.display = 'none';
        iframe.setAttribute(style, 'height: 100%; width: 100%');
        document.body.appendChild(iframe);
    }

    //If the HTML is loaded and appended successfully, we add the necessary attributes
    if (node.hasChildNodes()) {
        //Set styles externally (prevents webpage styling conflicts)
        node.setAttribute('style', charmStyle['charm']);
        node.id = "slideInCharm";

        var containers = node.querySelectorAll('div');
        console.log(node.childNodes);

        var emailContainer = node.getElementsByClassName("email-iframe-container")[0];
        emailContainer.setAttribute('style', charmStyle['email-iframe-container']);

        var btns = node.getElementsByClassName('charm-btn');
        for (let i = 0; i < btns.length; i++) {
            btns[i].setAttribute('style', charmStyle['charm-btn']);
            if (btns[i].getElementsByTagName('img').length)
                btns[i].getElementsByTagName('img')[0].setAttribute('style', charmStyle['btn-img']);
        }

        var loginBtn = btns[1];
        loginBtn.setAttribute('style', charmStyle['hidden']);

        var refreshMailBtn = btns[0];
        refreshMailBtn.getElementsByTagName('img')[0].src = imgs.outlookLogo;
        refreshMailBtn.addEventListener('click', function () {
            node.id = "slideInCharmFull";
            refreshMailBtn.getElementsByTagName('img')[0].src = imgs.loading;
            chrome.runtime.sendMessage("fetch", function (response) {
                console.log(response);
                if (response.body) {
                    emailContainer.setAttribute('style', charmStyle["email-iframe-container-visible"]);
                    var iframe = emailContainer.getElementsByTagName("iframe")[0];
                    iframe.contentDocument.body.innerHTML = response.body;
                    node.style.width = emailContainer.style.width;

                    //var subject = emailContainer.getElementsByTagName("h1")[0];
                    //subject.setAttribute('style', defaultStyle);

                    refreshMailBtn.getElementsByTagName('img')[0].src = imgs.outlookLogo;
                } else {

                }
            });
        });
    }
};*/
