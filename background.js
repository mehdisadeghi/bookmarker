// Copyright (c) 2016 Mehdi Sadeghi.
// Use of this source code is governed by MIT license.

// This event is fired each time the user updates the text in the omnibox,
// as long as the extension's keyword mode is still active.
chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    // Prepare description text
    var description;
    text = text.trim();
    if (text.length < 3) {
      chrome.omnibox.setDefaultSuggestion({ "description": "At lest three charachters..."});
      return;
    }
    text = text.replace(/,/g, ' ');
    var inputTokens = text.split(' ');
    inputTokens = inputTokens.filter(function(value){
      return value != "";
    });
    // Search bookmarks for the given text
    chrome.bookmarks.search(text, function (results) {
      if (results) {
        var newArray = results.map(function (currentValue, index, array) {
          // First escape special XML charachters
          // stackoverflow.com/a/1091953/89484
          description = currentValue.title.
            replace('"', "&quot;").
            replace("'", "&apos;").
            replace("<", "&lt;").
            replace(">", "&gt;").
            replace("&", "&amp;");
          
          // Highlight all tokens
          inputTokens.forEach(function (token, index, array) {
            var re = new RegExp(token, "ig");
            description = description.replace(re, "<match>$&</match>");
          });
          return { content: currentValue.url,
                   description: description };
          });
      
      // Check results and set default message
      var message;
      if (newArray.length == 0) {
        message = "Nothing interesting yet."
      } else {
        message = newArray.length + " results found.";
      }
      chrome.omnibox.setDefaultSuggestion({ "description": message });
      
      try {
        suggest(newArray);
      }
      catch (error) {
        console.log(error);
        throw error;
      }
    }
  });
});

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(
  function(text) {
    chrome.tabs.update({ url: text });
});

