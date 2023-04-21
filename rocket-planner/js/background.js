importScripts('action-items-utils.js', '/packages/uuidv4.min.js');

let actionItemsUtils = new Actionitems();

chrome.contextMenus.create({
    "id": "linkSiteMenu",
    "title": "Link site for later",
    "contexts": ["all"]
})

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason == 'install') {
        console.log("On installed");
        chrome.storage.sync.set({
            actionItems: []
        })
    }
})
chrome.contextMenus.onClicked.addListener((info, tab) => {
    // console.log(actionItemsUtils);
    if (info.menuItemId == 'linkSiteMenu') {
        Actionitems.addQuickActionItem('quick-action-2', 'Read this site', tab, () => {
            Actionitems.setProgress();
        })
    }
})

