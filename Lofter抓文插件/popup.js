window.onload = function () {
  var catcherButton = document.getElementById('catcher');
  var msgDiv = document.getElementById('msg');
  catcherButton.onclick = function (){
    msgDiv.innerHTML = '<p>click</p>';
    var keyWord = document.getElementById('title_keyword').value;
    chrome.storage.sync.set({'keyword': keyWord});
    
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs){
      var port = chrome.tabs.connect(tabs[0].id, {name: "lofterCatcher"});
      port.postMessage("click"});
      port.onMessage.addListener(function (msg) {

        if(msg == 'rightStartURL') {
          msgDiv.innerHTML += '<p>正确的归档页，准备抓取</p>';
          catcherButton.disabled = true;
        } else if (msg == 'pageLoading') {
          msgDiv.innerHTML += '<p>加载归档页中...</p>';
        } else if (msg == 'pageLoaded') {
          msgDiv.innerHTML += '<p>归档页加载完毕，准备抓取...</p>';
        } else if (msg == 'catching') {
          msgDiv.innerHTML += '<p>抓取中...</p>';
        } else if (msg == 'wrongStartURL') {
          msgDiv.innerHTML += "<p>当前页面非lofter博主的归档页，请在归档页使用本插件</p>";
        } else {
          msgDiv.innerHTML += "<p>不要心急~ 归档页还在加载中~</br>若多次抓取仍未成功，请刷新归档页再试一次~</p>";
        }
      }
    }
  };
};


// var port = chrome.runtime.connect({name: "knockknock"});
// port.postMessage({joke: "Knock knock"});
// port.onMessage.addListener(function(msg) {
//   if (msg.question == "Who's there?")
//     port.postMessage({answer: "Madame"});
//   else if (msg.question == "Madame who?")
//     port.postMessage({answer: "Madame... Bovary"});
// });


