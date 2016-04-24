/**
 * Created by leon on 2016-01-18
 */

import React, { PropTypes, Component } from 'react';
import styles from './Redirect.scss';
import withViewport from '../../decorators/withViewport';
import withStyles from '../../decorators/withStyles';
import AppActions from '../../core/AppActions';
// import Location from '../../core/Location';
import Http from '../../core/HttpClient';
// import Link from '../../utils/Link';
import Track from '../../utils/Track';

// @withViewport
@withStyles(styles)
class Redirect extends Component {

  static propTypes = {
  };
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  componentWillMount() {
    // console.log(this.props);
    const props = this.props;
    const url = props.query.r;
    this.setState({
      type: props.params.type, //fb/tw/dsp
      url: url,
      formData: {},
    });
  }
  componentDidMount() {
    // console.log(this.state);
    this.fireTracking();
    const url = this.state.url;
    const domain = this.getDomain(url);
    const isWhiteList = this.matchWhiteList(domain);
    // return console.log(domain, isWhiteList);
    if (url && isWhiteList) {
      window.onload = function(){
        setTimeout(`window.location.href="${url}";`, 1);
      }
    }
  }
  matchWhiteList(domain) {
    const whiteList = [ // 顶级域名即可
      'anker.com',
      'ianker.com',
      'amazon.com',
      'amazon.com.au',
      'amazon.com.br',
      'amazon.com.mx',
      'amazon.co.jp',
      'amazon.co.uk',
      'amazon.ca',
      'amazon.cn',
      'amazon.fr',
      'amazon.de',
      'amazon.in',
      'amazon.it',
      'amazon.nl',
      'amazon.es',
      // 'facebook.com',
      // 'twitter.com',
    ];
    let ret = false;
    if (!domain) return false;
    for (var i = whiteList.length - 1; i >= 0; i--) {
      // if (-1 !== domain.indexOf(whiteList[i])) {
      let reg = new RegExp(whiteList[i] + '$')
      if (domain.match(reg)) {
        ret = true;
        break;
      }
    }
    return ret;
  }
  getDomain(url) {
    if (!url) return '';
    var parser;
    if(typeof window.URL == 'function') {
      parser = new URL(url);
    } else {
      parser = document.createElement('a');
      parser.href = url;
    }
    return parser.hostname;// hostname
  }
  selectText(event) {
    const elem = event.target;
    // return console.log(elem);
    if (document.selection) {
      var range = document.body.createTextRange();
      range.moveToElementText(elem);
      range.select();
    } else if (window.getSelection) {
      var range = document.createRange();
      range.selectNode(elem);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
    }
  }
  fireTracking() {
  }
  trackingCode() {
    let type = this.state.type;
    if (!this.state.url) return;
    // doubleclick: goo.gl/qWVoa (all type)
    let html = `<script>
      var _gaq = _gaq || [];
      _gaq.push(['_setAccount', 'UA-23867950-1']);
      _gaq.push(['_setDomainName', 'anker.com']);
      _gaq.push(['_trackPageview']);
      (function() {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
       ga.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'stats.g.doubleclick.net/dc.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
      })();
      </script>`;
    // facebook (tw1,fb2,dsp: 848289711892513, fb1: 1531878120384598)
    const fbPixelId = type == 'fb1' ? '1531878120384598' : '848289711892513';
    /*<script>(function() {
        var _fbq = window._fbq || (window._fbq = []);
        if (!_fbq.loaded) {
          var fbds = document.createElement('script');
          fbds.async = true;
          fbds.src = '//connect.facebook.net/en_US/fbds.js';
          var s = document.getElementsByTagName('script')[0];
          s.parentNode.insertBefore(fbds, s);
          _fbq.loaded = true;
        }
        _fbq.push(['addPixelId', '${fbPixelId}']);
      })();
      window._fbq = window._fbq || [];
      window._fbq.push(['track', 'PixelInitialized', {}]);
      </script>*/
    html = html + `<script>
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','//connect.facebook.net/en_US/fbevents.js');
    // Insert Your Custom Audience Pixel ID below. 
    fbq('init', '${fbPixelId}');
    fbq('track', 'PageView');
    </script>
    <!-- Insert Your Custom Audience Pixel ID below. --> 
    <noscript><img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=${fbPixelId}&ev=PageView&noscript=1"
    /></noscript>`;
    if (-1 != ['fb1', 'fb2'].indexOf(type)) {
      // criteo (fb1, fb2)
      html = html + `<script src="//static.criteo.net/js/ld/ld.js" async="true"></script>
        <script>
        window.criteo_q = window.criteo_q || [];
        window.criteo_q.push(
                { event: "setAccount", account: 13882 },
                { event: "setSiteType", type: "d" },
                { event: "viewHome" }
        );
        </script>`;
    } else if (type == 'tw1') { // Twitter
      html = html + `<script src="//platform.twitter.com/oct.js"></script>
        <script>
        twttr.conversion.trackPid('l5rg6', { tw_sale_amount: 0, tw_order_quantity: 0 });</script>
        <noscript>
        <img height="1" width="1" style="display:none;" alt="" src="https://analytics.twitter.com/i/adsct?txn_id=l5rg6&p_id=Twitter&tw_sale_amount=0&tw_order_quantity=0" />
        <img height="1" width="1" style="display:none;" alt="" src="//t.co/i/adsct?txn_id=l5rg6&p_id=Twitter&tw_sale_amount=0&tw_order_quantity=0" /></noscript>`;
    } else if (type == 'dsp') { // dsp
      html = html + `<script>
        var _py = _py || [];
        _py.push(['a', 'm0..gutBoYBrLQkyAVm1KlZj50']);
        _py.push(['domain','stats.ipinyou.com']);
        _py.push(['e','']);
        -function(d) {
          var s = d.createElement('script'),
          e = d.body.getElementsByTagName('script')[0]; e.parentNode.insertBefore(s, e),
          f = 'https:' == location.protocol;
          s.src = (f ? 'https' : 'http') + '://'+(f?'fm.ipinyou.com':'fm.p0y.cn')+'/j/adv.js';
        }(document);
        </script>
        <noscript><img src="//stats.ipinyou.com/adv.gif?a=m0..gutBoYBrLQkyAVm1KlZj50&e=" style="display:none;"/></noscript>`;
    }
    return ({__html: html});
  }
  changeValue(event) {
    const elem = event.target;
    let data = this.state.formData;
    // console.log(elem.name, elem.value);
    data[elem.name] = elem.value;
    this.state.redirectUrl = '';
    this.setState(this.state);
  }
  creatSubmit(event) {
    event.preventDefault();
    const data = this.state.formData;
    const baseUrl = this.props.origin;
    // console.log(data, baseUrl);
    if (!data.type) {
      return alert('Type is required');
    } else if (!data.url) {
      return alert('Url is required');
    }
    const url = `${baseUrl}/redirect/${data.type}?r=${encodeURIComponent(data.url)}`;
    this.setState({
      redirectUrl: url,
    });
  }

  render() {
    let title = 'Redirect';
    this.context.onSetTitle(title);
    const type = this.state.type;
    const url = this.state.url;
    return (
      <div className="Redirect module-container">
        {!url ?
          <div className="box">
            <h1>URL Builder</h1>
            <form action="" className="form" onSubmit={this.creatSubmit.bind(this)}>
              <span className={"input-normal type " + (this.state.formData.type ? 'fill' : '')}>
                <span className="placeholder">Type *</span>
                <select name="type" onChange={this.changeValue.bind(this)} value={this.state.formData.type}>
                  <option value=""></option>
                  <option value="tw1">Twitter</option>
                  <option value="fb1">Facebook</option>
                  <option value="fb2">Facebook2</option>
                  <option value="dsp">dsp</option>
                </select>
              </span>
              <span className={"input-normal url " + (this.state.formData.url ? 'fill' : '')}>
                <span className="placeholder">URL *</span>
                <input type="url" name="url" onChange={this.changeValue.bind(this)} value={this.state.formData.url}/>
              </span>
              <button type="submit" className="button-normal submit">Submit</button>
            </form>
            {this.state.redirectUrl &&
              <code onClick={this.selectText.bind(this)}>
                {this.state.redirectUrl}
              </code>
            }
          </div>
        :
        <div className="tip">
          <p>Loading...</p>
          <div dangerouslySetInnerHTML={this.trackingCode()}/>
        </div>
        }
      </div>
    );
  }
}

export default Redirect;
