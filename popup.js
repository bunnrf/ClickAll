// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getElementFromClick(callback) {
  callback(document.getElementsByClassName("multi-select"));
  // document.addEventListener("click", function handleClick(event) {
  //   alert("click");
  //   document.removeEventListener("click", handleClick);
  //   callback(event.target);
  // });
  callback(elementClickedByUser)
}

/**
 * @param {string} searchTerm - Search term for Google Image search.
 * @param {function(string,number,number)} callback - Called when an image has
 *   been found. The callback gets the URL, width and height of the image.
 * @param {function(string)} errorCallback - Called when the image is not found.
 *   The callback gets a string that describes the failure reason.
 */
function clickElements(elementClickedByUser, callback, errorCallback) {
  const elements = $("." + elementClickedByUser.className);

  if (elements.length > 0) {
    elements.click();
    callback(elements.length);
  } else {
    errorCallback("Error finding elements");
  }
}

function renderStatus(statusText) {
  $('#status').textContent = statusText;
}

document.addEventListener("DOMContentLoaded", function() {
  getElementFromClick((elementClickedByUser) => {
    renderStatus("Clicking...");

    clickElements(elementClickedByUser, (count) => {
      renderStatus(count + " elements clicked.");
    }, (errorMessage) => {
      renderStatus("Autoclicking failed: " + errorMessage);
    } );
  });
});
