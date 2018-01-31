var gurl, gfav, gtitle, gid;

/**
 * Get the current URL.
 *
 * @param {function(string)} callback called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, (tabs) => {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;
    var favIconUrl = tab.favIconUrl;
    var title = tab.title;
    var id = tab.id;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback([url, favIconUrl, title, id]);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, (tabs) => {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

function getDate() {
  var date = new Date();
        
        // Format day/month/year to two digits
        var formattedDate = ('0' + date.getDate()).slice(-2);
        var formattedMonth = ('0' + (date.getMonth() + 1)).slice(-2);
        var formattedYear = date.getFullYear().toString().substr(2,2);
        
        // Combine and format date string
        var dateString = formattedMonth + '/' + formattedDate + '/' + formattedYear;
        
        // Reference output DIV
        var output = document.querySelector('#output');
        
        // Output dateString
        return dateString;
}

window.sendpost = function(data, path) {
  var params = typeof data == 'string' ? data : Object.keys(data).map(
    function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }
  ).join('&');

  var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
  xhr.open('POST', path);
  xhr.onreadystatechange = function () {
    if (xhr.readyState > 3 && xhr.status == 200) { this.close(); }
  }.bind(this);
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send(params);
}

function getTime() {
  console.log('hi');
  var video = document.querySelector('video');
  var time = 'na';
  if (video) {
    time = video.currentTime;
  }
  return time;
}

function getTimeCallback(time) {
  var params = {
    url: gurl,
    date: getDate(),
    host: 'Betsy',
    timestamp: time,
    icon: gfav,
    title: gtitle
  }
  this.sendpost(params, 'http://192.168.1.95/tabs/add');
}

// This extension loads the saved background color for the current tab if one
// exists. The user can select a new background color from the dropdown for the
// current page, and it will be saved as part of the extension's isolated
// storage. The chrome.storage API is used for this purpose. This is different
// from the window.localStorage API, which is synchronous and stores data bound
// to a document's origin. Also, using chrome.storage.sync instead of
// chrome.storage.local allows the extension data to be synced across multiple
// user devices.
document.addEventListener('DOMContentLoaded', () => {
  getCurrentTabUrl((data) => {
    gurl = data[0];
    gfav = data[1];
    gtitle = data[2];
    gid = data[3];
    function addtab() {
      console.log(window);
      chrome.tabs.executeScript(
        {
          code: '(' + getTime + ')();'
        },
        getTimeCallback.bind(window)
      );
    }
    document.querySelector('button').addEventListener('click', addtab);
  });
});
