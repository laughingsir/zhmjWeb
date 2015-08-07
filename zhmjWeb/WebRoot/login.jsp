<!DOCTYPE html>
<html>
  <head>
    <title>登录</title>
	<meta http-equiv="content-type" content="text/html; charset=UTF-8">
	<link rel="stylesheet" href="easyui/themes/default/easyui.css" type="text/css"></link>
    <link rel="stylesheet" href="easyui/themes/icon.css" type="text/css"></link>
    <link rel="stylesheet" href="easyui/demo/demo.css" type="text/css"></link>
    <script type="text/javascript" src="easyui/jquery.min.js"></script>
    <script type="text/javascript" src="easyui/jquery.easyui.min.js"></script>
	<script type="text/javascript" src="easyui/jquery.cookie.js"></script>
    <script type="text/javascript" src="easyui/locale/easyui-lang-zh_CN.js"></script>
	<script type="text/javascript" src="js/common.js"></script>
  </head>
  <script type="text/javascript">
 	  $(function(){
		  if(serverUrl == null){
			$.getJSON("config/config.json",function(data){
				serverUrl = data.url; 
			});
	  }
	  });
	  function login () {
		var data = {username:$("#username").val(),password:$("#password").val()};		
		$('#ff').form('submit', submit('login',data,
				function () {  
                    if($("#username").val().trim()==""){
						alert("请输入用户名");
						$("#username").focus();
						return false;
					}
					if($("#password").val().trim()==""){
						alert("请输入密码");
						$("#password").focus();
						return false;
					}
                },function (result) {
			            if(result.status == 0){
							showMessage("登录成功！");
			                setGlobalCookie('sessionId', result.sessionId);
			                setGlobalCookie('managerInfo', JSON.stringify(result.managerInfo));
			                setGlobalCookie('allZone', JSON.stringify(result.allZone));
			                location = 'jsp/index.jsp';
			            }else{
							setGlobalCookie('sessionId', null);
			                setGlobalCookie('username', null);
							if(result.status == 1){
			            		showError("用户名不存在！");							
								$('#username').focus();
							}else if(result.status == 2){
			            		showError("密码错误！");
								$('#username').focus();
							}
						}
							
			        }
            ));  	 	 	
	  }
  </script>
  <body>
    <div id="w" class="easyui-window" title="请先登录" data-options="closable:false,maximizable:false,minimizable:false,collapsible:false,modal:true,draggable:false,iconCls:'icon-tip'" style="width:400px;height:300px;padding:50px;">
		<form id="ff" class="easyui-form" method="post" data-options="novalidate:true">
			<div style="margin-bottom:10px">
            <input class="easyui-textbox" id="username" style="width:100%;height:30px;padding:12px" data-options="prompt:'请输入用户名',iconCls:'icon-man',iconWidth:38">
        </div>
        <div style="margin-bottom:20px">
            <input class="easyui-textbox" id="password" type="password" style="width:100%;height:30px;padding:12px" data-options="prompt:'请输入密码',iconCls:'icon-lock',iconWidth:38">
        </div>
        <div>
            <a href="javascript:;" onclick="login()" class="easyui-linkbutton" data-options="iconCls:'icon-ok'" style="padding:5px 0px;width:100%;">
                <span style="font-size:14px;">登录</span>
            </a>
        </div>
		</form>
	</div>
  </body>
</html>
