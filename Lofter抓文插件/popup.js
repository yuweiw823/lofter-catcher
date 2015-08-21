window.onload = function () {
  var catchCount = 0
  var catcherButton = document.getElementById('catcher');
  var msgDiv = document.getElementById('msg');

  catcherButton.onclick = function (){
    var keyWord = document.getElementById('title_keyword').value;
    if(keyWord == '' || keyWord.length == 0) {
      msgDiv.innerHTML += '<p>关键词为空，无法抓取！</p>';
      return false;
    } else {
      chrome.storage.sync.set({'keyword': keyWord});
      
      chrome.tabs.query({active: true, currentWindow: true}, function (tabs){
        var port = chrome.tabs.connect(tabs[0].id, {name: "lofterCatcher"});
        port.postMessage("click");
        port.onMessage.addListener(function (msg) {

          switch (msg) {
            case 'rightStartURL':
              msgDiv.innerHTML += '<p>正确的归档页，准备抓取...</p>';
              catcherButton.disabled = true;
            break;
            case 'pageLoading':
              msgDiv.innerHTML += '<p>归档页加载中...</p>';
            break;
            case 'pageLoaded':
              msgDiv.innerHTML += '<p>归档页加载完毕...</p>';
            break;
            case 'catching':
              msgDiv.innerHTML += '<p>抓取中...</p>';
            break;
            case 'done':
              msgDiv.innerHTML += '<p>抓取完毕 ~\\(≧▽≦)/~</p>';
            break;
            case 'wrongStartURL':
              msgDiv.innerHTML += '<p>当前页面非lofter博主的归档页，请在归档页使用本插件</p>';
            break;
            default:
              msgDiv.innerHTML += '<p>出错了T^T，请刷新归档页再试一次~</p>';

          }
        });
      });
    }

  };
};