
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.query == "checkPrice") {
            
            fetch(request.url)
                .then(response => {
                    response.text().then(value => sendResponse({ success: response.ok, status: response.status, body: value }));
                
                })
                .catch(error => {
                    console.log(error);
                })
            return true; // Will respond asynchronously.
        } else if(request.query == "checkUsedPrice") {
            
            fetch(request.url)
                .then(response => {
                    response.text().then(value => sendResponse({ success: response.ok, status: response.status, body: value }));
                })
                .catch(error => {
                    console.log(error);
                })
            return true; // Will respond asynchronously.
        } else if (request.query == "loadCurrencies") {
            fetch('https://open.er-api.com/v6/latest/EUR')
                .then(response => response.text())
                .then(document => sendResponse({status:1, content:document}))
                .catch(error => {
                    console.log(error);
                })
            
            return true;
        }   else if (request.query == "ipCoordinates") {
        } else if (request.query == "countryFromCoordinates") {
        }
    });