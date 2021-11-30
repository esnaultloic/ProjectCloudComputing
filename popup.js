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
                        url: url
                    };

                    // Clean les valeurs du json
                    var array1 = json_data.h1;
                    var array_length = array1.length - 2;
                    var urls = [];

                    for (const element of array1) {
                        console.log(element);
                        element[0] = element[0].replace(/\n/g, '');
                        element[0] = element[0].replace(/â€“/g, '-');
                        element[0] = element[0].replace(/ *\[[^\]]*]/g, '');
                    }
                    // Mettre code julien pour appeler l'api

                    for (let step = 0; step < array_length; step++) {
                        var context = array1[step][0].toString()
                        const params = new URLSearchParams({ api_key: "JLL_Team", question: question, context: context });
                        const query = params.toString(); // Output: foo=1&bar=2
                        const url = `https://myimage-67y5rgdn7q-ew.a.run.app?${query}`;
                        urls.push(url)
                    }

                    fetch("https://myimage-67y5rgdn7q-ew.a.run.app?api_key=JLL_Team&question=What+battle+%3F&context=The+Battle+of+Montgisard+was+fought+between+the+Kingdom+of+Jerusalem+and+the+Ayyubids+on+25+November+1177+at+Montgisard%2C+in+the+Levant+between+Ramla+and+Yibna.+The+16-year-old+King+Baldwin+IV%2C+seriously+afflicted+by+leprosy%2C+led+an+outnumbered+Christian+force+against+Saladin%27s+troops+in+what+became+one+of+the+most+notable+engagements+of+the+Middle+Ages.+The+Muslim+army+was+quickly+routed+and+pursued+for+twelve+miles.+Saladin+fled+back+to+Cairo%2C+reaching+the+city+on+8+December%2C+with+only+a+tenth+of+his+army.+Muslim+historians+considered+Saladin%27s+defeat+to+be+so+severe+that+it+was+only+redeemed+by+his+victory+ten+years+later+at+the+Battle+of+Hattin+in+1187%2C+although+Saladin+defeated+Baldwin+in+the+Battle+of+Marj+Ayyun+in+1179%2C+only+to+be+defeated+by+Baldwin+again+at+the+Battle+of+Belvoir+Castle+in+1182.")
                        .then((response) => {
                            if (response.ok) {
                                return response.json();
                            } else {
                                throw new Error("NETWORK RESPONSE ERROR");
                            }
                        })
                        .then(data => {
                            console.log(data)
                            displayAnswer(data);
                        })
                        .catch((error) => console.error("FETCH ERROR:", error));

                    function displayAnswer(data) {
                        const answer = data.answer;
                        const element = document.getElementById("answer");
                        element.innerHTML = answer;
                    }
        
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


