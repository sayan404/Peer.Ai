// for search anything by opening a new tab
let payloadData = "", message = "", tabId = 0, originalPayloadData = ""
const listOfActivetedTab = new Array
const bookmarksArray = []
const listOfActivetedTabsWithAllDetails = []
const listOfActivetedTabWithActualValue = []
let link
const numberObj = {
    "first": 1,
    "second": 2,
    "third": 3,
    "fourth": 4,
    "fifth": 5
}


// ------------
let linkTitle = []
 let linkUrl = []
let webpageContent = ""
 let i = 0;
// let j = 0;
//Getting the links from content.js
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log("ok1");
    if (message.action === 'sendLinks') {
        for(i; i < message.Title.length; i++){
            linkTitle[i] = message.Title[i].replaceAll(/[- )(.,;]/g, '').toLowerCase();
            
        }
        //linkTitle = message.Title[0]
        linkUrl = message.links[0]
        console.log('Links received:', message.links);
        console.log("Title:", message.Title);
        sendResponse({ received: "ok" });
        // Handle the received links as needed

    }
});

// opne link from quary result page
function openLink(payloadData) {
    console.log("called");
   
    let flag = linkTitle[0].includes(payloadData)
    if (flag) {
        console.log("ok2");
        chrome.tabs.update({ url: linkUrl });
    }
}

//geting comntent of current page from content.js
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'sendWebpageContent') {
        // Process the webpage content received from the content script
        webpageContent = request.content;
        console.log('Webpage content:', webpageContent);

        // Perform any further analysis or interaction with the content here
        // ...
    }
});

//function to interact with the current page
function getPageContent() {
    let allWebPageData;

    if (webpageContent.length > 100) {
        webpageContent = webpageContent.slice(0, 100);
        allWebPageData = ` Analyse this Innertext of a webpage and Give Summary within 60 words, the innertext is"${webpageContent}"`
    }
    makeAPIRequest(allWebPageData)

}

async function makeAPIRequest(modeActivation) {
    const apiKey = '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';
    const apiUrl = 'https://api.openai.com/v1/engines/text-davinci-003/completions';
    console.log("ok111");
    const prompt = modeActivation;
    const maxTokens = 400;
    const temperature = 5;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
    };

    const body = JSON.stringify({
        prompt,
        max_tokens: maxTokens,
        temperature,
    });

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body,
    });

    const data = await response.json();
    const promptData = data.choices[0].text
    console.log(promptData);
    chrome.runtime.sendMessage({ prompt: promptData });

    // Handle the response data as needed
}

// Function to execute the content script in the active tab 
function executeContentScript() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        // Get the active tab
        var activeTab = tabs[0];
        console.log("executeContentScript function called");
        // Execute the content script
        chrome.tabs.sendMessage(activeTab.id, { action: "fromPopup" }, (response) => {
            chrome.tabs.executeScript(
                {
                    target: { tabId: activeTab.id, allFrames: true },
                    files: ['content.js']
                },
                function () {
                    if (chrome.runtime.lastError) {
                        console.error('Failed to execute content script:', chrome.runtime.lastError);
                        return;
                    }
                    // Content script has been executed
                    console.log('Content script executed');
                });
        })

    });
}

//-----------------------------

// get List Of All Activated Tabs

function getListOfAllActivatedTabs() {
    try {
        chrome.tabs.query({}, function (tabs) {
            // console.log(typeof (tabs));
            for (let index = 0; index < tabs.length; index++) {
                // console.log(tabs[index].title);
                if (!listOfActivetedTabsWithAllDetails.includes(tabs[index])) {
                    listOfActivetedTabWithActualValue.push(tabs[index]);
                    tabs[index].title = tabs[index].title.replaceAll(/[- )(.,;]/g, '')
                    listOfActivetedTabsWithAllDetails.push(tabs[index])
                }
                const title = tabs[index].title;
                // console.log(listOfActivetedTabsWithAllDetails[index].title);
                if (!listOfActivetedTab.includes(title)) {
                    listOfActivetedTab.push(title)
                }
            }
            // console.log(typeof (listOfActivetedTab));
        })
    }
    catch (e) {
        console.log(e);
    }
}

// search anything by opening a new tab

async function searchAnythingWithquery(payloadData, tabId) {
    let url =
        `https://www.google.com/search?q=${payloadData}`;
    try {
        //    await chrome.runtime.sendMessage({ prompt: "Opened the desiered Tab" });
        await chrome.tabs.create({ url: url }, async function (tab) {
            await chrome.tabs.update(null, { url: url }, function (tab) {
            });
        })
        //count++;
        // }
        //scrap data when tab is oppend
        chrome.tabs.onActivated.addListener(
            executeContentScript()
        )

    }
    catch (e) {
        console.log(e);
    }
}



// search websitees from bookmark 

function searchFromBookmark(payloadData) {
    console.log(payloadData);
    for (let i = 0; i < bookmarksArray.length; i++) {
        const element = bookmarksArray[i];
        console.log(element);
        if (element.title.toLowerCase().includes(payloadData) || element.url.toLowerCase().includes(payloadData)) {
            // console.log(1);
            link = element.url
            console.log(link);
            break;
        }
    }
    if (link) {
        // console.log(link);
        chrome.tabs.create({ url: `https://www.google.com/` }, async function (tab) {
            chrome.tabs.update(null, { url: link }, function (tab) {
            });
        })
        chrome.runtime.sendMessage({ prompt: "Opened the desiered Tab From Bookmark" });
    }
    else {
        chrome.runtime.sendMessage({ prompt: "No link found" });
    }

}


// get all bookmarks 

function getAllBookMarks() {

    chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
        // console.log(bookmarkTreeNodes);
        // Recursive function to traverse the bookmark tree nodes
        function traverseBookmarks(nodes) {
            // console.log(nodes);
            for (let node of nodes) {
                // Check if the node is a bookmark
                // console.log(node);
                if (node.url) {
                    bookmarksArray.push({
                        id: node.id,
                        title: node.title,
                        url: node.url
                    });
                }
                // Check if the node has children (sub-folders)
                if (node.children) {
                    traverseBookmarks(node.children);
                }
            }
            // console.log(bookmarksArray);
            // console.log("printed");
        }
        traverseBookmarks(bookmarkTreeNodes);

    });
}

getAllBookMarks()


// add to Bookmark 

function addCurrentTabToBookmarks() {
    // console.log("working prop");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const currentTab = tabs[0];
        console.log(tabs);
        chrome.bookmarks.create({ title: currentTab.title, url: currentTab.url }, function (bookmark) {
            // console.log("Bookmark added:", bookmark);
        });
    });
    chrome.runtime.sendMessage({ prompt: "Added to Bookmark" });
    // getAllBookMarks()
}


// remove Bookmark

function removeBookmark(url) {
    let bookmarkId = ""
    chrome.bookmarks.search({ url: url }, function (results) {
        console.log(results);
        if (results.length > 0) {
            // Assuming the URL is unique, we can use the first result's ID
            console.log(typeof (results[0].id));
            bookmarkId = results[0].id;
            chrome.bookmarks.remove(bookmarkId, function () {
                // console.log("Bookmark removed:", bookmarkId);
                chrome.runtime.sendMessage({ prompt: "Removed from Bookmark" });
            })
        } else {
            chrome.runtime.sendMessage({ prompt: "No Bookmark found" });
        }
    });

    // console.log("wrok");
    getAllBookMarks()
}

// switch tab 

async function switchTab(nextTab) {
    try {
        await chrome.tabs.update(nextTab, { active: true });
        chrome.runtime.sendMessage({ prompt: "Switched to desiered tab" });
    } catch (e) {
        console.log(e)
    }
}

// mute tab using tabid
async function toggleMuteState(tabId) {
    try {
        const tab = await chrome.tabs.get(tabId);
        const muted = !tab.mutedInfo.muted;   // takes true or false value
        await chrome.tabs.update(tabId, { muted });
        console.log(`Tab ${tab.id} is ${muted ? "muted" : "unmuted"}`);
    }
    catch (e) {
        console.log(e);
    }
}

// open previous tabs 

async function openPrevTabs() {
    try {
        await chrome.sessions.getRecentlyClosed({ maxResults: 2 }, function (sessions) {
            if (sessions && sessions.length > 0) {
                for (let session of sessions) {
                    if (session.tab && session.tab.url) {
                        console.log('session:', session);
                        console.log('Recently closed tab URL:', session.tab.url);
                    }
                }
            } else {
                console.log('No recently closed tabs found.');
            }
        });
    }
    catch (e) {
        console.log(e);
    }
    //Restore tabs
    try {
        await chrome.sessions.restore((restoredSession) => {
            if (restoredSession) {
                console.log('restoredSession:', restoredSession);
                hrome.runtime.sendMessage({ prompt: "Opened the previous tab" });
            } else {
                chrome.runtime.sendMessage({ prompt: "No recently closed tabs found" });
            }
        })
    }
    catch (e) {
        console.log(e);
    }
}

// close tabs
async function closeTabs(tabId) {
    try {
        await chrome.tabs.remove(
            tabId, function () {
                // console.log('Tab closed');
                chrome.runtime.sendMessage({ prompt: "Closed the tab" });
            })
    }
    catch (e) {
        console.log(e);
    }
}


// api call
// background.js

// Function to make the API request
async function makeAPIRequest(modeActivation) {
    const apiKey = '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';
    const apiUrl = 'https://api.openai.com/v1/engines/text-davinci-003/completions';
    console.log("ok111");
    const prompt = modeActivation;
    const maxTokens = 50;
    const temperature = 1;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
    };

    const body = JSON.stringify({
        prompt,
        max_tokens: maxTokens,
        temperature,
    });
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body,
        });
        const data = await response.json();
        console.log(data);
        const promptData = data.choices[0].text
        console.log(promptData);
        chrome.runtime.sendMessage({ prompt: promptData });
    }
    catch (e) {
        console.log(e);
    }


    // Handle the response data as needed
}

// Call the function when needed
//   makeAPIRequest();


// close All tabs

async function closeAllTabs() {
    try {
        const tabs = await chrome.tabs.query({});
        for (let i = 0; i < tabs.length; i++) {
            const element = tabs[i].id;
            await chrome.tabs.remove(
                Number(element), function () {
                    // Tab closed successfully
                    console.log('Tab closed');
                })
        }
        chrome.runtime.sendMessage({ prompt: "closed all the active tabs" });
    }
    catch (e) {
        console.log("not found");
    }
}


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    getListOfAllActivatedTabs()
    message = request.message;
    console.log(message);

    if (request.action && request.action.toLowerCase().includes("refresh")) {

        tabId = request.tabId
        console.log(tabId);
        chrome.tabs.reload(tabId);
        // console.log(tabs);
    }
    if (message && message.includes("messageFromPopup")) {
        url = request.url
        tabId = request.tabId
        console.log(tabId);
        if (payloadData != undefined) {
            payloadData = request.payload[0].transcript.replaceAll(/[- )(.,;]/g, '').toLowerCase();
            console.log(payloadData);
            getListOfAllActivatedTabs()
            if (payloadData.includes("open")) {
                console.log("opening");
                payloadData = payloadData.slice(4)
                searchAnythingWithquery(payloadData, tabId);
                // getListOfAllActivatedTabs()

            }
            //refresh tab
            else if (payloadData.includes("refresh")) {
                //if(request.action === "refresh"){
                chrome.tabs.reload(tabId);
                //}
            }
            else if (payloadData.includes("switchto")) {
                getListOfAllActivatedTabs()
                // console.log("working 1");
                payloadData = payloadData.slice(8)
                if (payloadData.length > 0) {
                    // identifying the tab that is to switched
                    console.log(payloadData);
                    for (let index = 0; index < listOfActivetedTabsWithAllDetails.length; index++) {
                        console.log("working 3");
                        const element = listOfActivetedTabsWithAllDetails[index].title;
                        console.log(element);
                        if (element.toLowerCase().includes(payloadData)) {
                            console.log("working 4");
                            switchTab(listOfActivetedTabsWithAllDetails[index].id);
                            break;
                        }
                        else {
                            continue;
                        }
                    }
                    chrome.runtime.sendMessage({ msg: "link oppend" });
                }
            }
            else if (payloadData.includes("mute") || payloadData.includes("unmute")) {
                toggleMuteState(tabId);
            }
            else if (payloadData.includes("restoretab")) {
                getListOfAllActivatedTabs()
                openPrevTabs();
            }
            else if (payloadData.includes("closetab")) {
                getListOfAllActivatedTabs()
                closeTabs(tabId);
            }
            else if (payloadData.includes("closealltab")) {

                closeAllTabs(tabId);
            }
            else if (payloadData.includes("listofbookmark")) {
                getAllBookMarks();
            }
            else if (payloadData.includes("frombookmark")) {
                payloadData = payloadData.slice(12)
                searchFromBookmark(payloadData);
            }
            else if (payloadData.includes("addtobookmark")) {
                addCurrentTabToBookmarks();
            }
            else if (payloadData.includes("removebookmark")) {   // not working 
                console.log(url);
                removeBookmark(url);
            }
            else if (message.includes("chat")) {   // not working 
                modeActivation = request.prompt
                console.log(modeActivation);
                makeAPIRequest(modeActivation);
            }
            //link opening
            else if (payloadData.includes("click")) {
                payloadData = payloadData.slice(5)
                openLink(payloadData);
            }
            //content scrapting
            else if (payloadData.includes("readthepage")) {
                payloadData = payloadData.slice(5)
                getPageContent();
            }
        }
    }
    else if (request.message == "messageFromContentScript") {
        getListOfAllActivatedTabs()
        console.log(request.message)
    }
    else {
        console.log("there is nothing like that");
    }

});


