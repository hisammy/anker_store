/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { PropTypes, Component } from 'react';
import styles from './App.scss';
import withContext from '../../decorators/withContext';
import withStyles from '../../decorators/withStyles';
import Location from '../../core/Location';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import AppActions from '../../core/AppActions';
import { config } from '../../../build/config';
import Http from '../../core/HttpClient';
import Cookie from '../../utils/Cookie';
import Detector from '../../utils/Detector';
import { steelHouseTracking } from '../../utils/Track';

@withContext
@withStyles(styles)
class App extends Component {

  static propTypes = {
    children: PropTypes.element.isRequired,
    error: PropTypes.object
  };
  componentWillMount() {
    this.setState({
      'nick_name' : ''
    })
  };
  componentWillUpdate() {
    // ga('create', config.GOOGLE_TRACKING_ID, 'auto'); // !执行这里时, 模块的js执行完了
  };
  componentDidUpdate() {
    Detector();
    if (this.props.path == '/' && !this.state.hasCountry) { // 选择国家后到首页
      this.showPopup();
      this.setState({hasCountry: Cookie.load('country')});
    }
    // setTimeout(function () {
      let url = location.pathname + location.search;
      // ga('set', 'page', url);ga('send', 'pageview');
      // console.log('Update', url);
      ga('send', 'pageview', url); // 要放到最后执行, 顺序: 1: ga('create', xxx); 2: ga('require', 'ec'); 3.xxx; 4: ga('send', 'pageview')
    // }, 10);
    steelHouseTracking();
  };
  componentWillReceiveProps(nextProps) {
    this.state.nick_name = AppActions.getUser().nick_name;
    this.setState(this.state);
  };
  componentDidMount() {
    this.setState({hasCountry: Cookie.load('country')});
    this.showPopup();
    AppActions.loading(false);
    const children = this.props.children;
    const disableFBPixel = children.props && children.props.disable_fb_pixel;
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
    if (!disableFBPixel) {
      fbq('init', config.FB_PIXEL_ID);
      fbq('track', 'PageView');
    }

    twttr.conversion.trackPid('l5rg6', { tw_sale_amount: 0, tw_order_quantity: 0 });
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

    this.state.nick_name = AppActions.getUser().nick_name;
    this.setState(this.state);
    this.getLoginImage();

    // let url = location.pathname + location.search;
    // ga('send', 'pageview', url);
  }

  showPopup() {
    const popupsignup = document.getElementById('popupsignup');
    // console.log(popupsignup, AppActions.getUser().token);
    if (popupsignup && !AppActions.getUser().token) {
      // console.log('addClass');
      popupsignup.classList.add('visible');
    }
  }

  getLoginImage = async () => {
    const json = await Http.post('get', '/api/content?path=/api/home_backgrounds/obtain_background');
    localStorage.setItem("login_background",json.login_background);
    // localStorage.setItem("register_background",json.register_background);
    localStorage.setItem("headerTips",json.home_tips);
  }
  render() {
    const children = this.props.children;
    return (children.props && children.props.single_page || this.props.error) ?
      children
      :
      <div id="container">
        <Header nick_name={this.state.nick_name} path={this.props.path} cookie={this.props.cookie} params={this.props.params} query={this.props.query} i18n={children.props.i18n} />
        {this.props.children}
        <Footer path={this.props.path} cookie={this.props.cookie} params={this.props.params} query={this.props.query} i18n={children.props.i18n} />
      </div>
  }

}

export default App;
