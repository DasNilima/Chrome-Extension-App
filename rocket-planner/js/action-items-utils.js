class Actionitems {
    // create add () function
add = (text) => {
    let actionItem = {
        id: uuidv4(),
        added: new Date().toString(),
        text: text,
        completed: null
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
        })
    })
}
    
    
// Create a remove() function to remove the item from Chrome Storage
    remove = (id) => {
        storage.get(['actionItems'], (data) => {
            // console.log(data.actionItems);
            let items = data.actionItems;
            let foundItemIndex = items.findIndex((item) => item.id == id);
            if (foundItemIndex >= 0) {
                items.splice(foundItemIndex, 1);
                chrome.storage.sync.set({
                    actionItems: items
                }, () => {
                    this.setProgress();
                })
            }
        })
    }

// create a markUnmarkCompleted() function to set the item completed in chrome storage

markUnmarkCompleted =(id, completeStatus) => {
    storage.get(['actionItems'], (data) => {
        // console.log(data.actionItems);
        let items = data.actionItems;
        let foundItemIndex = items.findIndex((item) => item.id == id);
        if (foundItemIndex >= 0) {
            items[foundItemIndex].completed = completeStatus; 
            chrome.storage.sync.set({
                actionItems: items
            }, () => {
                this.setProgress();
            })
        }
    })
}

// create a setProgress() function and update action items progress bar
setProgress = () => {
        storage.get(['actionItems'], (data) => {
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
            circle.animate(progress);
        })
    }
}