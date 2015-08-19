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
              msg.innerHTML = '<p>正确的归档页，抓取结果将出现在弹窗中</p>';
            } else if (response == 'wrongStartURL') {
              msg.innerHTML = "<p>当前页面非lofter博主的归档页，请在归档页使用插件</p>";
            } else {
              msg.innerHTML = "<p>出错啦！刷新一下归档页再试一次！</p>";
            }
        });
      });
    }
};





