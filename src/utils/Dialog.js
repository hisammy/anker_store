/**
 * Created by shady on 15/7/7.
 */
export default {
  confirm(txt, callback, cancelBtn, successBtn) {
    let article = document.createElement('article'),
      p = this;
    article.className = 'dialogConfirm';
    article.innerHTML = txt.title ? '<header class="dialogHeader"><h2>' + txt.title + '</h2></header>' : '';
    article.innerHTML += '<section><div class="dialogContenter">' + txt.content + '</div></section>';
    article.innerHTML += '<footer class="dialogFooter">' + (cancelBtn ? ('<button type="button" class="button normalBtn" id="aCancelBtn">' + cancelBtn + '</button>') : '') + '<button type="button" class="button deepButton" id="aConfirmBtn">' + (!successBtn ? 'OK' : successBtn) + '</button></footer>'
    document.body.appendChild(article);
    document.getElementById('aConfirmBtn').onclick = function() {
      callback && callback();
      p.clearMask();
      document.body.removeChild(article);
    };
    var cancelBtn = document.getElementById('aCancelBtn');
    cancelBtn ? cancelBtn.onclick = function() {
      p.clearMask();
      document.body.removeChild(article);
    } : '';
    this.localMask();
  },
  showTips(txt) {
    let article = document.createElement('article'),
      p = this;
    article.className = 'dialogConfirm';
    article.innerHTML = txt.title ? '<header class="dialogHeader"><h2>' + txt.title + '</h2></header>' : '';
    article.innerHTML += '<section><div class="dialogContenter">' + txt.content + '</div></section>';
    document.body.appendChild(article);
    this.localMask();
  },
  localMask() {
    let article = document.createElement('article');
    article.className = 'localMask';
    document.body.appendChild(article);
  },
  clearMask() {
    let mask = document.getElementsByClassName('localMask')[0];
    document.body.removeChild(mask);
  },
  showWarning(content) {
    let div = document.createElement('div');
    div.className = 'commonTip';
    if (typeof(content) === 'string') {
      div.innerHTML = '<span>' + content + '</span>';
    } else if (content.errors) {
      for (var i in content.errors) {
        if (i === 'base') {
          content.errors.base.map((item) => {
            div.innerHTML += '<span>' + item + '</span>';
          });
        } else {
          div.innerHTML += '<span>' + i + ' ' + content.errors[i] + '</span>';
        }
      }
    } else if (content.error || content.exception) {
      div.innerHTML = '<span>' + (content.error || content.exception) + '</span>';
    } else {
      div.innerHTML = '<span>Error!</span>';
    }
    document.body.appendChild(div);
    setTimeout(function() {
      div.style.maxHeight = '100%'
    }, 100);
    this._remove(div, 4000);
  },
  showSuccess(content) {
    let article = document.createElement('article');
    article.className = 'tips';
    article.innerHTML = '<div class="ta_c"><i class="iconfont">&#xe63b;</i><p class="mt_5">' + content + '</p></div>';
    document.body.appendChild(article);
    this._remove(article, 2000);
  },
  showError(content) {
    let article = document.createElement('article');
    article.className = 'tips';
    article.innerHTML = '<div class="ta_c"><i class="iconfont">&#xe63e;</i><p class="mt_5">' + content + '</p></div>';
    document.body.appendChild(article);
    this._remove(article, 3000);
  },
  _remove(dom, timer) {
    var t = setTimeout(function() {
      document.body.removeChild(dom);
    }, timer);

    dom.onclick = function() {
      document.body.removeChild(dom);
      clearTimeout(t);
    };
  }
}