// Copyright (c) 2016 Mehdi Sadeghi.
// Use of this source code is governed by MIT license.

// This event is fired each time the user updates the text in the omnibox,
// as long as the extension's keyword mode is still active.
chrome.omnibox.onInputChanged.addListener(
  function(text, suggest) {
    // Prepare description text
    var description;
    text = text.replace(/,/g, ' ');
    var inputTokens = [];
    // Remove duplicate tokens
    text.split(' ').forEach(function(value){
      if (value !== "" && !inputTokens.includes(value)) {
        inputTokens.push(value);
      }
    });

    // Search bookmarks for the given text
    chrome.bookmarks.search(text, function (results) {

      var newArray = results.map(function (currentValue, index, array) {
        // Embed tokens inside match tags to be highlighted in results
        var description = embedTokens(currentValue.title, inputTokens);

        // A workaround in order to keep match tags untouched. 
        // This might be replaced with a regex.
        re1 = new RegExp("<match>", "ig");
        description = description.replace(re1,"70747138-8714-4c36-8e1b-af696320575e");
        re2 = new RegExp("</match>", "ig");
        description = description.replace(re2, "7278d0d5-73f5-4fa1-9921-3b2cda1f4322");

        // Escape special charachters, otherwise there will be random
        // xmlParseEntityRef: no name errors and results will not show up
        // http://stackoverflow.com/questions/5499078
        description = safe_tags(description);

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
      }
      chrome.omnibox.setDefaultSuggestion({ "description": message});

      try {
        suggest(newArray);
      }
      catch (error) {
        console.log(error);
      }
    
  });
});

// This event is fired with the user accepts the input in the omnibox.
chrome.omnibox.onInputEntered.addListener(
  function(text) {
    chrome.tabs.update({ url: text });
});

function embedTokens(text, tokens) {
  // Embed tokens inside match tags to be highlighted in results
  tokens.forEach(function (token, index, array) {
    // We want to ignore the match tag itself from being altered.
    // http://stackoverflow.com/a/15389296/157216 - negative look-ahead
    var re = new RegExp( "(" + token + "(?![^<>]*>))", 'ig' );
    text = text.replace(re, "<match>$&</match>");
  });
  return text;
}

function safe_tags(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') ;
}
