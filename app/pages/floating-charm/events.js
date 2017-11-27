console.log("Im running")

document.getElementById('refresh-btn').addEventListener('click', function (event) {
    //alert('clicked!');
    chrome.runtime.sendMessage("fetchInbox", function (response) {
        console.log(response);
    });
})