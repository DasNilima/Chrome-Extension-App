let addItemForm = document.querySelector('#addItemForm');
let itemList = document.querySelector('.actionItems');
let storage = chrome.storage.sync;
let actionItemsUtils = new Actionitems();
// chrome.storage.sync.clear();

// get all actionItems from Chrome Storage
storage.get(['actionItems'], (data) => {
    let actionItems = data.actionItems;
    renderActionItems(actionItems);
    // console.log(actionItems);
    actionItemsUtils.setProgress();
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
        actionItemsUtils.add(itemText);
        renderActionItem(itemText);
        addItemForm.elements.namedItem('itemText').value = '';
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
    const parent = e.target.parentElement.parentElement;
    // console.log(e.target);
    // console.log(id);
    actionItemsUtils.remove(id); // remove from chrome storage
    parent.remove();
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
    element.setAttribute('data-id', id);
    deleteEl.addEventListener('click', handleDeleteEventListener); // add an event listener to .actionItem__delete
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
