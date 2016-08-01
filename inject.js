function getElementFromClick(callback) {
  function handleClick(event) {
    window.removeEventListener("mouseup", handleClick, false);
    callback(event.target);
  }
  // click listeners not triggered when target is input
  window.addEventListener("mouseup", handleClick, false);
}

function clickElements(elementClickedByUser, callback, errorCallback) {
  const elements = Array.from($("." + elementClickedByUser.className));
  elements.splice(elements.indexOf(elementClickedByUser), 1);

  if (elements.length > 0) {
    $(elements).click();
    callback(elements.length);
  } else {
    errorCallback("Error finding elements");
  }
}

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    if (request.message === "clickrequest") {
      getElementFromClick((elementClickedByUser) => {
        clickElements(elementClickedByUser, (count) => {
          sendResponse({ message: count + " elements clicked" });
        }, (errorMessage) => {
          sendResponse({ message: "Autoclicking failed: " + errorMessage });
        } );
      });
    }
    // return true to require asynchronous call of sendResponse
    return true;
});
