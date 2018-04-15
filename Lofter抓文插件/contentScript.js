//This is the content script
window.onload = function () {
	var totalItem = document.querySelector('.m-txtsch > .txt > .currt > span');
	totalItemLength = totalItem ? parseInt(totalItem.innerText) : 0 ;
	console.log('ready');
	var startURL = document.URL;

	chrome.runtime.onConnect.addListener (function (port) {
		console.log(port.name == "lofterCatcher");
		port.onMessage.addListener(function (msg) {

			function startCatch() {
				chrome.storage.sync.get(function (data){
					var keyword = data.keyword;
					port.postMessage('catching');
					getAllLinks(keyword);
					port.postMessage('done');
				});
			}

			try {
				if ((/http\:\/\/[a-z0-9\-]{5,}\.lofter\.com\/view/).test(startURL) == false) {
					port.postMessage('wrongStartURL');
				} else {
					port.postMessage('rightStartURL');
					var timer = null;
					if (msg == "start") {
						var prevPageYOffset;
						var currPageYOffset;
						var stopCount = 0;
						timer = setInterval(function(){
							window.scrollBy(0, 1000);
							currPageYOffset = window.pageYOffset;

							if((currPageYOffset + "") == (prevPageYOffset + "")) {
								prevPageYOffset = currPageYOffset;
								stopCount ++; 						
								var loadedItemLength = document.getElementsByClassName('g-bdc')[0].querySelectorAll(".text, .img, .music, .movie").length;
								if(loadedItemLength == totalItemLength){
									clearInterval(timer);
									port.postMessage('pageLoaded');
									startCatch();
								} else if (stopCount > 10) {
									clearInterval(timer);
									port.postMessage('pageScrollCannotLoadMore');
								}
							} else {
								prevPageYOffset = currPageYOffset;
								port.postMessage('pageScrollContinue');
							}
						}, 500);
					}
				}

				if (msg == "confirmCatching") {
					startCatch();
				}

			} catch (err) {
				port.postMessage('error');
			}					
		});
	});
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
	var outputWindow = window.open('','targetWindow','scrollbars=0,resizable=1,width=600,height=450');
	outputWindow.focus();
	getOutPut(articleUrlList, articleTitleList, processItem, n-1, output, outputWindow);
}

function getOutPut(articleUrlList, articleTitleList, processItem, k, output, outputWindow) {
	var warningText1 = "******************警********告********************\n本文原载于 "
	var warningText2 = "，\n版权归原作者所有，请勿用于二次传播及任何商业用途！\n*************************************************\n\n";
	var authorUrl = document.URL.split("/view")[0];

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
			output += warningText1 + authorUrl + articleUrlList[k] + warningText2 + '【' + articleTitleList[k] + '】\n\n';
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
		('<div style="display:flex; flex-direction: column;"><h3 id="outputMessage" style='+redStyle+'>抓取完毕</h3><button id="copybtn" style=' + buttonStyle + '>复制文本</button></div><textarea id="copyarea" style="width:100%; height:85%">'+ output + '</textarea>') 
		: '<h3 style='+redStyle+'>努力抓取中…… 正在抓取第 ' + (len-k) + ' 篇，共 ' + len + ' 篇</h3>';
	if(k<0){
		if (output == ''){
			outputWindow.document.body.innerHTML = '<h3 id="outputMessage" style='+redStyle+'>抓取失败，未找到相应结果</h3>'
		}
		copyOutput(outputWindow);
	};
	return output;
}

var redStyle = "\"flex: auto; margin:2px auto; color: #d9534f; text-align: center; font-family:\'Hiragino Sans GB\', \'Microsoft YaHei\', 微软雅黑, tahoma, arial, simsun, 宋体;\"";
var buttonStyle = "\"flex: auto; margin: auto; color: #fff; width: 80px; padding: 7px 12px; font-size: 14px; font-weight: 400; line-height: 1.42857143; text-align: center; white-space: nowrap; vertical-align: middle; -ms-touch-action: manipulation; touch-action: manipulation; cursor: pointer; border: 1px solid transparent; border-radius: 4px; background-color: #f0ad4e; border-color: #eea236; \"";

function copyOutput(outputWindow){
	var outputMessage = outputWindow.document.getElementById('outputMessage');
	var copyTextareaBtn = outputWindow.document.getElementById('copybtn');
	copyTextareaBtn.addEventListener('click', function(event) {
		var copyTextarea = outputWindow.document.getElementById('copyarea');
		copyTextarea.select();
		try {
			var successful = outputWindow.document.execCommand('copy');
			outputMessage.innerHTML = successful ? '复制成功！' : '复制失败。可点击按钮【全选文本】，右键手动复制。';
			copyTextareaBtn.innerText = successful ? '复制文本' : '全选文本';
		} catch (err) {
			outputMessage.innerHTML = '未能复制成功，可点击按钮【全选文本】，右键手动复制。';
			copyTextareaBtn.innerText = '全选文本';
		}
	});
}
