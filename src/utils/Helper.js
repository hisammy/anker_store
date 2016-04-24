// import Helper from '../../utils/Helper';
// import { isSpider } from '../../utils/Helper';

import React from 'react';
import { config } from '../../build/config';
import Location from '../core/Location';

const Helper = {
  formatStars: (rating) => { // star to Array
    let stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? 100 : parseInt((rating - i + 1) * 100));
    }
    return stars;
  },
  displayStars: (rating) => { // star to Html
    return (
      <span className="review-stars">
        {Helper.formatStars(rating).map((item, i) => {
          return (
            <i key={i} className='iconfont'>
              <span>&#xe630;</span>
              <i className='iconfont' style={{width: item + '%'}}>&#xe631;</i>
            </i>
          )
        })}
      </span>
    );
  },
  isSpider: (ua) => { //搜索引擎判断
    let ret = false;
    if (!ua) return ret;
    ua = ua.toLowerCase();
    const crawlers = [
      'Googlebot', // google
      'bingbot', // bing
      'msnbot', // msn
      'Yahoo', // Yahoo
      'facebookexternalhit', // facebook
      'developers.google.com', // google+
      'linkedinbot', // linkedin
      'Pinterest', // pinterest
      'Twitterbot', // Twiter
      'Slurp', // Yahoo
      'Baiduspider', // baidu
      'Sosospider', // soso
      '360spider', // 360
      'yodaobot', // youdao
      'sogou', // sogou
      'ia_archiver',
      'Lycos',
      'AltaVista',
      'Teoma',
    ];
    crawlers.some((item, i) => {
      if (ua.indexOf(item.toLowerCase()) > -1) {
        ret = true;
        return true; // break
      }
    });
    return ret;
  },
  stripTags: (input, allowed) => { // 过滤HTML标签, (like PHP's strip_tags, phpjs.org)
    allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || [])
      .join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
    const tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
    const commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
    if(input) {
      return input.replace(commentsAndPhpTags, '')
        .replace(tags, function ($0, $1) {
          return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
        });
      } else {
        return ''
      }
  },
  md5: (str) => {
    const crypto = require('crypto');
    const hash = str ? crypto.createHash('md5').update(name).digest('hex') : '';
    return hash;
  },
  FBShare: (url) => {
    url = url || location.href;
    // 新的URL(从未分享过), 第一次抓不到图片几率很大.
    // 下面2种方式cloudfront.net的图, 首次FB都会抓不到(curl -i -X HEAD "url",  X-Cache: Miss from cloudfront)
    /*url = encodeURIComponent(url);
     const link = `https://www.facebook.com/dialog/share?app_id=${config.FB_APP_ID}&display=popup&href=${url}&redirect_uri=${url}`
     console.log(link);*/
    /*FB.getLoginStatus(function(response) {
     console.log(response);
     }, true);*/
    FB.ui({
      method: 'share',
      href: location.href,
    }, function (response) {
    });
  },
  // total:记录总数, currentPage:当前页面, pageSize:每页内容数
  // components:  changePageNav = async(id, page, event) => {
  // render: {pageNav(this.state.review.count, this.state.review.current_page, 20, this.changePageNav.bind(this, this.props.data.id))}
  pageNav: (total, currentPage, pageSize, callback) => { // 分页
    if (!total || total < 1) { return; }
    const prevWord = '<';
    const nextWord = '>';
    const splitPage = 3;
    const splitWord = '...';
    // totalPage: 页面总数
    const totalPage = Math.ceil(total / pageSize);
    const from = Math.max(1, currentPage - splitPage);
    const to = Math.min(totalPage, currentPage + splitPage);
    let ranges = []; // 中间页
    for (var i = from; i <= to; i++) {
      ranges.push(i);
    }
    return (
      <div className="page-nav">
        <span className={"prev " + (currentPage > 1 ? 'show' : 'none')} dangerouslySetInnerHTML={{__html: prevWord}} onClick={currentPage > 1 ? callback.bind(this, currentPage - 1) : ''}/>
        {from > 1 ?
          <i>
            <span className={1 == currentPage ? 'current' : ''} onClick={1 != currentPage && callback.bind(this, 1)}>1</span>
            {from > 2 ?
              <span className="split" dangerouslySetInnerHTML={{__html: splitWord}}/>
            : null}
          </i>
        : null}
        {ranges.map((item, i) => {
          return (
            <span key={i} className={item == currentPage ? 'current' : ''} onClick={item != currentPage && callback.bind(this, item)}>
              {item}
            </span>
          );
        })}
        {to < totalPage ?
          <i>
          {to < totalPage - 1 ?
            <span className="split" dangerouslySetInnerHTML={{__html: splitWord}}/>
          : null}
          <span onClick={callback.bind(this, totalPage)}>{totalPage}</span>
          </i>
        : null}
        <span className={"next " + (currentPage < totalPage ? 'show' : 'none')} dangerouslySetInnerHTML={{__html: nextWord}} onClick={currentPage < totalPage ? callback.bind(this, currentPage + 1) : ''}/>
      </div>
    );
  },
  // Lightweight util.format() for the browser(github.com/tmpfs/format-util)
  format: (fmt, ...args) => {
    const re = /(%?)(%([jds]))/g;
    fmt = fmt || '';
    if (Array.isArray(args[0])) {
      args = args[0]
    }
    // console.log(11, fmt, 22, args);
    if(args.length) {
      fmt = fmt.replace(re, function(match, escaped, ptn, flag) {
        var arg = args.shift() || '';
        switch(flag) {
          case 's':
            arg = '' + arg;
            break;
          case 'd':
            arg = Number(arg);
            break;
          case 'j':
            arg = JSON.stringify(arg);
            break;
        }
        // console.log(escaped, 333, arg);
        if(!escaped) {
          return arg;
        }
        args.unshift(arg);
        return match;
      });
    }
    // arguments remain after formatting
    if(args.length) {
      fmt += ' ' + args.join(' ');
    }
    // update escaped %% values
    fmt = fmt.replace(/%{2,2}/g, '%');
    return '' + fmt;
  },
  // 自动处理富文本(语言包)里的链接跳转
  // <Parent onClick={ autoLink }
  autoLink: (event) => {
    const elem = event.target;
    // console.log(elem);
    if (elem.tagName.toLowerCase() === 'a') { // bind click
      event.preventDefault();
      Location.push(elem.pathname + elem.search);
    }
  },
};

export default Helper;
