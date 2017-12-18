chrome.storage.local.get('annotationText', function (keys) {
    if (keys.annotationText) {
        document.getElementsByClassName('container')[0].innerHTML = keys.annotationText;
    }
})