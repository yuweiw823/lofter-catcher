window.onload = function () {

    var catcherButton = document.getElementById('catcher');
    var msg = document.getElementById('msg');
    
    catcherButton.onclick = function (){
      var keyWord = document.getElementById('title_keyword').value;
      chrome.storage.sync.set({'keyword': keyWord});

      chrome.tabs.query({active: true, currentWindow: true}, function (tabs){
        chrome.tabs.sendMessage(tabs[0].id, {greeting: "click"}, function (response){
          //chrome.storage.local.set({'keyword': keyword});
            if (response == 'rightStartURL') {
              msg.innerHTML = '';
            } else if (response == 'notDownload') {
              msg.innerHTML = "<p>归档页还没加载完成，请稍后再试....</p>";
            } else if (response == 'finish') {
              msg.innerHTML = "<p>抓取完成！</p>";
            } else {
              msg.innerHTML = "<p>未能抓取成功，请刷新后再试一试。</br>可能原因：归档页未加载完成 / 当前页面非lofter博主的归档页）</p>";
            }
        });
      });
    }
};





