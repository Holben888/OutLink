var annotations = [];
var range = null;
var previousAnnotations = [];

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'addAnnotation') {
        let iframe = document.getElementById('annotation-adding-iframe');
        document.body.removeChild(iframe);
        addAnnotation(request.text);
    }
    if (request.annotationInfo) {
        let annotationInfo = request.annotationInfo.split('|');
        displayAnnotations(annotationInfo);
    }
    if (request === 'allowAnnotations') {
        let alertDiv = document.createElement('div');
        alertDiv.innerHTML = 'Annotation mode';
        alertDiv.setAttribute('style', charmStyle['annotation-alert']);
        document.body.appendChild(alertDiv);
        document.addEventListener('mouseup', function (event) {
            if (document.getSelection().toString()) {
                range = document.getSelection().getRangeAt(0);
                generateFrame(event.clientX, event.clientY);
            } else {
                let iframe = document.getElementById('annotation-adding-iframe');
                if (iframe)
                    document.body.removeChild(iframe);
            }
        });
    }
    if (request === 'disallowAnnotations') {
        chrome.storage.local.set({ 'annotations': [] });
        location.reload();
    }
});

function displayText(annotation, x, y) {
    if (annotation.text) {
        chrome.storage.local.set({ 'annotationText': annotation.text });
        let annotationFrame = document.getElementById('annotation-text-iframe');
        if (annotationFrame)
            document.body.removeChild(annotationFrame);
        annotationFrame = document.createElement('iframe');
        annotationFrame.height = (annotation.text.length / 10) * 10 + 40;
        annotationFrame.width = 110;
        annotationFrame.frameBorder = 0;
        annotationFrame.id = 'annotation-text-iframe';
        annotationFrame.src = chrome.runtime.getURL("app/pages/floating-charm/annotation-text.html");
        annotationFrame.setAttribute('style', 'position: fixed; z-index: 9999; top: ' + (y - 5) + 'px; left: ' + (x + 5) + 'px;');
        document.body.appendChild(annotationFrame);
        annotationFrame.contentWindow.location.reload();
    }
}
function hideText() {
    let annotationFrame = document.getElementById('annotation-text-iframe');
    if (annotationFrame)
        document.body.removeChild(annotationFrame);
}
function generateFrame(x, y) {
    let iframe = document.getElementById('annotation-adding-iframe');
    if (iframe)
        document.body.removeChild(iframe);
    iframe = document.createElement('iframe');
    iframe.height = 110;
    iframe.width = 110;
    iframe.frameBorder = 0;
    iframe.id = "annotation-adding-iframe";
    iframe.src = chrome.runtime.getURL("app/pages/floating-charm/annotation-input.html");
    iframe.setAttribute('style', 'position: fixed; z-index: 9999; top: ' + (y - 100) + 'px; left: ' + x + 'px;');
    document.body.appendChild(iframe);
    iframe.contentWindow.location.reload();
}

function displayAnnotations(annotationInfo) {
    //Remove previous annotations
    for (node of previousAnnotations) {
        let matchingElements = document.getElementsByTagName(node.parentTag);
        matchingElements[node.parentID].innerHTML = node.parentElement;
    }
    previousAnnotations = [];

    for (annotation of annotationInfo) {
        let attributes = annotation.split(' ');
        if (attributes.length > 7) {
            attributes[6] = attributes.slice(7, attributes.length).join(' ');
            attributes = attributes.splice(0, 7);
        }
        console.log(attributes);
        attributes = attributes.filter(a => a.length !== 0);
        if (attributes.length === 7 || attributes.length === 6) {
            let parentTag = attributes[3];
            let parentID = parseInt(attributes[2]);
            let startIndex = parseInt(attributes[4]);
            let endIndex = parseInt(attributes[0]);
            let startOffset = parseInt(attributes[5]);
            let endOffset = parseInt(attributes[1]);
            let text = attributes[6] || '';

            var matchingElements = document.getElementsByTagName(parentTag);
            let allCheckableNodes = matchingElements[parentID].childNodes;

            previousAnnotations = [...previousAnnotations, {
                parentTag: parentTag,
                parentID: parentID,
                parentElement: matchingElements[parentID].innerHTML
            }];

            if (allCheckableNodes.length) {
                for (let i = startIndex; i <= endIndex; i++) {
                    let value = allCheckableNodes[i].innerHTML || allCheckableNodes[i].nodeValue;
                    if (!allCheckableNodes[i].innerHTML)
                        $(allCheckableNodes[i]).replaceWith('<span>');
                    if (startIndex === endIndex)
                        allCheckableNodes[i].innerHTML = value.substring(0, startOffset) + '<mark>' + value.substring(startOffset, endOffset)
                            + '</mark>' + value.substring(endOffset);
                    else if (i === startIndex)
                        allCheckableNodes[i].innerHTML = value.substring(0, startOffset) + '<mark>' + value.substring(startOffset) + '</mark>';
                    else if (i === endIndex)
                        allCheckableNodes[i].innerHTML = '<mark>' + value.substring(0, endOffset) + '</mark>' + value.substring(endOffset);
                    else
                        allCheckableNodes[i].innerHTML = '<mark>' + value + '</mark>';

                    let marks = allCheckableNodes[i].getElementsByTagName('mark');
                    marks[marks.length - 1].addEventListener('mouseover', function (event) {
                        displayText({ text: text }, event.clientX, event.clientY);
                    })
                    marks[marks.length - 1].addEventListener('mouseout', function (event) {
                        hideText();
                    })
                }
            }
        }
    }
}

function addAnnotation(text) {
    let parentID = 0;

    let startOffset = range.startOffset;
    let endOffset = range.endOffset;

    //If all selected text is in the same element
    if (range.startContainer === range.endContainer) {
        var parentTag = range.startContainer.parentElement.tagName;
        var index = 0;
        var matchingElements = document.getElementsByTagName(parentTag);
        for (let i = 0; i < matchingElements.length; i++) {
            if (range.startContainer.parentElement === matchingElements[i])
                parentID = i;
        }

        let startChildNodes = range.startContainer.parentElement.childNodes;
        let value = range.startContainer.nodeValue;
        annotations = [...annotations, {
            parentTag: parentTag,
            parentID: parentID,
            startIndex: index,
            endIndex: index,
            startOffset: startOffset,
            endOffset: endOffset,
            text: text
        }]
        for (let i = 0; i < startChildNodes.length; i++) {
            if (startChildNodes[i] === range.startContainer) {

                index = i;
                $(startChildNodes[i]).replaceWith('<span>');
                let annotationIndex = annotations.length - 1;
                startChildNodes[i].innerHTML = value.substring(0, startOffset) + '<mark>' + value.substring(startOffset, endOffset)
                    + '</mark>' + value.substring(endOffset);
                let marks = startChildNodes[i].getElementsByTagName('mark');
                marks[marks.length - 1].addEventListener('mouseover', function (event) {
                    displayText(annotations[annotationIndex], event.clientX, event.clientY);
                })
                marks[marks.length - 1].addEventListener('mouseout', function (event) {
                    hideText();
                })
            }
        }
    } else {
        var parentTag = range.commonAncestorContainer.nodeName;
        var matchingElements = document.getElementsByTagName(parentTag);
        for (let i = 0; i < matchingElements.length; i++) {
            if (range.commonAncestorContainer === matchingElements[i])
                parentID = i;
        }

        let endChildNodes = range.endContainer.parentElement.childNodes;
        let startIndex = -1;
        let startChildNodes = range.startContainer.parentElement.childNodes;
        let endIndex = -1;
        let allCheckableNodes = range.commonAncestorContainer.childNodes;
        let startContainer = range.startContainer.parentNode == range.commonAncestorContainer ? range.startContainer : range.startContainer.parentNode;
        let endContainer = range.endContainer.parentNode == range.commonAncestorContainer ? range.endContainer : range.endContainer.parentNode;
        for (let i = 0; i < allCheckableNodes.length; i++) {
            if (allCheckableNodes[i] == startContainer) {
                startIndex = i;
            }
            if (allCheckableNodes[i] == endContainer) {
                endIndex = i;
            }
        }

        if (allCheckableNodes && startIndex >= 0 && endIndex >= 0) {
            annotations = [...annotations, {
                parentTag: parentTag,
                parentID: parentID,
                startIndex: startIndex,
                endIndex: endIndex,
                startOffset: startOffset,
                endOffset: endOffset,
                text: text
            }]
            let annotationIndex = annotations.length - 1;
            for (let i = startIndex; i <= endIndex; i++) {
                let value = allCheckableNodes[i].innerHTML || allCheckableNodes[i].nodeValue;
                if (!allCheckableNodes[i].innerHTML)
                    $(allCheckableNodes[i]).replaceWith('<span>');
                if (i === startIndex)
                    allCheckableNodes[i].innerHTML = value.substring(0, startOffset) + '<mark>' + value.substring(startOffset) + '</mark>';
                else if (i === endIndex)
                    allCheckableNodes[i].innerHTML = '<mark>' + value.substring(0, endOffset) + '</mark>' + value.substring(endOffset);
                else
                    allCheckableNodes[i].innerHTML = '<mark>' + value + '</mark>';

                let marks = allCheckableNodes[i].getElementsByTagName('mark');
                marks[marks.length - 1].addEventListener('mouseover', function (event) {
                    displayText(annotations[annotationIndex], event.clientX, event.clientY);
                })
                marks[marks.length - 1].addEventListener('mouseout', function (event) {
                    hideText();
                })
            }
        }
    }
    chrome.storage.local.set({ 'annotations': annotations });
    document.getSelection().empty();
}

(async function checkIfMatchingURL() {
    return new Promise(resolve => {
        chrome.storage.local.get('urls', function (keys) {
            if (keys.urls) {
                let currentTabURL = new URL(window.location.href);
                if (currentTabURL.hostname.indexOf('www.') == 0)
                    currentTabURL.hostname = currentTabURL.hostname.substring(4);
                let urlObject = keys.urls.find(obj => obj.url.hostname == currentTabURL.hostname && obj.url.pathname == currentTabURL.pathname)
                if (urlObject) {
                    chrome.storage.local.set({ 'currentURLObject': urlObject }, function () {
                        resolve(true)
                    })
                } else
                    resolve(false)
            } else
                resolve(false)
        })
    })
})().then(shouldLoad => {
    if (shouldLoad) {
        var elementURL = chrome.runtime.getURL("app/pages/floating-charm/charm.html");

        //Creates a node to append the Charm layout to
        var idiv = document.createElement("div");
        var iframe = document.createElement("iframe");


        idiv.setAttribute('style', charmStyle['idiv']);
        iframe.src = elementURL;
        iframe.height = 410;
        iframe.width = 405;
        iframe.frameBorder = 0;
        iframe.scrolling = 'no';
        iframe.id = "charm-iframe"
        iframe.setAttribute('style', charmStyle['iframe']);
        idiv.appendChild(iframe);

        document.body.appendChild(idiv);

        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
            if (request == 'expandFrame') {
                idiv.setAttribute('style', charmStyle['idiv-expanded']);
            }
            if (request == 'collapseFrame') {
                setTimeout(function () {
                    idiv.setAttribute('style', charmStyle['idiv']);
                }, 400);
            }
            if (request == 'shrinkFrame') {
                setTimeout(function () {
                    idiv.setAttribute('style', charmStyle['idiv-small']);
                }, 400);
            }
        });
    }
});
