// Copyright (c) 2016 Mehdi Sadeghi.
// Use of this source code is governed by MIT license.

// This event is fired each time the user updates the text in the omnibox,
// as long as the extension's keyword mode is still active.
chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    // Search bookmarks for the given text
    chrome.bookmarks.search(text, function (results) {
		if (results) {
			var newArray = results.map(function (currentValue, index, array) {
				return { content: currentValue.url,
						 description: currentValue.title.replace(text,
						 	"<match>" + text + "</match>")};
			});
			try {
				suggest(newArray);
			}
			catch (error) {
				console.log(error);
			}
		}
    });
});

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(
  function(text) {
    chrome.tabs.update({ url: text });
});

