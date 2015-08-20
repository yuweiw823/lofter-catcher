//This is the content script
//chrome.storage.local.get('keyword', function (input_keyword){
// http://verdancy.lofter.com/view
// document.getElementsByClassName('g-bdc')[0].childNodes[5].lastChild.offsetTop
// http://jsfiddle.net/3xTM2/
// http://stackoverflow.com/questions/6969403/cant-get-execcommandpaste-to-work-in-chrome


window.onload = function () {

	// var timer = setInterval(function(){
	// 	// window.scrollTo(0, currentY+500);
	// 	window.scrollBy(0, 300);
	// 	console.log(document.getElementsByClassName('g-bdc')[0].childNodes[5].lastChild.offsetTop);
	// }, 300);

// chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
//   console.log(response.farewell);
// });

	// chrome.runtime.sendMessage({greeting: "ready"}, function(response) {
	//   	console.log(response.buttonStatus);
	//   	if(response.buttonStatus == "clicked"){
	//   		//确认点击，开始滚动
	//   		// console.log(response.buttonStatus);
	// 		var timer = setInterval(function(){
	// 			// window.scrollTo(0, currentY+500);
	// 			window.scrollBy(0, 300);
	// 			console.log(document.getElementsByClassName('g-bdc')[0].childNodes[5].lastChild.offsetTop);
	// 		}, 300);
	// 		// var keyWord = response.InputKeyword;
	// 		// console.log(response.keyWord);
	//   	}
	// });


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
							alert('关键词为空，将抓取归档页所有博文');
						}
						getAllLinks(keyword);
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
	var n = articleUrlList.length;
	var outputWindow = window.open('','targetWindow','scrollbars=0,resizable=1,width=800,height=600');
	getOutPut(articleUrlList, articleTitleList, processItem, n-1, output, outputWindow);
	
}

function getOutPut(articleUrlList, articleTitleList, processItem, k, output, outputWindow) {
	var warningText = "******************警********告********************\n本文原载于 " + document.URL + "，\n版权归原作者所有，请勿用于二次传播及任何商业用途！\n*************************************************\n\n";

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
			output += warningText + '【' + articleTitleList[k] + '】\n\n';
			for (var i = 0; i < pageContent.length; i++) {
				output += pageContent[i].innerText + '\n';
			};
			if (processItem[k] != undefined) {
				getOutPut(articleUrlList, articleTitleList, processItem, --k, output, outputWindow);
			}
		} 
		pageRequest.send(null);
	}
	
	outputWindow.document.title = '抓取结果';
	outputWindow.document.body.innerHTML = (k<=0) ? 
		('<h3 id="outputMessage" style='+redStyle+'>抓取完成</h3><button id="copybtn" style=' + buttonStyle + '>复制文本</button><textarea id="copyarea" style="width:100%; height:90%">'+ output + '</textarea>') 
		: '<h3 style='+redStyle+'>努力抓取中…… 正在抓取第 ' + (len-k) + ' 篇，共 ' + len + ' 篇</h3>';
	if(k<=0){
		copyOutput(outputWindow);
	};
	return output;
}

// var authorInfo = "\n\n*******Lofter 抓文插件 Powered by http://afanvera.lofter.com*******";
var redStyle = "\"margin:5px; color:#BA0808; text-align:center; font-family:\'Hiragino Sans GB\', \'Microsoft YaHei\', 微软雅黑, tahoma, arial, simsun, 宋体;\"";
var buttonStyle = "\"width:20%; height:26px; margin:auto 40%; padding-bottom: 4px; background-color: #DFDFDF; font-family:\'Hiragino Sans GB\', \'Microsoft YaHei\', 微软雅黑, tahoma, arial, simsun, 宋体;\""
function copyOutput(outputWindow){
	var outputMessage = outputWindow.document.getElementById('outputMessage');
	var copyTextareaBtn = outputWindow.document.getElementById('copybtn');
	copyTextareaBtn.addEventListener('click', function(event) {
		var copyTextarea = outputWindow.document.getElementById('copyarea');
		copyTextarea.select();

		try {
			var successful = outputWindow.document.execCommand('copy');
			outputMessage.innerHTML = successful ? '成功复制到剪贴板！' : '未能复制成功，可点击按钮【全选文本】，右键手动复制。';
			copyTextareaBtn.innerText = successful ? '复制文本' : '全选文本';
			// var msg = successful ? alert('成功复制到剪贴板！') : alert('未能成功复制到剪贴板，请手动复制。');
		} catch (err) {
			outputMessage.innerHTML = '未能复制成功，可点击按钮【全选文本】，右键手动复制。';
			copyTextareaBtn.innerText = '全选文本';
		}
	});
}

