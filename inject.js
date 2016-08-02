// for Context Menus
let contextEl = null;
document.addEventListener("contextmenu", function(event) {
  contextEl = event.target
});

// click listeners not triggered when target is <input>, so we use mouseup
function getElementFromClick(callback) {
  function handleClick(event) {
    window.removeEventListener("mouseup", handleClick, false);
    callback(event.target);
  }
  window.addEventListener("mouseup", handleClick, false);
}

function clickElements(elements, callback, errorCallback) {
  if (elements.length < 1) {
    errorCallback("Error finding elements");
    return;
  }
  for (let i = 0; i < elements.length; i++) {
    elements[i].click();
  }
  callback(elements.length);
}

function getMatchingElements(element) {
  return document.getElementsByClassName(element.className);
}

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
  if (request.message === "clickRequest") {
    getElementFromClick((elementClickedByUser) => {
      const matchingElements = Array.from(getMatchingElements(elementClickedByUser));
      matchingElements.splice(matchingElements.indexOf(elementClickedByUser), 1);
      clickElements(matchingElements, (elementClicked, count) => {
        sendResponse({ message: "success", element: elementClicked, count: count });
      }, (errorMessage) => {
        sendResponse({ message: "Autoclicking failed: " + errorMessage });
      } );
    });
  }

  if(request.message === "clickFromContext") {
    const matchingElements = getMatchingElements(contextEl);
    clickElements(matchingElements, (count) => {
      console.log(contextEl);
      sendResponse( { contextEl: contextEl } );
    }, (errorMessage) => {
      sendResponse({ message: "Autoclicking failed: " + errorMessage });
    })
  }
  // return true to require asynchronous call of sendResponse
  return true;
});
