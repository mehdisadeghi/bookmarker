// Copyright (c) 2016 Mehdi Sadeghi.
// Use of this source code is governed by MIT license.

// This event is fired each time the user updates the text in the omnibox,
// as long as the extension's keyword mode is still active.
chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    // Prepare description text
    var description;
    text = text.trim();
    text = text.replace(/,/g, ' ');
    var inputTokens = [];
    // Remove duplicate tokens
    text.split(' ').forEach(function(value){
      if (value !== "" && !inputTokens.includes(value)) {
        inputTokens.push(value);
      }
    });
    
    // Longest token first
    inputTokens = inputTokens.sort(function(a, b) {
      return a.length <= b.length;
    });

    // Search bookmarks for the given text
    chrome.bookmarks.search(text, function (results) {
      if (results) {
        var newArray = results.map(function (currentValue, index, array) {
          description = currentValue.title;
          // Highlight all tokens
          inputTokens.forEach(function (token, index, array) {
            // We want to ignore the match tag itself from being altered.
            // http://stackoverflow.com/a/15389296/157216 - negative look-ahead
            var re = new RegExp( "(" + token + "(?![^<>]*>))", 'ig' );
            description = description.replace(re, "<match>$&</match>");
          });
          
          // A workaround in order to keep match tags untouched. 
          // This might be replaced with a regex.
          re1 = new RegExp("<match>", "ig");
          description = description.replace(re1,"70747138-8714-4c36-8e1b-af696320575e");
          re2 = new RegExp("</match>", "ig");
          description = description.replace(re2, "7278d0d5-73f5-4fa1-9921-3b2cda1f4322");
          
          // Escape special XML charachters
          description = description.
            replace('"', "\"").
            replace("'", "\'").
            replace("<", "\<").
            replace(">", "\>").
            replace("&", "\&");
          
          // Put them back.
          re3 = new RegExp("70747138-8714-4c36-8e1b-af696320575e", "ig");
          description = description.replace(re3, "<match>");
          re4 = new RegExp("7278d0d5-73f5-4fa1-9921-3b2cda1f4322", "ig");
          description = description.replace(re4, "</match>");

          return { content: currentValue.url,
                   description: description };
          });
      
      // Check results and set default message
      var message;
      if (newArray.length == 0) {
        message = "Nothing interesting yet."
      } else {
        message = "Displaying " + newArray.slice(0, 5).length + " out of " + newArray.length + " results.";
        //message = newArray.length + " results found.";
      }
      chrome.omnibox.setDefaultSuggestion({ "description": message });
      
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

