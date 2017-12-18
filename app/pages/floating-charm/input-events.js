document.addEventListener('keypress', function (event) {
    if (event.code === 'Enter') {
        sendAnnotation();
    }
})
document.getElementById('btn').addEventListener('click', function () {
    sendAnnotation();
})

function sendAnnotation() {
    let inputVal = document.getElementById('input').value;
    console.log(inputVal);
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'addAnnotation',
            text: inputVal
        });
    });
}