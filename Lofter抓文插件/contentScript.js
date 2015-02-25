//This is the content script
//chrome.storage.local.get('keyword', function (input_keyword){
window.onload = function () {
	chrome.runtime.onMessage.addListener(
		function (request, sender, sendResponse) {
	      	console.log(sender.tab ?
	            "from a content script:" + sender.tab.url :
	            "from the extension");
			if (request.greeting == "click") {
				var startURL = document.URL;
				if (startURL == undefined) {
					sendResponse('notDownload');
				} else {
					//是否是正确的lofter归档页地址
					if ((/http\:\/\/[a-z0-9\-]{5,}\.lofter\.com\/view/).test(startURL)) {
						sendResponse('rightStartURL');
						console.log('rightStartURL');
						//创建、清理输出文本框
						if (!document.getElementById('output')) {
							outputCreate();
							finishCreate();
							//var copyButton = getElementById('copyButton');
							//var clearButton = getElementById('clearButton');
						} else {
							var output = document.getElementById('output');
							output.innerHTML = '';
						}
						//取得关键字，调用抓取函数
						chrome.storage.sync.get(function (data){
							var keyword = data.keyword;
							getAllLinks(keyword);
						});

					} else {
						sendResponse('wrongStartURL');
						console.log('wrongStartURL');
					}
				}
			}
		}
	);
}

function getAllLinks(_keyword) {

	var allArticleList = [];
	var allArticleList = document.getElementsByClassName('g-bdc')[0].getElementsByTagName('h3');
	var articleList = [];

	for (var i=0; i<allArticleList.length; i++){
		if((allArticleList[i].innerHTML).indexOf(_keyword) > -1){
			articleList.push(allArticleList[i].parentNode.getAttribute('href'));
		}
	};

	var n = articleList.length;
	title = new Array(n);
	para = new Array(n);

	getOutPut(articleList, title, para, n-1);
}

function getOutPut(articleList, title, para, k) {
	if(k >= 0){
		var output = document.getElementById('output');
		console.log(k);
		var pageRequest = new XMLHttpRequest();
		pageRequest.open("GET", articleList[k], true);  //同步(false)或异步(true)
		pageRequest.responseType = "document";
		pageRequest.onload = function (){
			var viewPage = this.response;

			var pageTitleh2 = viewPage.getElementsByTagName('h2');
			var pageTitleh3 = viewPage.getElementsByTagName('h3');
			var pageContent = viewPage.getElementsByTagName("p");
			para[k] = pageContent[0];
			for (var i = 0; i < pageTitleh2.length; i++) {
				output.innerHTML += removeHTMLTag(pageTitleh2[i].innerHTML);
			};
			for (var i = 0; i < pageTitleh3.length; i++) {
				output.innerHTML += removeHTMLTag(pageTitleh3[i].innerHTML);
			};
			for (var i = 0; i < pageContent.length; i++) {
				output.innerHTML += removeHTMLTag(pageContent[i].innerHTML) + "\n";
			};
			console.log(para[k] + '已加载');
			if (para[k] != undefined) {
				getOutPut(articleList, title, para, --k);
			}
		} 
		pageRequest.send(null);
	} 
}


function removeHTMLTag(str) {
    str = str.replace(/<\/?[^>]*>/g,'\n'); 		//去除HTML tag
    str = str.replace(/[ | ]*\n/g,'\n'); 		//去除行尾空白
    str = str.replace(/\n[\s| | ]*\r/g,'\n');	//去除多余空行
    str = str.replace(/\n{2,}/g,'\n'); 			//去除多余空行
    str = str.replace(/&nbsp;/ig,'');			//去掉&nbsp;
    return str;
}

function outputCreate() {
	var parentArea = document.getElementsByClassName('schbtn')[0];
	var output = document.createElement('textarea');
	output.setAttribute('id', 'output');
	parentArea.appendChild(output);
	//var clearButton = buttonCreat('重置', 'reset');
	//var copyButton = buttonCreat('复制全部', 'selectAll');
	//parentArea.appendChild(copyButton);
	//parentArea.appendChild(clearButton);
}
function finishCreate() {
	var parentArea = document.getElementsByClassName('schbtn')[0];
	var finish = document.createElement('h1');
	finish.setAttribute('id', 'finish');
	parentArea.appendChild(finish);
	finish.innerHTML = 'ctrl + A 全选文本, ctrl + C 复制文本';
}

function buttonCreat(text, id) {
	var newButton = document.createElement('button');
	newButton.setAttribute('id', id);
	newButton.innerHTML = text;
	return newButton;
}
