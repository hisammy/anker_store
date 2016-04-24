var side = "";
window.onload = function() {
  FastClick.attach(document.body);
  var nick_name = localStorage.getItem('nick_name');
  var email = localStorage.getItem('email') || 'Account';
  var country_code = localStorage.getItem('country_code');
  if($.cookie('token')) {
    $(".setp1Info").html(nick_name ? nick_name : email).css("color","#37a7e1");
    getUserTicket();
  }
  $("#register").on("click",function(){
    ga('send','event','Campaign','Product','QC');
  })
  $(".resistance").on("click",function(){
      if(!$.cookie('token')){
        dialog.confirm({
          'content': "Please complete previous step!"
        }, function() {
          //
        }, '', 'OK');
        return;
      }
      $(this).css("color","#00a7e1");
      $(".enlightenment").css("color","white");
      side = "resistance";
  })
  $(".enlightenment").on("click",function(){
      if(!$.cookie('token')){
        dialog.confirm({
          'content': "Please complete previous step!"
        }, function() {
          //
        }, '', 'OK');
        return;
      }
      $(this).css("color","#00a7e1");
      $(".resistance").css("color","white");
      side = "enlightenment";
  })
  $("#login").on("click",function(){
  })
  $(".setp3").on("click","img",function(event){
      shareConfirm(event, $(event.target).attr("class"));
  })
}
window.fbAsyncInit = function() {
  FB.init({
    appId      : config.FB_APP_ID,
    xfbml      : true,
    version    : 'v2.5'
  });
};
//签到
function shareEntries(type) {
  if($.cookie('token')) {
    $.ajax({
      method: "POST",
      url: "/api/content?path=/api/deals/deals_audios/",
      headers: {'token': $.cookie('token')},
      contentType: 'application/json',
      data: JSON.stringify({"action_type": type, "deals_type":"IG","country_code": side}),
      success: function(r) {
        getUserTicket();
      },
      complete: function(r) {
        if(r.status === 401) logOut();
      }
    });
  }
}
function getUserTicket(){
  if($.cookie('token')) {
    $.ajax({
      method: "get",
      url: "/api/content?path=/api/deals/deals_audios/entries",
      headers: {'token': $.cookie('token')},
      contentType: 'application/json',
      data: {"deals_type":"IG","country_code": '',"is_all":true,"verson":new Date().getTime()},
      success: function(r) {
        $(".count").html(r.entries);
      },
      complete: function(r) {
        if(r.status === 401) logOut();
      }
    });
  }
}
//分享步骤错误提示
function shareConfirm(event, val) {
  if($.cookie('token') && side) {
    shareEntries(val)
    if(val ==="share_google"){
      window.open("https://plus.google.com/share?url="+encodeURIComponent(location.href+"?verson=1"),'', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600'); 
    }
    return true;
  } else {
    event.preventDefault();
    event.stopPropagation();
    dialog.confirm({
      'content': "Please complete previous step!"
    }, function() {
      //
    }, '', 'OK');
    return false;
  }
}
 //退出
function logOut() {
  $.removeCookie('token', { path: '/' });
  localStorage.removeItem('nick_name');
  localStorage.removeItem('email');
  location.href=location.href;
}

