var iframe = null;
var msgsExpanded = false;
var frameShrink = false;
var firstMsg = {};
chrome.storage.local.get('currentURLObject', function (keys) {
    if (keys.currentURLObject) {
        iframe = document.getElementsByTagName('iframe')[0];
        iframe.width = 400;
        iframe.height = 355;
        iframe.frameBorder = 0;
        iframe.contentDocument.head.innerHTML = '<base target="_blank">';
        iframe.contentDocument.body.innerHTML = keys.currentURLObject.messages[0].body;
        let header = "<b>" + (keys.currentURLObject.messages[0].from.name || keys.currentURLObject.messages[0].from.address) +
            "</b> " + keys.currentURLObject.messages[0].subject;
        document.getElementsByClassName('email-header')[0].innerHTML = header;
        let msgDivs = "";
        let msgContainer = document.getElementById('msg-container');

        firstMsg = keys.currentURLObject.messages[0];

        //Append messages to the message viewer
        for (const [index, msg] of keys.currentURLObject.messages.entries()) {
            let div = document.createElement('div');

            div.innerHTML = "<b>" + (msg.from.name || msg.from.address) + "</b> " + msg.subject;
            div.addEventListener('click', function (event) {
                iframe.contentDocument.body.innerHTML = msg.body;
                checkForAnnotationInfo(msg);
                let header = "<b>" + (msg.from.name || msg.from.address) + "</b> " + msg.subject;
                document.getElementsByClassName('email-header')[0].innerHTML = header;
                msgsExpanded = !msgsExpanded;
                document.getElementById('msg-container').className = msgsExpanded ? 'message-container expanded' : 'message-container collapsed';
            })
            msgContainer.appendChild(div);
            if (index != keys.currentURLObject.messages.length - 1)
                msgContainer.appendChild(document.createElement('hr'));
        }
    }
})

function checkForAnnotationInfo(msg) {
    let testDiv = document.getElementById('hiddenAnnotationContainer');
    if (testDiv)
        testDiv.innerHTML = msg.body;
    else {
        testDiv = document.createElement('span');
        testDiv.innerHTML = msg.body;
        testDiv.id = "hiddenAnnotationContainer"
        testDiv.setAttribute('style', 'overflow:hidden; float:left; display:none; line-height:0px;');
        document.body.appendChild(testDiv);
    }
    if (document.getElementById('hiddenAnnotationInfo'))
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { 'annotationInfo': document.getElementById('hiddenAnnotationInfo').innerHTML });
        });
}

document.getElementById('btn-expand').addEventListener('click', function (event) {
    checkForAnnotationInfo(firstMsg);
    if (iframe) {
        document.getElementById('container').className = 'email-container expanded';
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, 'expandFrame');
        });
    }
})
document.getElementById('btn-collapse').addEventListener('click', function (event) {
    document.getElementById('container').className = 'email-container collapsed';
    iframe.height = 355;
    frameShrink = false;
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, 'collapseFrame');
    });
})
document.getElementById('btn-shrink').addEventListener('click', function (event) {
    frameShrink = !frameShrink;
    if (frameShrink) {
        document.getElementById('container').className = 'email-container small expanded';
        iframe.height = 205;
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, 'shrinkFrame');
        });
    } else {
        document.getElementById('container').className = 'email-container expanded';
        iframe.height = 355;
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, 'expandFrame');
        });
    }
})
document.getElementById('btn-all-msgs').addEventListener('click', function (event) {
    msgsExpanded = !msgsExpanded;
    document.getElementById('msg-container').className = msgsExpanded ? 'message-container expanded' : 'message-container collapsed';
})