function FileHelper(type){
	this.type = type;
}

FileHelper.prototype.exportDef= function(data, idx){
	let _this = this;
	let exportData = {
		type: this.type,
		content: data
	}
	let filename = this.type+"_"+idx+"_"+data.name+".json";
	let blob = new Blob([JSON.stringify(exportData)], {type: ".json"});
  
	var a = document.createElement("a"),
			url = URL.createObjectURL(blob);
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	setTimeout(function() {
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);  
	}, 0);
}

FileHelper.prototype.importDef = async function(){
	function readFile(){
		return new Promise(function(resolve, reject){
			let uploader = document.querySelector("#file_uploader");
			if(!uploader){
				let content = "<input id='file_uploader' type='file' style='display: none' accept=.json>"
				let elem = document.createElement("div");
				elem.innerHTML = content;
				
				document.body.appendChild(elem);
				uploader = document.querySelector("#file_uploader");
			}
			
			uploader.addEventListener("change", function(){
				var reader = new FileReader();
				reader.onload = function(){
					uploader.parentNode.removeChild(uploader);
					resolve({name: uploader.files[0].name, content: reader.result});						
				}			
				reader.readAsText(event.target.files[0]);
			});
			uploader.click();
		});	
	}
	
	let importData = JSON.parse((await readFile()).content);
	if(importData.type == this.type){
		return importData.content;
	} else {
		alert("The provided file is not in the correct format!");
		return -1;
	}	
}