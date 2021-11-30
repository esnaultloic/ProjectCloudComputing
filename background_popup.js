'use strict';

var url_ = ""

chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    url_ = tabs[0].url;
});


// activate extension when host is www.website.com
chrome.runtime.onInstalled.addListener(function () {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: { hostEquals: url_ },
            })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});