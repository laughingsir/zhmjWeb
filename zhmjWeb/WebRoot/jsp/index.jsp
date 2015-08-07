<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
	<title>主公无双管理中心</title>
  <link rel="stylesheet" href="../easyui/themes/default/easyui.css" type="text/css"></link>
  <link rel="stylesheet" href="../easyui/themes/icon.css" type="text/css"></link>
  <link rel="stylesheet" href="../easyui/demo/demo.css" type="text/css"></link>
  <script type="text/javascript" src="../easyui/jquery.min.js"></script>
  <script type="text/javascript" src="../easyui/jquery.easyui.min.js"></script>
  <script type="text/javascript" src="../easyui/jquery.cookie.js"></script>
  <script type="text/javascript" src="../easyui/locale/easyui-lang-zh_CN.js"></script>
  <script type="text/javascript" src="../js/common.js"></script>
  </head>
  
  
 <body class="easyui-layout">  
    <div data-options="region:'north',title:'主公无双',collapsible:false" style="height:68px;">
		<div style="padding:10px;float:left">
			<span id ="username" style="color:#0099FF;"></span>
		</div>
		<div style="padding:5px 10px;float:right">
			<a href="#" class="easyui-linkbutton" data-options="toggle:true,group:'g1',iconCls:'icon-back'" onclick=" return logout()">退出</a>
		</div>
	</div>  
    <div data-options="region:'west',title:'菜单',split:true" style="width:200px;">
		<div class="easyui-panel" style="padding:5px">
		<ul id="tt" class="easyui-tree" data-options="method:'get',animate:true"></ul>
		</div>
	</div> 
    <div  id="tb" class="easyui-tabs" data-options="region:'center'" style="background:#eee;">
    	<div title="首页" style="padding:20px;">   
        	欢迎登录  
        </div>   
	</div> 
</body>
</html>
<script type="text/javascript">
var managerInfo;
$(document).ready(function () {
	loadConfig();
	if(!checkSession()) return;
			managerInfo = getManagerInfo();
        	$('#username').html('【'+managerInfo.username+'】');
            $('#tt').tree({
            	url:'../config/menu.json',
                onClick: function (node) {
                	if(!$('#tb').tabs('exists',node.text)){
                		if(node.attributes.target != null){
                			$('#tb').tabs('add', {
                        		title:  node.text,
                        		href: node.attributes.target,
                        		closable: true
                    		}); 
                		}
                	}else{
                		$('#tb').tabs('select', node.text); 
                	}                
                },
                loadFilter:function(data,parent){
                	var result = [];
               	 	for(var i = 0;i< data.length;i++){
               	 		var node = data[i];
               	 		if(checkRight(node)){
               	 			result.push(node);
               	 			addChildren(node);
               	 		}
               	 	}
               	 	return result;
                }
            });
            /*$('#tb').tabs('add', {
                        		title:  '发布公告',
                        		href: 'noticelist.html',
                        		closable: true
                    		}); */
        });
        
function checkRight(node){
	var menuRights = managerInfo.menuRights;
	for(var i = 0; i < menuRights.length; i++){
		if(menuRights[i].indexOf(node.attributes.right) == 0){
			return true;
		}
	}
	return false;
}
        
function addChildren(node){
	var resultChildrens=[];
	var childrens = node.children;
	if(childrens){
		for(var i = 0;i< childrens.length;i++){
			var children = childrens[i];
			if(checkRight(children)){
		    	resultChildrens.push(children);
		    	addChildren(children);
			}
		}
		node.children = resultChildrens;
	}
}

function logout () {
	showConfirm('确定退出吗？',function(){
		clearSession();
		location = '../login.jsp';
	});
}        
       
</script>

 
