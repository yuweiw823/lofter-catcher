//This is the content script
//chrome.storage.local.get('keyword', function (input_keyword){
window.onload = function () {
	console.log('ready');
	chrome.runtime.onMessage.addListener(
		function (request, sender, sendResponse) {
	      	console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
			if (request.greeting == "click") {
				var startURL = document.URL;
				if ((/http\:\/\/[a-z0-9\-]{5,}\.lofter\.com\/view/).test(startURL)) {
					sendResponse('rightStartURL');
					chrome.storage.sync.get(function (data){
						var keyword = data.keyword;
						if(keyword.length == 0 || keyword =='') {
							alert('请输入关键词');
						} else {
							getAllLinks(keyword);
						}
					});
				} else {
					sendResponse('wrongStartURL');
				}
			} else {
				sendResponse('error');
			}
		}
	);
}

function getAllLinks(_keyword) {
	var allArticleList = document.getElementsByClassName('g-bdc')[0].getElementsByTagName('h3');
	var articleUrlList = [];
	var articleTitleList = [];
	var processItem = [];
	var output = '';


	for (var i=0; i<allArticleList.length; i++){
		if(allArticleList[i].innerText.indexOf(_keyword) > -1){
			articleUrlList.push(allArticleList[i].parentNode.getAttribute('href'));
			articleTitleList.push(allArticleList[i].innerText);
		}
	};

	console.log(allArticleList);

	var n = articleUrlList.length;
	var outputWindow = window.open('','targetWindow','scrollbars=0,resizable=1,width=800,height=600');
	getOutPut(articleUrlList, articleTitleList, processItem, n-1, output, outputWindow);
}

function getOutPut(articleUrlList, articleTitleList, processItem, k, output, outputWindow) {
	var warningText = "***************警******告*****************\n本文原载于 " + document.URL + ", \n版权归原作者所有。仅可用作私人收藏。\n请勿将本文用于二次传播或商业用途！\n*******************************************\n"
	var len = articleTitleList.length;
	if(k >= 0){
		console.log(k);
		var pageRequest = new XMLHttpRequest();
		pageRequest.open("GET", articleUrlList[k], true);  //同步(false)或异步(true)
		pageRequest.responseType = "document";
		pageRequest.onload = function (){
			var viewPage = this.response;
			var pageContent = viewPage.getElementsByTagName('p');
			processItem[k] = pageContent[0];
			output += warningText + '【' + articleTitleList[k] + '】\n';
			for (var i = 0; i < pageContent.length; i++) {
				output += pageContent[i].innerText;
			};
			if (processItem[k] != undefined) {
				getOutPut(articleUrlList, articleTitleList, processItem, --k, output, outputWindow);
			}
		} 
		pageRequest.send(null);
	}
	
	outputWindow.document.title = '抓取结果';
	outputWindow.document.body.innerHTML = (k<=0) ? 
		('<h3 style='+redStyle+'>抓取完成~\\(≧▽≦)/~</h3><textarea style="width:100%; height:95%">'+output+'</textarea>') 
		: '<h3 style='+redStyle+'>努力抓取中……正在抓取第 ' + (len-k) + ' 篇，共 ' + len + ' 篇</h3>';
	return output;
}

var redStyle = "\"margin:5px; color:#BA0808; text-align:center; font-family:\'Hiragino Sans GB\', \'Microsoft YaHei\', 微软雅黑, tahoma, arial, simsun, 宋体;\"";