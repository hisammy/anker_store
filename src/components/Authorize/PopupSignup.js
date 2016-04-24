/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { PropTypes, Component } from 'react';
import withStyles from '../../decorators/withStyles';
import styles from './PopupSignup.scss';
import Cookie from '../../utils/Cookie';
import AppActions from '../../core/AppActions';
import Location from '../../core/Location';
import Http from '../../core/HttpClient';
import classnames from 'classnames';
import Link from '../../utils/Link';
import Dialog from '../Dialog';
import { config } from '../../../build/config';
import Verify from '../../utils/Verify';

@withStyles(styles)
class Register extends Component {

  static contextTypes = {
  };

  componentWillMount() {
    this.state = {
      'pop_type': '', // center,bottom-right,,bottom-left
      // 'nick_name': '',
      'email': '',
      'password': '',
      // 'confirm': '',
      'error': '',
      // 'code': '',
      'is_subscribe': true,
      'country':[],
      'dialogOption': {},
      'popOptions': {},
    };
  }
  componentWillReceiveProps(next) {
  }
  componentDidMount() {
    var self = this;
    if (Cookie.load('popup_subscribe')) {
      this.setState({
        hide: true,
      });
    } else {
      setTimeout(function () {
        self.getDatas();
      }, 0);
    }
    this.setState({
      'dialogOption':{close:this.closeDialog.bind(this)},
      // 'isPC': Verify.isPC(),
    });
    // this.getCode();
    const body = document.body;
    body.classList.add('disable-scroll');
    // if (this.refs.popupsignup && !AppActions.getUser().token) {
    //   this.refs.popupsignup.classList.add('show');
    // }
  }

  valueChange(event) {
    this.state[event.target.name] = event.target.value;
    this.setState(this.state);
  }
  focusInput(event) {
    const cnt = this.refs.cnt;
    const reg = this.refs.reg;
    if (!cnt) return;
    // console.log(cnt, box);
    // cnt.scrollTop = reg.clientHeight;
    setTimeout(function () {
      cnt.scrollTop = reg.clientHeight;
    }, 800);
  }

  registerSubmit = async (e) => {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['popupsignup'] || {};
    e.preventDefault();
    if (this.state.email === '') {
      this.state.dialogOption.content = common.fill_email;
      this.setState(this.state);
      return;
    }
    // if (this.state.nick_name === '') {
    //   this.state.dialogOption.content = 'Please enter your user name.';
    //   this.setState(this.state);
    //   return;
    // }
    if (this.state.password === '') {
      this.state.dialogOption.content = common.fill_password;
      this.setState(this.state);
      return;
    }
    // if (this.state.confirm === '') {
    //   this.state.dialogOption.content = 'Please confirm your password.';
    //   this.setState(this.state);
    //   return;
    // }
    // if (this.state.password !== this.state.confirm) {
    //   this.state.dialogOption.content = 'Passwords do not match.';
    //   this.setState(this.state);
    //   return;
    // }
    if (!Verify.isEmail(this.state.email)) {
      this.state.dialogOption.content = common.fill_valid_email;
      this.setState(this.state);
      return;
    }
    if (this.state.password.length < 8 || this.state.password.length > 20) {
      this.state.dialogOption.content = compo.password_verify_error;
      this.setState(this.state);
      return;
    }
    // if(!this.state.value){
    //   this.state.dialogOption.content = 'Please enter your captcha.';
    //   this.setState(this.state);
    //   return;
    // }
    let body = {
      'register_source': encodeURIComponent(location.href),
      'email': this.state.email,
      'password': this.state.password,
      'is_subscribe': this.state.is_subscribe,
      // 'code':this.state.code,
      // 'value':this.state.value,
      'country_code':this.state.country_code,
      'invitation_code': AppActions.getUrlParam().invite
    };
    if (!AppActions.getUser().token) {
      body['order_id'] = AppActions.getUser().order_id
    } else {
      AppActions.signOut();
    }
    const json = await Http.post('post', '/api/content?path=/api/registrations', body);
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

      this.state.dialogOption.content = compo.popupsignup_registration_success;
      this.state.dialogOption.dialogType = 'success';
      this.setState(this.state);
      setTimeout(()=>{
        Location.push( "/activation?email=" + this.state.email);
      },2000)

    }
    else {
      this.state.dialogOption.content = json.error;
      this.setState(this.state);
      // this.getCode();
    }
  };

  errorClose() {
    this.setState({
      error: ''
    });
  }

  subscribe() {
    this.setState({
      'is_subscribe': this.state.is_subscribe ? false : true
    });
  }
  // getCode = async () =>{
  //   const json = await Http.post('get', '/api/content?path=/api/users/obtain_captcha');
  //   if (json.captcha_code) {
  //     this.state.imgUrl = json.captcha_url;
  //     this.state.code = json.captcha_code;
  //     this.setState(this.state);
  //   }
  // }
  getDatas = async () =>{
    const path = location.pathname.slice(1);
    let type = 'others';
    if (path == '') {
      type = 'home';
    } else if (path.indexOf('products') == 0) { // list && products/sku
      type = 'products';
    } else if (path.indexOf('poweruser') == 0) {
      type = 'power user';
    } else if (path.indexOf('support') == 0) {
      type = 'support';
    } else if (path.indexOf('deals') == 0) {
      type = 'campaign';
    }
    const popupsignup = this.refs.popupsignup;
    // console.log('getDatas');
    if (!popupsignup || !popupsignup.classList.contains('visible')) {
      return;
    }
    AppActions.loading(true);
    const json = await Http.post('get', `/api/content?path=/api/toast_configurations/obtain_toast_configuration?type=${type}`);
    AppActions.loading(false);
    // console.log(json);
    if (json && json.position) {
      popupsignup.classList.add('show');
      this.setState({
        pop_type: json.position,
        popOptions: json || {},
      });
      ga('send', 'event', 'Regsiter', 'Show', 'PW');
    } else {
      this.setState({
        hide: true,
      });
    }
  }
  closeDialog(event) {
    this.setState({
      dialogOption: {content:''},
    });
  }
  closePopup(event){
    const body = document.body;
    body.classList.remove('disable-scroll');
    this.setState({
      hide: true,
    });
    Cookie.save('popup_subscribe', 1, {path: '/', 'expires': new Date(Date.now() + (1000 * 60 * 60 * 24 * 7))});
    ga('send', 'event', 'Regsiter', 'Close', 'PW');
  }
  // register
  googleLoginDig() {
    var webconfig = {
      'client_id': config.GOOGLE_APP_ID,
      'scope':'https://www.googleapis.com/auth/userinfo.email',
      'collection': 'visible'
    }
    gapi.auth.authorize(webconfig, (authResult) => {
      gapi.client.load('plus', 'v1', () => {
        gapi.client.plus.people.get({userId: 'me'}).execute((resp)=>{
            var email = resp.emails ? resp.emails[0].value : '';
            var user = {
            "login": email,
            "uid": resp.id,
            "third_party": "google",
            "nick_name": resp.displayName || email.split('@')[0]
          };
          this.third_party_login(user, 'gg');
        });
      });
    });
  };
  facebookLoginDig() {
    if (FB.getUserID() != "") {
      FB.api('/me', function () {
        FB.logout();
      })
    }
    FB.login((response) => {
      if (response.status === "connected") {
        FB.api('/me?fields=name,email', {locale: 'en_US', fields: 'name, email'}, async (response) => {
          if (!response.error) {
            var user = {
              "login": response.email || "",
              "uid": response.id,
              "third_party": "facebook",
              "nick_name": response.name
            };
            this.third_party_login(user, 'fb');
          }
        });
      }
    }, {scope: 'public_profile,email,user_birthday'});
  };
  third_party_login = async (user, type) => {
    var body = {
      "register_source": encodeURIComponent(location.href),
      "user": user
    }, order_id = AppActions.getUser().order_id;
    if (!AppActions.getUser().token && order_id != "") {
      body.order_id = order_id;
    }
    const json = await Http.post('POST', '/api/content?path=/api/sessions/third_party_login', body);
    if (json.token) {
      const action = 'fb' == type? 'FaceBook' : 'Google';
      // console.log(action);
      ga('send', 'event', 'Regsiter', action, 'PW');

      AppActions.signOut();
      json.loginType = 'third_party_login';
      AppActions.signIn(json);
      this.loginBack(AppActions.getUrlParam().back);
      AppActions.setCart(json.item_count);
    } else {
      this.setState({
        dialogOption:{
          content: json,
          dialogType : 'tips'
        }
      });
    }
  };

  loginBack(url) {
    // location.href = '/deals/anker_qc?utm_source=OST&utm_medium=Banner&utm_content=POP_Register&utm_campaign=QC';
    this.closePopup();
    // Location.push( '/');
    Location.push(location.pathname + location.search);
  };
  returnLogin() {
    Location.push('/login?back='+ location.pathname.slice(1) + location.search);
  }

  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['popupsignup'] || {};
    if (this.state.hide || AppActions.getUser().token) { // 已经登录
      return (<div className="Empty"></div>);
    }
    return (
      <div className='PopupSignup' ref="popupsignup" id="popupsignup">
        <div className={`${this.state.pop_type}`}>
          <div className="PopupSignup-mask"></div>
          <Dialog {... this.state.dialogOption} />
          <div className="PopupSignup-container">
            {this.state.popOptions.show_close == false ? '' :
              <i className="close iconfont" onClick={this.closePopup.bind(this)}>&#xe642;</i>
            }
            <div className="cnt" ref="cnt">
            <div className='Register' ref="reg">
              {this.state.pop_type.indexOf('bottom') >= 0 ?
                !this.state.popOptions.description ? '' :
                  <div className="info">
                    <div className="ico">
                      <i className="iconfont">&#xe674;</i>
                    </div>
                    <div className="text">
                      <h4>{this.state.popOptions.title}</h4>
                      <div dangerouslySetInnerHTML={{__html: this.state.popOptions.description}}/>
                    </div>
                  </div>
                :
                !this.state.popOptions.pictrue ? '' :
                  <div className="cel img">
                    <img src={this.state.popOptions.pictrue} />
                  </div>
              }
              <div className="cel form">
                {/*<div className="header">
                  <h5>Join anker.com, Enjoy $5 OFF</h5>
                  <p>For a limited time only, enjoy $5 off your first purchase when you join anker.com.</p>
                  <p>Available to all new users who register before 3/5/2016. Discount not valid for shipping, Amazon orders or non-US orders.</p>
                </div>*/}
                <form onSubmit={this.registerSubmit.bind(this)}>
                  <ul className="input">
                    <li>
                      <div className={"input-normal " + (this.state.email ? 'fill' : '')}>
                         <span className="placeholder">{compo.popupsignup_placeholder_email}<i className="required-flag">*</i></span>
                         <input type='email' name='email' value={this.state.email} onChange={this.valueChange.bind(this)} onFocus={this.focusInput.bind(this)} />
                      </div>
                    </li>
                    {/*<li>
                      <div className={"input-normal " + (this.state.nick_name ? 'fill' : '')}>
                         <span className="placeholder">Username<i className="required-flag">*</i></span>
                         <input type='text' maxLength="200" name='nick_name' value={this.state.nick_name} onChange={this.valueChange.bind(this)}/>
                      </div>
                    </li>*/}
                    <li>
                      <div className={"input-normal " + (this.state.password ? 'fill' : '')}>
                         <span className="placeholder">{compo.popupsignup_placeholder_password}<i className="required-flag">*</i></span>
                         <input type='password' name="password" maxLength="20"
                               value={this.state.password} onChange={this.valueChange.bind(this)}/>
                      </div>
                    </li>
                    {/*<li>
                      <div className={"input-normal " + (this.state.confirm ? 'fill' : '')}>
                         <span className="placeholder">Confirm password<i className="required-flag">*</i></span>
                         <input type='password' name="confirm" maxLength="20"
                               value={this.state.confirm} onChange={this.valueChange.bind(this)}/>
                      </div>
                    </li>*/}
                    {/*<li>
                      <div className={"input-normal codeDiv " + (this.state.value ? 'fill' : '')}>
                         <span className="placeholder">Verification code — humans only!<i className="required-flag">*</i></span>
                         <input type='input' className="code" name="value" maxLength="20"
                               value={this.state.value} onChange={this.valueChange.bind(this)}/>
                      </div>
                       <img className="codeImg" src={this.state.imgUrl} onClick={this.getCode.bind(this)} />
                    </li>*/}
                    {/*<<li className='auth-act'>
                    <span onClick={this.subscribe.bind(this)}>
                      {this.state.is_subscribe ?
                        <i className='iconfont checked'>&#xe633;</i> :
                        <i className='iconfont'>&#xe634;</i>
                      }
                      Subscribe to the Anker Newsletter
                    </span>
                    </li>*/}
                    <li>
                      <button className='submit' type='submit'>{this.state.popOptions.btn1_title || compo.popupsignup_default_submit_btn}</button>
                    </li>
                  </ul>
                </form>
                <p className="connect tac">{compo.popupsignup_or_connect_with}</p>
                <div className="footer">
                  <button onClick={this.facebookLoginDig.bind(this)} className="fb">
                    <i className="iconfont">&#xe657;</i>
                  </button>
                  <button onClick={this.googleLoginDig.bind(this)} className="gg">
                    <i className="iconfont google">&#xe606;</i>
                  </button>
                </div>
                <p className="sign">
                  {compo.popupsignup_already_member_tip} <a href="javascript:;" onClick={this.returnLogin.bind(this)}>{compo.popupsignup_sign_in}</a>
                </p>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default Register;
