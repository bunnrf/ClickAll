chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.sendMessage(tab.id, { message: "clickrequest" }, function(response) {
    // alert(response.message);
  });
});
