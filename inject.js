const QUEUE_THRESHOLD = 5;
const QUEUE_DURATION = 10000;

// for Context Menus
let contextEl = null;
document.addEventListener("contextmenu", function(event) {
  contextEl = event.target;
});

// listen for repetitive clicks
// there can be at most QUEUE_THRESHOLD + 1 elements in the queue at time of evaluation
// so all but 1 el in the queue must compare to equal to broadcast repetition detection
const clickQueue = [];
let clickQueueSlice;
let notificationUp;
document.addEventListener("mousedown", repetitionHandler);
function repetitionHandler(event) {
  // ignore right and middle clicks
  if (event.which > 1 || notificationUp) {
    return false;
  }
  clickQueue.push(event.target);

  setTimeout(() => {
    clickQueue.shift();
  }, QUEUE_DURATION);

  if (clickQueue.length >= QUEUE_THRESHOLD && queueThreshold(clickQueue.slice())) {
    notificationUp = true;
    clickQueueSlice = clickQueue.slice();
    chrome.runtime.sendMessage(
      { message: "clickRepetition", elementAttributes: getAttributes(event.target) },
      function(response) {
        if (response.message === "clickAllRemaining") {
          clickAllExcept(clickQueueSlice);
        } else if (response.message === "negativeUserResponse") {
          document.removeEventListener("mousedown", repetitionHandler);
        } else {
          notificationUp = false;
        }
      }
    );
  }

  if (clickQueue.length > QUEUE_THRESHOLD) {
    clickQueue.splice(0, 1);
  }
}

// return true if four out of five or five out of six elements compare equal
function queueThreshold(queue) {
  let oddFound = false;
  for (let i = 0; i < queue.length - 1; i++) {
    if (!compareElements(queue[i], queue[i + 1])) {
      if (oddFound) {
        return false;
      }
      oddFound = true;
    }
  }
  return true;
}

function clickAllExcept(clickQueueSlice) {
  const elements = Array.from(getMatchingElements(clickQueueSlice[0]));
  for (let i = 0; i < clickQueueSlice.length; i++) {
    elements.splice(elements.indexOf(clickQueueSlice[i]), 1);
  }

  if (elements.length > 0) {
    clickElements(elements);
  }
}

// get node names and values along with tagname
function getAttributes(element) {
  const nodeMap = element.attributes;
  const props = { tagName: element.tagName };
  for (let i = 0; i < nodeMap.length; i++) {
    props[nodeMap[i].nodeName] = nodeMap[i].nodeValue;
  }
  return props;
}

// compare equality of two html elements
// optionally by given propName, eg class
function compareElements(el1, el2, propName) {
  let result = true;
  const attrs1 = getAttributes(el1);
  const attrs2 = getAttributes(el2);
  // might make sense to compare nodeMaps directly instead of
  // converting to pojo first, which this does

  if (propName && (attrs1[propName] === attrs2[propName])) {
    return true;
  }

  Object.keys(attrs1).forEach((key) => {
    if (attrs1[key] !== attrs2[key]) {
      result = false;
      return;
    }
  })
  return result;
}

// click listeners not triggered when target is <input>, so we use mouseup
function getElementFromClick(callback) {
  function handleClick(event) {
    window.removeEventListener("mouseup", handleClick, false);
    // ignore right clicks
    if (event.which === 3) {
      return false;
    }

    callback(event.target);
  }
  window.addEventListener("mouseup", handleClick, false);
}

function getMatchingElements(element) {
  return document.getElementsByClassName(element.className);
}

function clickElements(elements, callback, errorCallback) {
  if (elements.length < 1) {
    errorCallback("Error finding elements");
    return;
  }
  for (let i = 0; i < elements.length; i++) {
    elements[i].click();
  }
  if (callback) {
    callback(elements[0].cloneNode(true), elements.length);
  }
}

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
  if (request.message === "clickRequest") {
    getElementFromClick((elementClickedByUser) => {
      const matchingElements = Array.from(getMatchingElements(elementClickedByUser));
      matchingElements.splice(matchingElements.indexOf(elementClickedByUser), 1);
      clickElements(matchingElements, (elementClicked, count) => {
        sendResponse({ message: "success", elementAttributes: getAttributes(elementClicked), count: count });
      }, (errorMessage) => {
        sendResponse({ message: "Autoclicking failed: " + errorMessage });
      } );
    });
  }

  if(request.message === "clickFromContext") {
    const matchingElements = getMatchingElements(contextEl);
    clickElements(matchingElements, (count) => {
      sendResponse( { elementAttributes: getAttributes(contextEl) } );
    }, (errorMessage) => {
      sendResponse({ message: "Autoclicking failed: " + errorMessage });
    })
  }
  // return true to require asynchronous call of sendResponse
  return true;
});
