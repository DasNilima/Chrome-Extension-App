class Actionitems {
    addQuickActionItem = (id, text, tab, callback) => {
        let website = null;
        //quick action 2 = Link site for later
        if (id == "quick-action-2") {
            website = {
                url: tab.url,
                fav_icon: tab.favIconUrl,
                title: tab.title
            }
        }
        this.add(text, website, callback)
    }

    // create add () function
add = (text, website=null, callback) => {
    let actionItem = {
        id: uuidv4(),
        added: new Date().toString(),
        text: text,
        completed: null,
        website: website
    }
    chrome.storage.sync.get(['actionItems'], (data) => {
        // console.log(data);
        let items = data.actionItems;
        if (!items) {
            items = [actionItem]
        } else {
            items.push(actionItem);
        }
        chrome.storage.sync.set({
            actionItems: items
        }, () => {
            callback(actionItem);
        })
    })
}
//Create a saveName() function to save name in Chrome Storage
    saveName = (name, callback) => {
        chrome.storage.sync.set({
        name: name
    }, callback)
}    
    
// Create a remove() function to remove the item from Chrome Storage
    remove = (id, callback) => {
        chrome.storage.sync.get(['actionItems'], (data) => {
            // console.log(data.actionItems);
            let items = data.actionItems;
            let foundItemIndex = items.findIndex((item) => item.id == id);
            console.log(foundItemIndex);
            if (foundItemIndex >= 0) {
                items.splice(foundItemIndex, 1);
                chrome.storage.sync.set({
                    actionItems: items
                }, callback)
            }
        })
    }

// create a markUnmarkCompleted() function to set the item completed in chrome storage

markUnmarkCompleted =(id, completeStatus) => {
    chrome.storage.sync.get(['actionItems'], (data) => {
        // console.log(data.actionItems);
        let items = data.actionItems;
        let foundItemIndex = items.findIndex((item) => item.id == id);
        if (foundItemIndex >= 0) {
            items[foundItemIndex].completed = completeStatus; 
            chrome.storage.sync.set({
                actionItems: items
            })
        }
    })
}

// create a setProgress() function and update action items progress bar
setProgress = () => {
    chrome.storage.sync.get(['actionItems'], (data) => {
            let actionItems = data.actionItems;
            let completedItems;
            let totalItems = actionItems.length;
            //null = false
            //date = true
            completedItems = actionItems.filter(item => item.completed).length;
            // console.log(totalItems);
            // console.log(completedItems);
            let progress = 0;
            progress = completedItems / totalItems;
            this.setBrowserBadge(totalItems - completedItems);
            if (typeof circle !== "undefined") circle.animate(progress);
        })
}
// create a setBrowserBadge() function that notify a user of action items
    setBrowserBadge = (todoItems) => {
        let text = `${todoItems}`;
        if (todoItems > 9) {
            text = '9+';
        }
    chrome.action.setBadgeText({ text: text})
}    

}