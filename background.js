//chrome.tabs.sendMessage(tabId, { type: 'tab-ready'}); 

chrome.webNavigation.onHistoryStateUpdated.addListener(details => {
  tabId = details.tabId;
  currentUrl = details.url;
  console.log('history state updated', tabId)
  chrome.tabs.sendMessage(tabId, { type: 'history-state-updated'});
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  console.table(changeInfo)
  if (changeInfo.title){
    let str = changeInfo.title
    let arr = str.split('|')
    if(arr.length === 3){
      if(arr[1].toUpperCase().includes('INCIDENT')){
        console.log("inc")
        chrome.tabs.sendMessage(tabId, { type: "incident", data: changeInfo})
      } else if(arr[1].toUpperCase().includes('PROBLEM')){
        chrome.tabs.sendMessage(tabId, { type: "problem", data: changeInfo})
      } else if(arr[1].toUpperCase().includes('CHANGE')){
        chrome.tabs.sendMessage(tabId, { type: "change", data: changeInfo})
      } else if(arr[1].toUpperCase().includes('TASK')){
        chrome.tabs.sendMessage(tabId, { type: "task", data: changeInfo})
      }
    } 
  }
  if (changeInfo.status == 'loading' && tab.active) { 
    chrome.tabs.sendMessage(tabId, { type: 'loading'});              
  }
  if (changeInfo.status == 'complete' && tab.active) {  
    chrome.tabs.sendMessage(tabId, { type: 'complete'});              
  }
})

chrome.webRequest.onCompleted.addListener(function (details) {
  //TODO: filter and check if the desired URL has completed
  chrome.tabs.query({
      currentWindow: true,
      active: true
    },
    function (tabArray) {
      if (tabArray) {
        const parsedUrl = new URL(details.url);
        chrome.tabs.sendMessage(tabArray[0].id, {
          type: 'tab-ready',
          data: parsedUrl.pathname
        });
      }
    }
  )

}, {
  urls: ['*://microsoft.service-now.com/*', '*://mlsportal/WorkRecordTool/Workrecord.aspx/*']
});