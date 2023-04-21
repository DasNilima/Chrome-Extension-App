let addItemForm = document.querySelector('#addItemForm');
let itemList = document.querySelector('.actionItems');
let storage = chrome.storage.sync;
let actionItemsUtils = new Actionitems();
// chrome.storage.sync.clear();

// get all actionItems from Chrome Storage
storage.get(['actionItems', 'name'], (data) => {
    let actionItems = data.actionItems;
    let name = data.name
    setUserName(name);
    setGreeting();
    setGreetingImage();
    // console.log(actionItems);
    createQuickActionListener();
    renderActionItems(actionItems);
    createUpdateNameDialogListener();
    createUpdateNameListener();
    actionItemsUtils.setProgress();
    chrome.storage.onChanged.addListener(() => {
        // console.log("changed");
        actionItemsUtils.setProgress();
    })
});

//create renderActionItems() function and loop through each action item and render it
const renderActionItems = (actionItems) => {
    // filter out completed items from yesterday
    const filteredItems = filterActionItems(actionItems);
    filteredItems.forEach((item) => {
        renderActionItem(item.text, item.id, item.completed, item.website);
    })
    storage.set({
        actionItems: filteredItems,
    })
}
// create a filterActionItems() function
const filterActionItems = (actionItems) => {
    var currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const filteredItems = actionItems.filter((item) => {
        if (item.completed) {
            // if completed date is less than today date
            const completedDate = new Date(item.completed);
            if (completedDate < currentDate) {
            return false;
            }
        }
        return true;
    })
    return filteredItems;
}

// create a setUserName() function to change the name text in .name__value
const setUserName = (name) => {
    let newName = name ? name : 'Add Name';
    document.querySelector('.name__value').innerText = newName
}
// create an update Name Dialog function
const createUpdateNameDialogListener = () => {
    let greetingName = document.querySelector('.greeting__name')
    greetingName.addEventListener('click', () => {
        // open the model
        storage.get(['name'], (data) => {
            let name = data.name ? data.name : '';
            document.getElementById('input__name').value = name
        })
        $('#updateNameModal').modal('show');
    })
}
// create a handleUpdateName() for retrieving the new name from input
const handleUpdateName = (e) => {
console.log(e)
    // get the input text
    const name = document.getElementById('input__name').value;
    if (name) {
        //save the name
        actionItemsUtils.saveName(name, () => {
            // set the user's name on front end
            setUserName(name);
            $('#updateNameModal').modal('hide');
        });
    }
}
// create a createUpdateNameListener() for when Save Changes is clicked
const createUpdateNameListener = () => {
    let element = document.querySelector('#update-name')
    element.addEventListener('click', handleUpdateName)
}
//create an event handler handleQuickActionListener() function
const handleQuickActionListener = (e) => {
    // console.log(e);
    const text = e.target.getAttribute('data-text');
    const id = e.target.getAttribute('data-id');
    // console.log(text);
    getCurrentTab().then((tab) => {
        actionItemsUtils.addQuickActionItem(id, text, tab, (actionItem) => {
            renderActionItem(actionItem.text, actionItem.id, actionItem.completed, actionItem.website, 250);
        });
    })
}

// Create a getCurrentTab() function to get active tab

async function getCurrentTab() {
    return await new Promise((resolve, reject) => {
        chrome.tabs.query({ 'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT }, (tabs) => {
            // console.log("Tabs", tabs);
            resolve(tabs[0]);
        })
    })
    
}

// Create an event listener for quick action buttons with a createQuickActionListener () function
const createQuickActionListener = () => {
    let buttons = document.querySelectorAll('.quick-action');
    // console.log(buttons);
    buttons.forEach((button) => {
        button.addEventListener('click', handleQuickActionListener )
    })
}

addItemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let itemText = addItemForm.elements.namedItem('itemText').value; // get the value of the element with name ="itemText" in a form
    if (itemText) {
        actionItemsUtils.add(itemText, null, (actionItem) => {
            renderActionItem(actionItem.text, actionItem.id, actionItem.completed, actionItem.website, 250);
            addItemForm.elements.namedItem('itemText').value = '';
        });
        
    }
})


const handleCompletedEventListener = (e) => {
    const id = e.target.parentElement.parentElement.getAttribute('data-id');
    const parent = e.target.parentElement.parentElement;
    // console.log(parent);
    //add the ability to unmark items
    if (parent.classList.contains('completed')) {
        actionItemsUtils.markUnmarkCompleted(id, null );
        parent.classList.remove('completed');
    } else {
        actionItemsUtils.markUnmarkCompleted(id, new Date().toString());
        parent.classList.add('completed');
    }
    // console.log(uuidv4());
}

// create a handleDeleteEventListener() function

const handleDeleteEventListener = (e) => {
    const id = e.target.parentElement.parentElement.getAttribute('data-id');
    // const parent = e.target.parentElement.parentElement;
    // console.log(e.target);
    // console.log(id);
    let jElement = $(`div[data-id="${id}"]`);
    actionItemsUtils.remove(id, () => {
        animateUp(jElement);
        // parent.remove();
    }); // remove from chrome storage

}
// create renderActionItem() function that allow a user add action item html to the action items list with class .actionItem
const renderActionItem = (text, id, completed, website=null, animationDuration=450) => {
    let element = document.createElement('div');
    element.classList.add('actionItem__item');
    let mainElement = document.createElement('div');
    mainElement.classList.add('actionItem__main');
    let checkEl = document.createElement('div');
    checkEl.classList.add('actionItem__check');
    let textEl = document.createElement('div');
    textEl.classList.add('actionItem__text');
    let deleteEl = document.createElement('div');
    deleteEl.classList.add('actionItem__delete');

    checkEl.innerHTML = `
        <div class="actionItem__checkBox">
                <i class="fas fa-check" aria-hidden="true"></i>
        </div>
        `
    if (completed) {
        element.classList.add('completed');
    }
    element.setAttribute('data-id', id);
    deleteEl.addEventListener('click', handleDeleteEventListener); // add an event listener to .actionItem__delete
    checkEl.addEventListener('click', handleCompletedEventListener);  // create an event listener on the checkmark element
    textEl.textContent = text;
    deleteEl.innerHTML = `<i class="fas fa-times"></i>`;
    mainElement.appendChild(checkEl);
    mainElement.appendChild(textEl);
    mainElement.appendChild(deleteEl);
    element.appendChild(mainElement);
    if (website) {
        let linkContainer = createLinkContainer(website.url, website.fav_icon, website.title);
        element.appendChild(linkContainer);
    }
    itemList.prepend(element);
    // console.log(element);
    let jElement = $(`div[data-id="${id}"]`);
    animateDown(jElement, animationDuration);
}
// create an animateUp() function that allows removing action items
const animateUp = (element) => {
    let height = element.innerHeight();
    // console.log(height)
    element.animate({
        opacity: 0,
        marginTop: `-${height}px`
    }, 250, () => {
        element.remove();
    })
}
// create an animateDown () function that allows adding action items
const animateDown = (element, duration) => {
    // console.log(duration)
    let height = element.innerHeight();
    // console.log(height)
    element.css({ marginTop: `-${height}px`, opacity: 0 }).animate({
        opacity: 1,
        marginTop: '12px',
    }, duration)
}
// Create a createLinkContainer() function
const createLinkContainer = (url, favIcon, title) => {
    let element = document.createElement('div');
    element.classList.add('actionItem__linkContainer');
    element.innerHTML = `
    <a href="${url}" target="_blank">
        <div class="actionItem__link">
            <div class="actionItem__favIcon">
                <img src="${favIcon}" alt="">
            </div>
            <div class="actionInput__title">
                <span>${title}</span>
            </div>
        </div>
    </a>
    `
    return element;
}
// create a setGreeting() function
const setGreeting = () => {
    let greeting = "Good ";
    const date = new Date();
    const hour = date.getHours();
    if (hour >= 5 && hour <= 11) {
        greeting += "Morning,";
    } else if (hour >= 12 && hour <= 16) {
        greeting += "Afternoon,";
    } else if (hour >= 17 && hour <= 20) {
        greeting += "Evening,";
    } else {
        greeting += "Night,";
    }
    document.querySelector('.greeting__type').innerText = greeting
}

// create a setGreetingImage() function
const setGreetingImage = () => {
    let image = document.getElementById('greeting__image');
    const date = new Date();
    const hour = date.getHours();
    if (hour >= 5 && hour <= 11) {
        image.src = './images/good-morning.png';
    } else if (hour >= 12 && hour <= 16) {
        image.src = './images/good-afternoon.png';
    } else if (hour >= 17 && hour <= 20) {
        image.src = './images/good-evening.png';
    } else {
        image.src = './images/good-night.png';
    }
} 