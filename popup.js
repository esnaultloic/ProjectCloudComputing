'use strict';


// start navigation when #startNavigation button is clicked
startNavigation.onclick = function (element) {


    var url_ = document.getElementById("url_value").value;


    // query the current tab to find its id
    chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
            // navigate to next url
            await goToPage(url_,1, tabs[0].id);

            // wait for 5 seconds
            await waitSeconds(5);
        // navigation of all pages is finished
        alert('Navigation Completed');
    });
};

async function goToPage(url, url_index, tab_id) {
    return new Promise(function (resolve, reject) {
        // update current tab with new url
        chrome.tabs.update({ url: url });

        var str = document.getElementById("question").value;

        

        // fired when tab is updated
        chrome.tabs.onUpdated.addListener(function openPage(tabID, changeInfo) {
            // tab has finished loading, validate whether it is the same tab
            if (tab_id == tabID && changeInfo.status === 'complete') {
                // remove tab onUpdate event as it may get duplicated
                chrome.tabs.onUpdated.removeListener(openPage);

                // fired when content script sends a message
                chrome.runtime.onMessage.addListener(function getDOMInfo(message) {
                    

                    // remove onMessage event as it may get duplicated
                    chrome.runtime.onMessage.removeListener(getDOMInfo);

                    // save data from message to a JSON file and download
                    let json_data = {
                        question: str,
                        title: JSON.parse(message).title,
                        h1: JSON.parse(message).h1,
                        url: url,
                    };

                    // Clean les valeurs du json
                    var array1 = json_data.h1;
                    var array_length = array1.length - 5;
                    var urls = [];

                    for (const element of array1) {
                        
                        element[0] = element[0].replace(/\n/g, '');
                        element[0] = element[0].replace(/â€“/g, '-');
                        element[0] = element[0].replace(/ *\[[^\]]*]/g, '');
                        console.log(element);
                    }
                    // Mettre code julien pour appeler l'api
                    const asyncPostCall = async () => {
                        try {
                            const response = await fetch('https://myimage2-67y5rgdn7q-ew.a.run.app', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    // your expected POST request payload goes here
                                    question: json_data.question,
                                    h1: json_data.h1
                                })
                            });
                            const data = await response.json();
                            // enter you logic when the fetch is successful
                            console.log(data);
                            const element = document.getElementById("answer");
                            element.innerHTML = data.answer;
                        } catch (error) {
                            // enter your logic for when there is an error (ex. error toast)

                            console.log(error)
                        }
                    }

                    asyncPostCall()
        
                    let blob = new Blob([JSON.stringify(json_data)], { type: "application/json;charset=utf-8" });
                    let objectURL = URL.createObjectURL(blob);
                    chrome.downloads.download({ url: objectURL, filename: ('content/' + url_index + '/data.json'), conflictAction: 'overwrite' });
                    
                });



                // execute content script
                chrome.tabs.executeScript({ file: 'content_script_popup.js' }, function () {
                    // resolve Promise after content script has executed
                    resolve();
                });
            }
        });
    });
}

// async function to wait for x seconds 
async function waitSeconds(seconds) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve();
        }, seconds * 1000);
    });
}


