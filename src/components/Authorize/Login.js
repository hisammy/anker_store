/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { PropTypes, Component } from 'react';
import withStyles from '../../decorators/withStyles';
import styles from './Authorize.scss';
import AppActions from '../../core/AppActions';
import Location from '../../core/Location';
import Http from '../../core/HttpClient';
import classnames from 'classnames';
import Link from '../../utils/Link';
import Dialog from '../Dialog';
import { config } from '../../../build/config';
import Verify from '../../utils/Verify';

@withStyles(styles)

class Login extends Component {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
    onSetMeta: PropTypes.func.isRequired
  };

  componentWillMount() {
    this.state = {
      'email': '',
      'password': '',
      'dialogOption':{},
      'loginBackground':!global.server ? localStorage.getItem('login_background') : ''
    };
  }
  componentDidMount() {
    if (AppActions.getUser().token) {
      //let url = AppActions.getUrlParam().back ? '/' + AppActions.getUrlParam().back : '/member';
      //Location.push( url);
    }
    if (localStorage.getItem('remember') && localStorage.getItem('remember_email')) {
      this.state.email = localStorage.getItem('remember_email');
      this.state.remember = 1;
    }
    if (localStorage.getItem('remember') && localStorage.getItem('remember_email')) {
      this.state.email = localStorage.getItem('remember_email');
      this.state.remember = 1;
    }
    this.state.loginBackground = localStorage.getItem('login_background');
    if (typeof(FB) === "object" && FB.getUserID() != "") {
      FB.api('/me', function () {
        FB.logout();
      })
    }
    this.state.isPC = Verify.isPC();
    this.state.dialogOption.close = this.closeDialog.bind(this);
    this.setState(this.state);
    // this.showDig({email: 'test@test.com',});
  }

  // common
  valueChange(event) {
    this.state[event.target.name] = event.target.value;
    this.setState(this.state);
  };
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
          this.third_party_login(user);
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
            this.third_party_login(user);
          }
        });
      }
    }, {scope: 'public_profile,email,user_birthday'});
  };
  third_party_login = async (user) => {
    var body = {
        "register_source": encodeURIComponent(location.href),
        "user": user
      },
      order_id = AppActions.getUser().order_id;
    if (!AppActions.getUser().token && order_id != "") {
      body.order_id = order_id;
    }
    const json = await Http.post('POST', '/api/content?path=/api/sessions/third_party_login', body);
    if (json.token) {
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

  // Login
  remember() {
    localStorage.setItem('remember', !this.state.remember ? 1 : 0);
    this.setState({
      'remember': !this.state.remember ? 1 : 0
    });
  }
  loginSubmit = async (e) => {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['login'];
    e.preventDefault();
    if (this.state.email === '') {
      this.state.dialogOption.content = common.fill_email;
      this.state.dialogType = 'tips';
      this.setState(this.state);
      return;
    }
    if (this.state.password === '') {
      this.state.dialogOption.content = common.fill_password;
      this.state.dialogType = 'tips';
      this.setState(this.state);
      return;
    }
    let body = {
      'email': this.state.email,
      'password': this.state.password
    };
    if (!AppActions.getUser().token && AppActions.getUser().order_id) {
      body['order_id'] = AppActions.getUser().order_id;
    }
    const json = await Http.post('POST', '/api/content?path=/api/sessions', body);
    if (json.token) {
      AppActions.signOut();
      AppActions.signIn(json);
      this.state.remember ? localStorage.setItem('remember_email', body.email) : localStorage.setItem('remember_email', '');
      this.loginBack(AppActions.getUrlParam().back);
      AppActions.setCart(json.item_count);
    } else if (json.merge_confirm) {
      this.showDig(json);
    }else{
      this.state.dialogOption.content = json;
      this.state.dialogOption.dialogType = 'tips';
      this.setState(this.state);
      if(json.status === 405){
        setTimeout(() =>{
            Location.push( '/activation?email=' + this.state.email);
        },2000)
      }
    }
  };
  loginBack(url) {
    url = url ? ('/' + url) : '/profile';
    url = /(orders|place)/g.test(url) ? '/orders' : url;
    if(url.indexOf('deals/') > -1) {
      location.href = url;
    } else {
      Location.push( url);
    }
  };
  subscribe() {
    this.setState({
      'is_subscribe': this.state.is_subscribe ? false : true
    });
  }
  goRegister() {
    Location.push("/register");
  }
  closeDialog(event) {
    this.state.dialogOption.content = '';
    this.setState(this.state);
  }
  showDig(users){
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['login'];
    //this.state.oldPassword = '';
    let temp = <div className="autoWidth">
      <div dangerouslySetInnerHTML={{__html: compo.login_merge_dialog_desc}} />
      <p style={{"margin":"1.5rem 0 0.5rem 0"}}>
        {i18n.format(compo.login_email_info, users.email)}
      </p>
      <p id="errorTips" className="errorTips"></p>
      <div className={"input-normal oldPassword " + (this.state.oldPassword ? 'fill' : '')}>
        <input placeholder={compo.login_placeholder_password} autoComplete="off"  maxLength="200" id="oldPassword" type="password" />
      </div>
      <div className="diagDiv" style={{"display":"inline-block"}}>
      <a onClick={this.confirm_merge.bind(this)} style={{"padding":".8rem"}} className="button confirmBtn">{common.confirm}</a>
      <a onClick={this.closeDialog.bind(this)} style={{"padding":".8rem","margin-left":".5rem"}} className="button cancelBtn">{common.cancel}</a>
      </div>
      </div>;
    this.state.dialogOption.content = temp;
    this.state.dialogOption.title = compo.login_merge_dialog_title;
    this.state.dialogOption.dialogType = 'auto';
    this.setState(this.state);
  }
  confirm_merge = async (e) =>{
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    // const compo = i18n['login'];
    var body = {
      "email": this.state.email,
      "password": document.getElementById("oldPassword").value
    };
    if(!body.password){
      document.getElementById("errorTips").innerHTML = common.fill_password;
      return;
    }
    const json = await Http.post('POST', '/api/content?path=/api/sessions/confirm_merge', body);
    if (json.token) {
      AppActions.signOut();
      AppActions.signIn(json);
      this.state.remember ? localStorage.setItem('remember_email', body.email) : localStorage.setItem('remember_email', '');
      let url = AppActions.getUrlParam().back ? '/' + AppActions.getUrlParam().back : '/profile';
      AppActions.setCart(json.item_count);
      this.loginBack(AppActions.getUrlParam().back);
    } else {
      document.getElementById("errorTips").innerHTML=json.error;
      /*
      this.setState({
        oldPassword:'',
        dialogOption :{
        content: json,
        dialogType: 'tips'
        }
      });*/
    }
  }
  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['login'];
    this.context.onSetTitle(compo.login_title);
    this.context.onSetMeta("description", compo.login_description);
    return (
      <div className={'Authorize ' + (this.state.loginBackground ? 'custom-bg' : '')}>
      <Dialog {... this.state.dialogOption}  />
        <div className={'Authorize-container '  +(!this.state.isPC ? 'mob' : '')} style={{"backgroundImage":this.state.isPC ? "url(" + this.state.loginBackground + ")" : "none"}}>
          <div className="bg-box">
            {
              !this.state.isPC ? <img src={this.state.loginBackground} className="uploadBackgroun" /> :''
            }
          </div>
          <div className='Login'>
            <div className="cell">
              <h3 className="title">{compo.login_welcome_back}</h3>
              <form onSubmit={this.loginSubmit.bind(this)}>
                <ul className="input">
                  <li>
                    <div className={"input-normal " + (this.state.email ? 'fill' : '')}>
                       <span className="placeholder">{compo.login_placeholder_email}<i className="required-flag">*</i></span>
                       <input type='email' name='email' value={this.state.email} onChange={this.valueChange.bind(this)} />
                    </div>
                  </li>
                  <li>
                    <div className={"input-normal " + (this.state.password ? 'fill' : '')}>
                       <span className="placeholder">{compo.login_placeholder_password}<i className="required-flag">*</i></span>
                       <input type='password' name='password' maxLength="20" value={this.state.password} onChange={this.valueChange.bind(this)} />
                    </div>
                  </li>
                  <li className='auth-act'>
                    <a className="fr" href="/forget" onClick={Link.handleClick}>{compo.login_forgot_your_password}</a>
                    <span className="remember" onClick={this.remember.bind(this)}>
                      {!this.state.remember ?
                        <i className='iconfont'>&#xe634;</i> :
                        <i className='iconfont checked'>&#xe633;</i>
                      }
                      {compo.login_remember_me}
                    </span>
                  </li>
                  <li>
                    <button className='submit' type='submit'>{compo.login_log_in}</button>
                  </li>
                </ul>
              </form>
              <div></div>
              <ul className="third">
                <li className='log-or'>
                  <i className='cell'></i>
                  <span className='cell-1'>{compo.login_or}</span>
                  <i className='cell'></i>
                </li>
                <li>
                  <button className='submit' onClick={this.goRegister.bind(this)}>{compo.login_create_account}</button>
                </li>
                <li className="log-ass">
                  <div className="googleBtn"><button onClick={this.googleLoginDig.bind(this)}><i className="iconfont google">&#xe606;</i>{compo.login_sign_in_with_google}</button></div>
                  <div className="facebookBtn"><button onClick={this.facebookLoginDig.bind(this)}><i className="iconfont">&#xe657;</i>{compo.login_sign_in_with_facebook}</button></div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
