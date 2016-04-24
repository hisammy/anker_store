/*
  $.cookie('cname'); // get
  $.cookie('cname', 'value', { expires: 7, path: '/' }); // set 7 days
  $.cookie('cname', null, {path: '/'}); // delete
*/
$.cookie = function(key, value, options) {
    options = $.extend({}, options); //options || {}
    key = encodeURIComponent(key);
    if (undefined !== value) {
        if (value === null) {
            options.expires = -1;
        }
        if (parseInt(options.expires, 10)) {
            var days = options.expires, t = options.expires = new Date();
            t.setTime(t.getTime() + (days * 24 * 60 * 60 * 1000));
        }
        var ret = [
            key, '=',
            options.raw ? value : encodeURIComponent(value),
            options.expires ? '; expires=' + options.expires.toUTCString() : '',
            options.path ? '; path=' + options.path : '',
            options.domain ? '; domain=' + options.domain : '',
            options.secure ? '; secure' : ''
        ].join('');
        document.cookie = ret;
        return ret;
    }
    var result,
        decode = options.raw ?
            function(s) { return s; } : decodeURIComponent;
    return (result = new RegExp('(?:^|; )' + key + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
};

// 后期可以考虑移到common.js
var AppActions = {
  getUser: function() {
    return {
      'token': $.cookie('token') || '',
      'order_id': $.cookie('order_id') || '',
      'order_token': $.cookie('order_token') || '',
      'email': localStorage.getItem('email') || '',
      'nick_name': localStorage.getItem('nick_name') || localStorage.getItem('email') || 'Account',
      'avatar': localStorage.getItem('avatar_image') || '',
      'loginType': localStorage.getItem('loginType'),
      'invitation_code': localStorage.getItem('invitation_code') || '',
      'is_power_user': localStorage.getItem('is_power_user') || '',
    };
  },
  getCountry: function() {
    return $.cookie('country');
  },
  setCart: function(n) {
    if(this.getCountry() == 'US') {
      n = n || 0;
      $.cookie('cart_count', n, { expires: 365, path: '/' });
      var cartCount = document.getElementById('cartCount');
      if (cartCount) {
        cartCount.innerHTML = n;
        if(n  == 0) {
          cartCount.classList.add('hide');
        } else {
          cartCount.classList.remove('hide');
        }
      };
    }
  },
  signOut: function() {
    $.cookie('token', null, {path: '/'});
    $.cookie('order_id', null, {path: '/'});
    $.cookie('order_token', null, {path: '/'});
    $.cookie('cart_count', null, {path: '/'});
    this.setCart(0);
    localStorage.removeItem('email');
    localStorage.removeItem('profile');
    localStorage.removeItem('nick_name');
    localStorage.removeItem('avatar_image');
    localStorage.removeItem('invitation_code');
    localStorage.removeItem('user_password');
    localStorage.removeItem('order_price');
    localStorage.removeItem('purchase');
    localStorage.removeItem('country_code');
  },
  signIn: function(json) {
    $.cookie('token', json.token, { expires: 365, path: '/' });
    if (json.id) {
      localStorage.setItem('user_id', json.id);
      ga('create', config.GOOGLE_TRACKING_ID, {user_id: localStorage.getItem('user_id')});
      ga('set', 'userId', localStorage.getItem('user_id'));
      ga('set', 'dimension1', localStorage.getItem('user_id'));
    }
    if (json.email) localStorage.setItem('email', json.email);
    if (json.nick_name) localStorage.setItem('nick_name', json.nick_name);
    json.is_power_user ? localStorage.setItem('is_power_user', '1') : localStorage.removeItem("is_power_user");
    if (json.order_id && json.order_token) {
      $.cookie('order_id', json.order_id, { expires: 365, path: '/' });
      $.cookie('order_token', json.order_token, { expires: 365, path: '/' });
    } else {
      $.cookie('order_id', null, {path: '/'});
      $.cookie('order_token', null, {path: '/'});
      this.setCart(0);
    }
    json.loginType ? localStorage.setItem('loginType', json.loginType) : localStorage.removeItem('loginType');
    localStorage.removeItem('user_password');
    localStorage.removeItem('order_price');
    localStorage.removeItem('purchase');
  },
  getUrlParam: function() {
    var search = location.search.replace('?', '').split('&');
    var params = {};
    for (var i in search) {
      var key = search[i].split('=')[0];
      var value = search[i].split('=')[1];
      params[key] = value;
    }
    return params;
  },
};


window.fbAsyncInit = function() {
  FB.init({
    appId: config.FB_APP_ID,
    xfbml: true,
    version: 'v2.5'
  });
};
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {return; }
  js = d.createElement(s); js.id = id;
  js.src = '//connect.facebook.net/en_US/sdk.js';
  fjs.parentNode.insertBefore(js, fjs);
} (document, 'script', 'facebook-jssdk'));
(function (d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {
    return;
  }
  js = d.createElement(s);
  js.id = id;
  //js.src = 'https://plus.google.com/js/client:platform.js?onload=startApp';
  js.src='https://apis.google.com/js/client:platform.js'
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'google-jssdk'));

$(function(){
  var isEmail = function(val) {
    return /^[a-zA-Z0-9]+([._\\-]*[a-zA-Z0-9])*@([a-zA-Z0-9]+[-a-zA-Z0-9]*[a-zA-Z0-9]+.){1,63}[a-zA-Z0-9]+$/.test(val);
  };
  var cookieName = 'popup_subscribe';
  var user = AppActions.getUser();
  var GOOGLE_APP_ID = '253654138513-tgkjhnef1vhic0f6l7lattufdct3o82q.apps.googleusercontent.com'; // dev
  //- var isLogined = user.token;
  var popUtils = {
    googleLoginDig: function() {
      var self = this;
      var webconfig = {
        'client_id': config.GOOGLE_APP_ID,
        'scope':'https://www.googleapis.com/auth/userinfo.email',
        'collection': 'visible'
      }
      gapi.auth.authorize(webconfig, function(authResult) {
        gapi.client.load('plus', 'v1', function() {
          gapi.client.plus.people.get({userId: 'me'}).execute(function(resp) {
            var email = resp.emails ? resp.emails[0].value : '';
            var user = {
              "login": email,
              "uid": resp.id,
              "third_party": "google",
              "nick_name": resp.displayName || email.split('@')[0]
            };
            self.third_party_login(user, 'gg');
          });
        });
      });
    },
    facebookLoginDig: function() {
      var self = this;
      if (!window.FB) {
        return;
      }
      if (FB.getUserID() != "") {
        FB.api('/me', function () {
          FB.logout();
        })
      }
      FB.login(function(response) {
        if (response.status === "connected") {
          FB.api('/me?fields=name,email', {locale: 'en_US', fields: 'name, email'}, function(response) {
            if (!response.error) {
              var user = {
                "login": response.email || "",
                "uid": response.id,
                "third_party": "facebook",
                "nick_name": response.name
              };
              self.third_party_login(user, 'fb');
            }
          });
        }
      }, {scope: 'public_profile,email,user_birthday'});
    },
    third_party_login: function(user, type) {
      var self = this;
      var body = {
          "register_source": encodeURIComponent(location.href),
          "user": user
        }, order_id = user.order_id;
      if (!user.token && order_id != "") {
        body.order_id = order_id;
      }
      $.ajax({
        url: '/api/content?path=/api/sessions/third_party_login',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(body),
      })
      .done(function(json) {
        // console.log(json);
        json = json || {};
        var err = json.error || json.exception;
        if (err) {
          return alert(json.err);
        } else if (json.token) {
          var action = 'fb' == type? 'FaceBook' : 'Google';
          ga('send', 'event', 'Regsiter', action, 'PW');
          // console.log(action);
          AppActions.signOut();
          json.loginType = 'third_party_login';
          AppActions.signIn(json);
          AppActions.setCart(json.item_count);
          self.loginBack();
        }
      })
      .fail(function() {
      })
      .always(function() {});
    },
    loginBack: function(url) {
      //- location.href = location.pathname + location.search;
      location.reload();
    },
    returnLogin: function() {
      location.href = '/login?back='+ location.pathname.slice(1) + location.search;
    },
  };
  // load pop
  var params = AppActions.getUrlParam();
  var getDatas = function() {
    $.ajax({
      url: '/api/content?path=/api/toast_configurations/obtain_toast_configuration?type=campaign',
      type: 'GET', // POST
      dataType: 'json'
    })
    .always(function(json) {
      // console.log(json);
      if (json && json.position) {
        $pop.addClass('show').addClass(json.position);
        ga('send', 'event', 'Regsiter', 'Show', 'PW');
        if (json.pictrue) {
          $pop.find('.img').append('<img src=' +json.pictrue+ '>');
        }
        if (json.show_close == false) {
          $pop.find('i.close').hide();
        }
        var $text = $pop.find('.text');
        if (!json.description) {
          $pop.find('.info').hide();
        } else {
          $text.find('h4').html(json.title);
          $text.find('div').html(json.description);
        }
        json.btn1_title && $form.find('.submit').html(json.btn1_title);
      }
    });
  };
  window.showPopupSignup = getDatas; //给外部调用, 显示弹窗
  if (params.preview == 'on' || !AppActions.getUser().token && !$.cookie(cookieName)) {
    getDatas();
  }

  // actions
  var $pop = $('#popupsignup');
  var $input = $pop.find('input');
  var $form = $pop.find('form');
  $pop.find('.login').click(function(e) {
    event.preventDefault();
    popUtils.returnLogin();
  });
  $pop.find('.gg').click(function(e) {
    popUtils.googleLoginDig();
  });
  $pop.find('.fb').click(function(e) {
    popUtils.facebookLoginDig();
  });
  $input.on('input', function(){
    var $this = $(this),
    $box = $this.closest('div.input-normal');
    if ($this.val()) {
      $box.addClass('fill');
    } else {
      $box.removeClass('fill');
    }
  });
  $pop.find('i.close').on('click', function(event) {
    $.cookie(cookieName, 1, { expires: 7, path: '/' });
    $pop.removeClass('show');
  });
  $form.on('submit', function(event) {
    event.preventDefault();
    var email = $pop.find('input[type="email"]').val();
    var password = $pop.find('input[type="password"]').val();
    if (!isEmail(email)) {
      return alert('Please enter a valid email address.');
    } else if (password.length < 8 || password.length > 20) {
      return alert('Password must be 8 - 20 digits, letters or characters.');
    }
    var body = {
      'register_source': encodeURIComponent(location.href),
      'email': email,
      'password': password,
      'is_subscribe': true,
      'country_code': AppActions.getCountry() || 'US',
      'invitation_code': AppActions.getUrlParam().invite
    };
    var user = AppActions.getUser();
    if (!user.token) {
      body['order_id'] = user.order_id;
    } else {
      AppActions.signOut();
    }
    var $btn = $form.find('.submit').hide();
    var $loading = $('.pop-loading').show();
    $.ajax({
      url: '/api/content?path=/api/registrations',
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(body),
    })
    .done(function(json) {
      // console.log(json);
      if (json && json.result) {
        fbq('track', 'CompleteRegistration');
        ga('send', 'event', 'Regsiter', 'SUBSCRIBE', 'PW');
        // Google ADwords加入注册追踪代码
        var img = document.createElement('img');
        img.height = 1;
        img.width = 1;
        img.border = 0;
        img.src = "//www.googleadservices.com/pagead/conversion/921123694/?label=FRXkCJnk5mQQ7vactwM&guid=ON&script=0";
        document.body.appendChild(img);
        alert('Registration succesful.');
        $pop.removeClass('show');
        $.cookie(cookieName, 1, { expires: 12*31, path: '/' });
        setTimeout(function() {
          location.href = '/activation?email=' + email;
        }, 2000);
      } else {
        return alert(json.error);
      }
    })
    .fail(function(req, text, err) {
      // console.log(req.responseJSON, text, err);
      var json = req.responseJSON;
      alert(json && json.error || 'Subscribe failed, please try again.');
    })
    .always(function() {
      $btn.show();
      $loading.hide();
    });
  });
});
