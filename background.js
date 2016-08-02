chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.sendMessage(tab.id, { message: "clickRequest" }, function(response) {
    console.log(response);
  });
});

const contexts = ["page","selection","link","editable","image","video", "audio"];
for (let i = 0; i < contexts.length; i++) {
  const context = contexts[i];
  const title = "Test '" + context + "' menu item";
  const id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                       "onclick": contextMenuCallback});
  console.log("'" + context + "' item:" + id);
}

function contextMenuCallback(info, tab) {
  chrome.tabs.sendMessage(tab.id, { message: "clickFromContext" }, function(response) {
    console.log(response);
  });
}
