var menuRight;
var urlRight;
var allZone;
var itemsObj;
var serverUrl;

function loadConfig(){
	if(serverUrl == null){
		$.getJSON("../config/config.json",function(data){
			serverUrl = data.url; 
		});
	}
	if(menuRight == null){
		$.getJSON("../config/menuRight.json",function(data){
			menuRight = data; 
		});
	}
	if(urlRight == null){
		$.getJSON("../config/urlRight.json",function(data){
			urlRight = data; 
		});
	}
	loadAllZone();
}

function loadAllZone(){
	if(allZone == null){
		allZone = $.parseJSON($.cookie('allZone'));
	}
}

function loadItemsObj(){
	if(itemsObj == null){
		$.getJSON("../config/item.json",function(data){
			itemsObj = data; 
		});
	}
}

function getParameter (controller, data) {
	return {url:controller,json:JSON.stringify(data),sessionId:$.cookie('sessionId')};
}

function getGlobalCookie(key){
	return $.cookie(key);
}

function setGlobalCookie(key,val){
	return $.cookie(key, val, { path: "/",expires: 0.25});
}

function checkSession () {
	var session = $.cookie('sessionId');
	if (session == null || session == ""){
		clearSession();
		alert("session过期，请重新登录！");
		location = '../login.jsp';
		return false;
	}
	return true;
}

function clearSession () {
	setGlobalCookie('sessionId', null);
	setGlobalCookie('managerInfo', null);
}

function getManagerInfo(){
	return $.parseJSON($.cookie('managerInfo'));
}

function submit (controller,data,validFunc,successFunc) {
	//alert(JSON.stringify(getParameter(controller,data)));
	return {    
                url: serverUrl,  
                queryParams: getParameter(controller,data),
                onSubmit: function () {  
					if(controller != 'login' && !checkSession()){
						return false;
					}
                    return validFunc();
                },   
                success: function(data){
                	commonSuccessFunc(data, successFunc);
                },
			    onLoadError:function(){
			    	alert("未知错误");
                }
            };
}

function submitData (controller,data,successFunc){
	$.ajax({
        type: "POST",
        url: serverUrl,
        data: getParameter(controller,data),
        success: function(data){
        	commonSuccessFunc(data, successFunc);
        }
    });
}

function commonSuccessFunc(data, successFunc){
	if(data == "session过期，请重新登录！"){
		clearSession();
		alert("session过期，请重新登录！");
        location = '../login.jsp';
	}else if(data == "您没有此权限，请联系管理员！"){
		alert("您没有此权限，请联系管理员！");
	}else if(data.substr(0,5) == ("error")){
		alert(data);
	}else{
		result = $.parseJSON(data);
		if(successFunc != null){
			successFunc(result);
		}
	}
}

function getListData(data){
	return {total:data.length,rows:data};
}

function loadGrid (controller,data,successFunc,errorFunc) {
	return {    
                url: serverUrl,  
                queryParams: getParameter(controller,data),
                onLoadSuccess: function () {
					if(data == "session过期，请重新登录！"){
						clearSession();
						alert("session过期，请重新登录！");
		                location = '../login.jsp';
					}
					alert(data);
					result = $.parseJSON(data);
					successFunc(result);
		        },   
                onLoadError: function (data) {
                	errorFunc();
                }
            };
}

function pagerFilter(data){
	var dg = $(this);
	var opts = dg.datagrid('options');
	var pager = dg.datagrid('getPager');
	pager.pagination({
		onSelectPage:function(pageNum, pageSize){
			opts.pageNumber = pageNum;
			opts.pageSize = pageSize;
			pager.pagination('refresh',{
				pageNumber:pageNum,
				pageSize:pageSize
			});
			dg.datagrid('loadData',data);
		}
	});
	if (!data.originalRows){
		data.originalRows = (data.rows);
	}
	var start = (opts.pageNumber-1)*parseInt(opts.pageSize);
	var end = start + parseInt(opts.pageSize);
	data.rows = (data.originalRows.slice(start, end));
	return data;
}

function showMessage(m){
	$.messager.alert("提示",m,"info");
}

function showError(m){
	$.messager.alert("提示",m,"error");
}

function showWarning(m){
	$.messager.alert("提示",m,"warning");
}

function showQuestion(m){
	$.messager.alert("提示",m,"question");
}

function showMessageF(m,func){
	$.messager.alert("提示",m,"info",function(){
		func();
	});
}

function showErrorF(m,func){
	$.messager.alert("提示",m,"error",function(){
		func();
	});
}

function showWarningF(m,func){
	$.messager.alert("提示",m,"warning",function(){
		func();
	});
}

function showQuestionF(m,func){
	$.messager.alert("提示",m,"question",function(){
		func();
	});
}

function showConfirm(m,sureFunc){
	$.messager.confirm("提示", m, function (data) {
        if (data) {
        	sureFunc();
        }
    });
}

function zoneFilter(data){
	var zones = [];
	return getFilterZones(data,zones);
}

function zoneFilterWithAll(data){
	var zones = [{id:"all",name:"全服"}];
	return getFilterZones(data,zones);
}

function getFilterZones(data, zones){
	var myZones = getManagerInfo().zones;
	for(var i = 0; i < data.length; i++){
		if(existZone(myZones, data[i].id)){
			zones.push(data[i]);
		}
	}
	return zones;
}

function existZone(myZones,zone){
	for(var j = 0; j < myZones.length; j++ ){
		if(myZones[j] == zone){
			return true;
		}
	}
	return false;
}

function getSelectedZone(combId){
	var val = [];
	var selectedVal=$("#"+combId).combobox("getValue");
	if(selectedVal == "all"){
		var data = selectedVal=$("#"+combId).combobox("getData");
		for(var i = 0; i < data.length; i++){
			if(data[i].id != "all"){
				val.push(data[i].id);
			}
		}
	}else{
		val.push(selectedVal);
	}
	return val;
}

function selectFirstCombobox(combId){
	var data = $("#"+combId).combobox('getData');
	$("#"+combId).combobox('select',data[0].id);
}

function transZones(zones){			
	var result = [];
	for(var node in zones){
		var zone = findZone(zones[node]);
		if(zone != null){
			result.push(zone.name);
		}
	}
	return result.join("<br>");
}

function findZone(zoneId){
	for(var node in allZone){
		var zone = allZone[node];
		if(zone.id == zoneId){
			return zone;
		}
	}
	return null;
}

function transPlayers(players){			
	var result = [];
	for(var node in players){
		result.push(players[node].nickName);
	}
	return result.join("<br>");
}

function transItems(items){
	var result = [];
	for(var node in items){
		var item = findItem(items[node].itemName);
		if(item != null){
			result.push(item.name+"("+items[node].count+"个)");
		}
	}
	return result.join("<br>");
}

function findItem(itemName){
	for(var node in itemsObj.rows){
		var item = itemsObj.rows[node];
		if(item.itemName == itemName){
			return item;
			break;
		}
	}
	return null;
}