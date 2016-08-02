chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.sendMessage(tab.id, { message: "clickRequest" }, function(response) {
    console.log(response);
  });
});

const contexts = ["page","selection","link","editable","image","video", "audio"];
for (let i = 0; i < contexts.length; i++) {
  const context = contexts[i];
  const title = "ClickAll";
  const id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                       "onclick": contextMenuCallback});
}

function contextMenuCallback(info, tab) {
  chrome.tabs.sendMessage(tab.id, { message: "clickFromContext" }, function(response) {
    console.log(response);
  });
}

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
  if (request.message === "clickRepetition") {
    console.log(request);
    // ask user if they want to click all
    sendResponse({ message: "clickAllRemaining" });
  }
  return true;
});
