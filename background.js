chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.sendMessage(tab.id, { message: "clickRequest" }, function(response) {
    console.log(response);
  });
});

const contexts = ["page","selection","link","editable","image","video", "audio"];
for (let i = 0; i < contexts.length; i++) {
  const context = contexts[i];
  const title = "ClickAll";
  chrome.contextMenus.create({"title": title, "contexts":[context],
                              "onclick": contextMenuCallback});
}

function contextMenuCallback(info, tab) {
  chrome.tabs.sendMessage(tab.id, { message: "clickFromContext" }, function(response) {
    console.log(response);
  });
}

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
  let notificationId;
  if (request.message === "clickRepetition") {
    const options = { type: "basic", title: "ClickAll",
      buttons: [{ title: "Yes"}, { title: "No, don't ask again" }],
      iconUrl: "https://inkspand.s3.amazonaws.com/assets/one-click-icon-193a10810ae09a9864fb306cdf7298a0.png",
      message: "It looks like you're clicking a lot of similar element. Would you like ClickAll to click the rest for you?" }
    chrome.notifications.create(options, function(notificationIdString) {
      notificationId = notificationIdString;
    });

    setTimeout(() => {
      chrome.notifications.clear(notificationId);
    }, 5000);

    chrome.notifications.onClosed.addListener( (notificationId, byUser) => {
      sendResponse({ message: "notificationTimedOut" });
    });
    chrome.notifications.onButtonClicked.addListener( (notificationId, buttonIndex) => {
      if (buttonIndex === 0) {
        sendResponse({ message: "clickAllRemaining" });
        chrome.notifications.clear(notificationId);
        return;
      } else {
        sendResponse({ message: "negativeUserResponse" });
        chrome.notifications.clear(notificationId);
        return;
      }
    });
  }
  return true;
});
