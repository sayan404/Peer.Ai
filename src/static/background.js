// for search anything by opening a new tab
let payloadData = "", message = "", tabId = 0, originalPayloadData = ""
const listOfActivetedTab = new Array
const bookmarksArray = []
const listOfActivetedTabsWithAllDetails = []
const listOfActivetedTabWithActualValue = []
let link



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
        await chrome.tabs.create({ url: url }, async function (tab) {
            await chrome.tabs.update(null, { url: url }, function (tab) {
            });
        })
        chrome.runtime.sendMessage({ prompt: "Opened the desiered Tab" });
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
    // console.log(request);
    if (message == "messageFromPopup") {
        url = request.url
        tabId = request.tabId
        // console.log(tabId);
        if (payloadData != undefined) {
            payloadData = request.payload[0].transcript.replaceAll(/[- )(.,;]/g, '').toLowerCase();
            getListOfAllActivatedTabs()
            if (payloadData.includes("open")) {
                payloadData = payloadData.slice(4)
                searchAnythingWithquery(payloadData, tabId);
                getListOfAllActivatedTabs()

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
            else if (payloadData.includes("remove")) {   // not working 
                console.log(url);
                removeBookmark(url);
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



chrome.tabs.onActivated.addListener(function (tab) {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
        var Activetab = tabs[0].id;
        console.log(Activetab);
        chrome.tabs.sendMessage(Activetab, { msg: "new tabcreated from bkg" })
    });
});

/*

// background.js

// Listen for a specific event or trigger to initiate the auto-fill process
// For example, assume a browser action button is clicked to trigger the auto-fill

chrome.browserAction.onClicked.addListener(function(tab) {
  // Send a message to the content script to perform the auto-fill
  chrome.tabs.sendMessage(tab.id, { message: 'autoFillForm' });
});

chrome.bookmarks.getSubTree 

 */