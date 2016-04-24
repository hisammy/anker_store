(function(){
  window.onload = function() {
    FastClick.attach(document.body);
    //alert(navigator.platform);
    $(".btn").on("click",function(){
      var reg = /^[a-zA-Z0-9]+([._\\-]*[a-zA-Z0-9])*@([a-zA-Z0-9]+[-a-zA-Z0-9]*[a-zA-Z0-9]+.){1,63}[a-zA-Z0-9]+$/,
          userEmail = $("#userEmail").val() || localStorage.getItem('email');
        if(!reg.test(userEmail)){
            alert("Please enter a valid email address (Example: name@domain.com)");
            return;
        }else{
            shareEntries();
        }
    })
    if($.cookie('token')) {
      var email = localStorage.getItem('email');
      if(email){
          $(".loginDiv").html(email).css({"color":"#37a7e1","text-align":"center"});
      }
      $(".btn").val("JOIN NOW");
    }
  }
  //签到
  function shareEntries() {
      var  screens={};
      screens.width = Math.min(window.screen.width, window.innerWidth);
      screens.height = Math.min(window.screen.height, window.innerHeight);
      screens.colorDepth = window.screen.colorDepth || 0;
      $.ajax({
        method: "POST",
        url: "/api/content?path=/api/registrations/s7_activity",
        contentType: 'application/json',
        headers:{'_screens':JSON.stringify(screens)},
        data: JSON.stringify({
        'register_source': encodeURIComponent(location.href),
        'email': $("#userEmail").val() || localStorage.getItem('email'),
        'is_subscribe': true,
        'country_code':'US',
        'is_s7':/(SM-G930)/g.test(navigator.userAgent)
      }),
        success: function(r) {
          if(r.activity && r.activity=="join"){
            alert("Congratulations! You’ve won the new SlimShell case for $0.01. We will sent e-mail with code to you as soon.");
          }else if(r.activity && r.activity=="finish" && !r.olduser){
              alert("Thank you for registration, but today code is claimed.")
          }else if(r.activity && r.activity=="finish" && r.olduser){
              alert("Today code is claimed.")
          }
          else if(!r.activity && r.olduser){
            alert("Your device is not S7.")
          }
          else if(!r.activity && !r.olduser){
            alert("Thank you for registration, but your device is not S7.");
          }
          else{
            alert("This email has been joined.");
          }
        },
        error:function(r){
            alert(r.responseJSON.error);
        }
      });
  }
  function isPC(){
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone","SymbianOS", "Windows Phone","iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
}

})()


