window.onload = function () {
    var catcherButton = document.getElementById('catcher');
    // catcherButton.disabled = true;
    var msg = document.getElementById('msg');


// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     console.log(sender.tab ?
//                 "from a content script:" + sender.tab.url :
//                 "from the extension");
//     if (request.greeting == "hello")
//       sendResponse({farewell: "goodbye"});
//   });


    // chrome.runtime.onMessage.addListener(
    //     function(request, sender, sendResponse) {
    //         // console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
    //         if (request.greeting == "ready"){
    //         //button clickable
    //             catcherButton.disabled = false;
    //             sendResponse({buttonStatus: "clicked"});

    //         // catcherButton.onclick = function (){
    //         //     var keyWord = document.getElementById('title_keyword').value;
    //         //     sendResponse({buttonStatus: "clicked"});
    //         // }





    //             // var keyWord = document.getElementById('title_keyword').value;
    //             // chrome.storage.sync.set({'keyword': keyWord});

    //             // chrome.tabs.query({active: true, currentWindow: true}, function (tabs){
    //             //     chrome.tabs.sendMessage(tabs[0].id, {greeting: "click"}, function (response){
    //             //         //chrome.storage.local.set({'keyword': keyword});
    //             //         if (response == 'rightStartURL') {
    //             //             msg.innerHTML += '<p>开始抓取，抓取结果将出现在弹窗中</p>';
    //             //             catcherButton.disabled = true;
    //             //         } else if (response == 'wrongStartURL') {
    //             //             msg.innerHTML += "<p>当前页面非lofter博主的归档页，请在归档页使用本插件</p>";
    //             //         } else {
    //             //             msg.innerHTML += "<p>不要心急~ 归档页还在加载中~</br>若多次抓取仍未成功，请刷新归档页再试一次~</p>";
    //             //         }

    //             //     });
    //             // });
    //         }




    //         // sendResponse({farewell: "goodbye"});
    //     }
    // );
        
    catcherButton.onclick = function (){
        var keyWord = document.getElementById('title_keyword').value;
        chrome.storage.sync.set({'keyword': keyWord});

        chrome.tabs.query({active: true, currentWindow: true}, function (tabs){
            chrome.tabs.sendMessage(tabs[0].id, {greeting: "click"}, function (response){
                //chrome.storage.local.set({'keyword': keyword});
                if (response == 'rightStartURL') {
                    msg.innerHTML += '<p>开始抓取，抓取结果将出现在弹窗中</p>';
                    catcherButton.disabled = true;
                } else if (response == 'wrongStartURL') {
                    msg.innerHTML += "<p>当前页面非lofter博主的归档页，请在归档页使用本插件</p>";
                } else {
                    msg.innerHTML += "<p>不要心急~ 归档页还在加载中~</br>若多次抓取仍未成功，请刷新归档页再试一次~</p>";
                }

            });
        });
    }
};





