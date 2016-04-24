$(function(){
  var $window = $(window);
  var $document = $(document);
  // toggle country
  $('#j-country').on('click', function(e) {
    $(this).toggleClass('active');
  });
  // gg analytics
  $('.j-ga').click(function(){
    var $btn = $(this), val = $btn.data('v');
    if (!val || !window.ga) return;
    ga('send', 'event', '10000hours', 'btn_click', val);
  });
  // 特殊链接
  $('.j-spec').click(function(event){
    var $this = $(this), keys = $this.data('keys'), href = $this.attr('href');
    var base = href.replace(/\/[?|ref].+$/g, '');
    var timestamp = Math.round(new Date().getTime()/1000) - 60;
    href = base + '/ref=sr_1_10?ie=UTF8&qid=' +timestamp+ '&sr=1-10&keywords=external+battery+charger&m=A294P4X9EWVXLJ&tag=' + (keys.tag || 'ianker-20');
    // console.log(event, timestamp, keys, href);return event.preventDefault();
    $this.attr('href', href);
  });
  // facebook
  /*var $form = $('#sec12 .form');
  var $show_btn = $('#sec12 .fb-btn').click(function() {
    $form.show();
  });
  $form.on('click', '.cancel', function(event) {
    $form.hide();
  });
  $form.on('click', '.btn', function(event) {
    var $btn = $(this);
    var $name = $('#name'), $email = $('#email'),
      name = $.trim($name.val()),
      email = $.trim($email.val());
    if (!name) {
      alert(i18n.name_required);
      return;
    } else if(!email) {
      alert(i18n.email_required);
      return;
    }
    if ($btn.prop('disabled')) return;
    $btn.prop('disabled', true);
    // console.log('ajax');
    $.ajax({
      url: '/pages/10000hours/fb.php',
      type: 'POST',
      dataType: 'json',
      data: {name: name, email: email,
        receive: $('#receive').is(':checked') ? 1 : 0,
        site: $('input[name="site"]').val(),
      }
    })
    .done(function(json) {
      json = json || {};
      if (json.error) {
        return alert(json.error);
      }
      alert(i18n.successed);
      $show_btn.off();
      $form.hide();
    })
    .fail(function() {
      alert(i18n.try_again);
    })
    .always(function() {
      $btn.prop('disabled', false);
    });
  });*/

  // navigator
  var $navigator = $('#j-nav'), $tabs = $navigator.find('a');
  var $section = $('.section');
  var sectionPos = [];
  $section.each(function(){
    sectionPos.push(this.offsetTop);
  });
  (function(){ // scroll
    var prev_tab = location.hash.replace('#', '') || $section.eq(0).attr('id');
    var startTime = new Date().getTime();
    $window.scroll(function(){
      var top = $window.scrollTop();
      for(var i = 0; i < sectionPos.length; i ++){
        if(top < sectionPos[i] - 200){
          var $target = $section.eq(i - 1);
          $tabs.eq(i - 1).addClass('active').siblings('.active').removeClass('active');
          if (prev_tab !== $target.attr('id')) {
            var timeSpent = new Date().getTime() - startTime;
            // console.log('change tab =>', $target.attr('id'), 'timeSpent:', prev_tab, timeSpent);
            if (window.ga) {
              ga('send', 'timing', '10000hours', 'Visit Duration', timeSpent, prev_tab); // https://goo.gl/OtEtPi
            }
            // reset
            prev_tab = $target.attr('id');
            startTime = new Date().getTime();
          }
          break;
        }
      }
    });// 离开页面时等待 ga 执行完毕
    var MAX_WAIT_MS = 1000;
    var _waitForFinalHit = false;
    function recordFinalHit() {
      _waitForFinalHit = true;
      var timeSpent = new Date().getTime() - startTime;
      // console.log('timeSpent:', prev_tab, timeSpent);
      ga('send', {
        'hitType': 'timing',
        'timingCategory': '10000hours',
        'timingVar': 'Visit Duration',
        'timingValue': timeSpent,
        'timingLabel': prev_tab,
        'hitCallback': function() {
          _waitForFinalHit = false;
        }
      });
    }
    function waitForFinalHit() {
      var waitStart = new Date().getTime();
      while (_waitForFinalHit
        && (new Date().getTime() - waitStart < MAX_WAIT_MS)) { }
    }
    function myOnUnload() {
      recordFinalHit();
      waitForFinalHit();
    }
    window.onunload = myOnUnload;
  })();

  // sec5
  $('#sec5').on('click', function(){
    var $sec5 = $(this), $wrap = $sec5.find('>.wrap');
    if($wrap.eq(1).is(':visible')){
      $wrap.eq(1).fadeOut(250);
      setTimeout(function(){
       $wrap.eq(0).fadeIn(250);
      }, 260);
    } else{
      $wrap.eq(0).fadeOut(250);
      setTimeout(function(){
        $wrap.eq(1).fadeIn();
      }, 260);
    }
  });
  // sec9
  var slider = $('div.slider');
  slider.on('click', '.prev', function(){
    var activeItem = slider.find('.sliderItem.active');
    var index = activeItem.index() - 3;
    if(index === -1){
      index = 3;
    }
    activeItem.removeClass('active');
    slider.find('.sliderItem:eq(' + index + ')').addClass('active');
  }).on('click', '.next', function(){
    var activeItem = slider.find('.sliderItem.active');
    var index = activeItem.index() - 1;
    if(index === 4){
      index = 0;
    }
    activeItem.removeClass('active');
    slider.find('.sliderItem:eq(' + index + ')').addClass('active');
  });

  //tab时放动画----
  (function(){
    var imgContainer = $('#imgLoaderContainer');
    var loadImg = function(item){
      var item = $(item);
      if(!item[0]) return;
      // /deals/images/10000hours/video/video4/p1.png -> /deals/images/10000hours/video/video4/p
      var basePath = item.attr('src').replace(/\/p[0-9].*$/, '/p'); // .slice(0, -5)
      // console.log(item.attr('src'), basePath);
      var max = parseInt(item.attr('data-max'));
      for(var i = 1; i <= max; i ++){
        imgContainer.append('<img src="' + basePath + i+ '.png" />');
      }
    }
    loadImg('#imgVideo1');
    loadImg('#imgVideo3');
    loadImg('#imgVideo4');

    var videoTimer = null;
    var play = function(item){
      var item = $(item);
      var basePath = item.attr('src').replace(/\/p[0-9].*$/, '/p');
      var max = parseInt(item.attr('data-max'));
      var k = 0;
      var playOne = function(){
        k ++;
        item.attr('src', basePath + k + '.png');
        if(k < max){
          videoTimer && clearTimeout(videoTimer);
          videoTimer = setTimeout(playOne, 80);
        }
        else{
          item.attr('src', basePath + '1.png');
          videoTimer && clearTimeout(videoTimer);
          videoTimer = setTimeout(function(){
            k = 0;
            playOne();
          }, 2000);
        }
      }
      playOne();
    }

    var $tab = $('#j-videoTab');
    var timer = null;
    $tab.on('click', '.tabHd>a', function(e){
      e.preventDefault();
      timer && clearTimeout(timer);
      var $btn = $(this);
      var id = $btn.attr('href');
      $btn.addClass('active').siblings('.active').removeClass('active');

      $tab.find(id).addClass('active').siblings('.active').removeClass('active');
      if(id === '#video2'){
        timer = setTimeout(function(){
          play('#imgVideo1');
        }, 1000);
      }
      else if(id === '#video3'){
        timer = setTimeout(function(){
          play('#imgVideo3');
        }, 1000);
      }
      else if(id === '#video4'){
        timer = setTimeout(function(){
          play('#imgVideo4');
        }, 1000);
      }
    })
  })();
  // mobile
  var $prodBox = $('#sec11'),
    prodPos = $prodBox.offset().top;
  var winH = $window.height();
  var $nav = $('div.m-nav').on('click', function(){
    window.scroll(0, prodPos);
  });
  // console.log(winH);
  $window.scroll(function() {
    var st = $document.scrollTop();
    if (st + winH >= prodPos) {
      $nav.hide();
    } else {
      $nav.show();
    }
  });
});
