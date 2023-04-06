let addItemForm = document.querySelector('#addItemForm');
let itemList = document.querySelector('.actionItems');
let storage = chrome.storage.sync;
// chrome.storage.sync.clear();

// get all actionItems from Chrome Storage
storage.get(['actionItems'], (data) => {
    let actionItems = data.actionItems;
    renderActionItems(actionItems);
    // console.log(actionItems);
    setProgress();
});

//create renderActionItems() function and loop through each action item and render it
const renderActionItems = (actionItems) => {
    actionItems.forEach((item) => {
        renderActionItem(item.text, item.id, item.completed);
    })
}

addItemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let itemText = addItemForm.elements.namedItem('itemText').value; // get the value of the element with name ="itemText" in a form
    if (itemText) {
        add(itemText);
        renderActionItem(itemText);
        addItemForm.elements.namedItem('itemText').value = '';
    }
})
// create add () function
const add = (text) => {

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
        }, () => {
            chrome.storage.sync.get(['actionItems'], (data) => {
                console.log(data);
            });
        })
    })
}
// create a markUnmarkCompleted() function to set the item completed in chrome storage

const markUnmarkCompleted = (id, completeStatus) => {
    storage.get(['actionItems'], (data) => {
        // console.log(data.actionItems);
        let items = data.actionItems;
        let foundItemIndex = items.findIndex((item) => item.id == id);
        if (foundItemIndex >= 0) {
            items[foundItemIndex].completed = completeStatus; 
            chrome.storage.sync.set({
                actionItems: items
            }, () => {
                setProgress();
            })
        }
    })
}
const handleCompletedEventListener = (e) => {
    const id = e.target.parentElement.parentElement.getAttribute('data-id');
    const parent = e.target.parentElement.parentElement;
    // console.log(parent);
    //add the ability to unmark items
    if (parent.classList.contains('completed')) {
        markUnmarkCompleted(id, null );
        parent.classList.remove('completed');
    } else {
        markUnmarkCompleted(id, new Date().toString());    
        parent.classList.add('completed');
    }
    // console.log(uuidv4());
}
// create renderActionItem() function that allow a user add action item html to the action items list with class .actionItem
const renderActionItem = (text, id, completed) => {
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
    element.setAttribute('data-id', id)
    checkEl.addEventListener('click', handleCompletedEventListener);  // create an event listener on the checkmark element
    textEl.textContent = text;
    deleteEl.innerHTML = `<i class="fas fa-times"></i>`;
    mainElement.appendChild(checkEl);
    mainElement.appendChild(textEl);
    mainElement.appendChild(deleteEl);
    element.appendChild(mainElement);
    itemList.prepend(element);
    // console.log(element);

}
// create a setProgress() function and update action items progress bar
const setProgress = () => {
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

var circle = new ProgressBar.Circle('#container', {
    color: '#010101',
    // This has to be the same size as the maximum width to
    // prevent clipping
    strokeWidth: 6,
    trailWidth: 2,
    easing: 'easeInOut',
    duration: 1400,
    text: {
    autoStyleContainer: false
    },
    from: { color: '#7fdf67', width: 2 },
    to: { color: '#7fdf67', width: 6 },
    // Set default step function for all animate calls
    step: function(state, circle) {
        circle.path.setAttribute('stroke', state.color);
        circle.path.setAttribute('stroke-width', state.width);
      var value = Math.round(circle.value() * 100);
        if (value === 0) {
        circle.setText('');
    } else {
        circle.setText(value);
    }
    }
});
circle.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
circle.text.style.fontSize = '2rem';

// circle.animate(1.0);  // Number from 0.0 to 1.0