var menuRight;
var urlRight;
var allZone;
var itemsObj;
var serverUrl;
var allZoneTag;

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
	loadAllZoneTag();
	allZone = $.parseJSON(sessionStorage['allZone']);
}

function loadItemsObj(){
	if(itemsObj == null){
		$.getJSON("../config/item.json",function(data){
			itemsObj = data; 
		});
	}
}

function loadAllZoneTag(){
	if(allZoneTag == null){
		$.getJSON("../config/zoneTag.json",function(data){
			allZoneTag = data; 
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
		showWarningF("session过期，请重新登录！",function(){
			location = '../login.html';
        });
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

function submitDI(method,jsonData,validFunc,successFunc){
	var data = {
		method : method,
		json : jsonData
	};
	submit('DIInvoke',data,validFunc,function (result) {
				successFunc($.parseJSON(result));
		}    
	);
}

function submit (controller,data,validFunc,successFunc) {
	//showMessage(JSON.stringify(getParameter(controller,data)));
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
			    	showError("未知错误");
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
	if(data == "error:session过期，请重新登录！"){
		clearSession();
		showWarningF("session过期，请重新登录！",function(){
			location = '../login.html';
        });
	}else if(data == "error:您没有此权限，请联系管理员！"){
		showWarning("您没有此权限，请联系管理员！");
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
					if(data == "error:session过期，请重新登录！"){
						clearSession();
						showWarningF("session过期，请重新登录！",function(){
							location = '../login.html';
				        });
					}
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

function zoneTagFilter(data){
	var zones = [];
	return getFilterZoneTags(data,zones);
}

function zoneTagFilterWithAll(data){
	var zones = [{id:"all",name:"全部"}];
	return getFilterZoneTags(data,zones);
}

function getFilterZoneTags(data, zones){
	var myZones = getManagerInfo().zoneTags;
	for(var i = 0; i < data.length; i++){
		if(existZone(myZones, data[i].id)){
			zones.push(data[i]);
		}
	}
	return zones;
}

function transZoneTags(zones){			
	var result = [];
	for(var node in zones){
		var zone = findZoneTag(zones[node]);
		if(zone != null){
			result.push(zone.name);
		}
	}
	return result.join("<br>");
}

function findZoneTag(zoneId){
	for(var node in allZoneTag){
		var zone = allZoneTag[node];
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

function formatItems(val,row){
	return transItems(val);
}

function formatContent(val,row){
	if(val == undefined) return '';
	return val.replaceAll("\n", "<br>");
}

function formatDouble(val){
	if(val == undefined) return '';
	return val.toFixed(2);
}

function formatPercent(val){
	if(val == undefined) return '';
	return (val*100).toFixed(2) + "%";
}

function formatDateToDay(val, row, index){
	return new Date(val).format("yyyy-MM-dd"); 
}

function formatDateToMonth(val, row, index){
	return new Date(val).format("yyyy-MM"); 
}

function formatDate(val, row, index){
	return new Date(val).format("yyyy-MM-dd HH:mm:ss"); 
}

Date.prototype.format = function(fmt)   
{  
  var o = {   
    "M+" : this.getMonth()+1,                 //月份   
    "d+" : this.getDate(),                    //日   
    "H+" : this.getHours(),                   //小时   
    "m+" : this.getMinutes(),                 //分   
    "s+" : this.getSeconds(),                 //秒   
    "q+" : Math.floor((this.getMonth()+3)/3), //季度   
    "S"  : this.getMilliseconds()             //毫秒   
  };   
  if(/(y+)/.test(fmt))   
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
  for(var k in o)   
    if(new RegExp("("+ k +")").test(fmt))   
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
  return fmt;   
};

String.prototype.startWith=function(str){
	if(str==null||str==""||this.length==0||str.length>this.length)
	  return false;
	if(this.substr(0,str.length)==str)
	  return true;
	else
	  return false;
	return true;
};

String.prototype.replaceAll  = function(s1,s2){     
    return this.replace(new RegExp(s1,"gm"),s2);     
};

$.extend($.fn.datagrid.methods, {
	editCell: function(jq,param){
		return jq.each(function(){
			var opts = $(this).datagrid('options');
			var fields = $(this).datagrid('getColumnFields',true).concat($(this).datagrid('getColumnFields'));
			for(var i=0; i<fields.length; i++){
				var col = $(this).datagrid('getColumnOption', fields[i]);
				col.editor1 = col.editor;
				if (fields[i] != param.field){
					col.editor = null;
				}
			}
			$(this).datagrid('beginEdit', param.index);
			for(var i=0; i<fields.length; i++){
				var col = $(this).datagrid('getColumnOption', fields[i]);
				col.editor = col.editor1;
			}
		});
	}
});

$.extend($.fn.combobox.methods, {
    yearandmonth: function (jq) {
        return jq.each(function () {
            var obj = $(this).combobox();
            var date = new Date();
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var table = $('<table>');
            var tr1 = $('<tr>');
            var tr1td1 = $('<td>', {
                text: '-',
                click: function () {
                    var y = $(this).next().html();
                    y = parseInt(y) - 1;
                    $(this).next().html(y);
                }
            });
            tr1td1.appendTo(tr1);
            var tr1td2 = $('<td>', {
                text: year
            }).appendTo(tr1);

            var tr1td3 = $('<td>', {
                text: '+',
                click: function () {
                    var y = $(this).prev().html();
                    y = parseInt(y) + 1;
                    $(this).prev().html(y);
                }
            }).appendTo(tr1);
            tr1.appendTo(table);

            var n = 1;
            for (var i = 1; i <= 4; i++) {
                var tr = $('<tr>');
                for (var m = 1; m <= 3; m++) {
                    var td = $('<td>', {
                        text: n,
                        click: function () {
                            var yyyy = $(table).find("tr:first>td:eq(1)").html();
                            var cell = $(this).html();
                            var v = yyyy + '-' + (cell.length < 2 ? '0' + cell : cell);
                            obj.combobox('setValue', v).combobox('hidePanel');

                        }
                    });
                    if (n == month) {
                        td.addClass('tdbackground');
                    }
                    td.appendTo(tr);
                    n++;
                }
                tr.appendTo(table);
            }
            table.addClass('mytable cursor');
            table.find('td').hover(function () {
                $(this).addClass('tdbackground');
            }, function () {
                $(this).removeClass('tdbackground');
            });
            table.appendTo(obj.combobox("panel"));

        });
    }
});