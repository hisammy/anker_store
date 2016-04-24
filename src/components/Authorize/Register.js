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
import Verify from '../../utils/Verify';

@withStyles(styles)
class Register extends Component {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
    onSetMeta: PropTypes.func.isRequired
  };

  componentWillMount() {
    this.state = {
      'nick_name': '',
      'email': '',
      'password': '',
      'confirm': '',
      'error': '',
      'code': '',
      'is_subscribe': true,
      'country':[],
      'inviter_code':'',
      'dialogOption':{}
    };
  }

  componentDidMount() {
    this.setState({
      'loginBackground':localStorage.getItem('login_background'),
      'dialogOption':{close:this.closeDialog.bind(this)},
      'isPC': Verify.isPC()
    });
    this.getCode();
    //this.getCountry();
  }

  valueChange(event) {
    this.state[event.target.name] = event.target.value;
    this.setState(this.state);
  }

  returnLogin() {
    var back = AppActions.getUrlParam().back;
    back ? Location.push('/login?back=' + back) : Location.push('/login')
  }

  registerSubmit = async (e) => {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['register'];
    e.preventDefault();
    if (this.state.email === '') {
      this.state.dialogOption.content = common.fill_email;
      this.setState(this.state);
      return;
    }
    /*if (this.state.nick_name === '') {
      this.state.dialogOption.content = 'Please enter your user name.';
      this.setState(this.state);
      return;
    }*/
    if (this.state.password === '') {
      this.state.dialogOption.content = common.fill_password;
      this.setState(this.state);
      return;
    }
    /*if (this.state.confirm === '') {
      this.state.dialogOption.content = 'Please confirm your password.';
      this.setState(this.state);
      return;
    }
    if (this.state.password !== this.state.confirm) {
      this.state.dialogOption.content = 'Passwords do not match.';
      this.setState(this.state);
      return;
    }*/
    let inviter_code = AppActions.getUrlParam().inviter_code;
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
    let body = {
      'register_source': encodeURIComponent(this.props.register_source ? this.props.register_source : location.href),
      'email': this.state.email,
      'password': this.state.password,
      'is_subscribe': this.state.is_subscribe,
      'country_code':this.state.country_code
    };
    if(inviter_code){
        body.inviter_code = inviter_code;
    }
    if (!AppActions.getUser().token) {
      body['order_id'] = AppActions.getUser().order_id
    } else {
      AppActions.signOut();
    }
    const json = await Http.post('post', '/api/content?path=/api/registrations', body);
    if (json && json.result) {
      fbq('track', 'CompleteRegistration');
      // Google ADwords加入注册追踪代码
      var img = document.createElement('img');
      img.height = 1;
      img.width = 1;
      img.border = 0;
      img.src = "//www.googleadservices.com/pagead/conversion/921123694/?label=FRXkCJnk5mQQ7vactwM&guid=ON&script=0";
      document.body.appendChild(img);
      this.state.dialogOption.content = compo.register_registration_success;
      this.state.dialogOption.dialogType = 'success';
      this.setState(this.state);
      setTimeout(() => {
        Location.push( "/activation?email=" + this.state.email);
      }, 2000)
    } else {
      this.state.dialogOption.content = json.error;
      this.setState(this.state);
      //this.getCode();
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
  getCode = async () => {
    const json = await Http.post('get', '/api/content?path=/api/users/obtain_captcha');
    if (json.captcha_code) {
      this.state.imgUrl = json.captcha_url;
      this.state.code = json.captcha_code;
      this.setState(this.state);
    }
  }
  closeDialog(event) {
    this.setState({
      dialogOption: {content:''},
    });
  }
  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['register'];
    this.context.onSetTitle(compo.register_title);
    this.context.onSetMeta("description", compo.register_description);
    return (
      <div className={'Authorize ' + (this.state.loginBackground ? 'custom-bg' : '')}>
        <Dialog  {... this.state.dialogOption}  />
        <div className={'Authorize-container '  +(!this.state.isPC ? 'mob' : '')} style={{"backgroundImage":this.state.isPC ? "url(" + this.state.loginBackground + ")" : "none"}}>
          <div className="bg-box">
            {
              !this.state.isPC ? <img src={this.state.loginBackground} className="uploadBackgroun" /> :''
            }
          </div>
          <div className='Register' style={{'minHeight': this.state.screenH}}>
            <h3 className="title">{compo.register_tip_title}</h3>
            <form onSubmit={this.registerSubmit.bind(this)}>
              <ul className="input">
                <li>
                  <div className={"input-normal " + (this.state.email ? 'fill' : '')}>
                     <span className="placeholder">{compo.register_placeholder_email}<i className="required-flag">*</i></span>
                     <input type='email' name='email' value={this.state.email} onChange={this.valueChange.bind(this)} />
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
                       <span className="placeholder">{compo.register_placeholder_password}<i className="required-flag">*</i></span>
                       <input type='password' name="password" maxLength="20" value={this.state.password} onChange={this.valueChange.bind(this)}/>
                    </div>
                  </li>
                {/*<li>
                    <div className={"input-normal " + (this.state.confirm ? 'fill' : '')}>
                       <span className="placeholder">Confirm password<i className="required-flag">*</i></span>
                       <input type='password' name="confirm" maxLength="20" value={this.state.confirm} onChange={this.valueChange.bind(this)}/>
                    </div>
                  </li>*/}

                {/*<li>
                  <div className={"input-normal codeDiv " + (this.state.value ? 'fill' : '')}>
                     <span className="placeholder">Verification code — humans only! <i className="required-flag">*</i></span>
                     <input type='input' className="code"  name="value" maxLength="20"
                           value={this.state.value} onChange={this.valueChange.bind(this)}/>
                  </div>
                   <img className="codeImg" src={this.state.imgUrl} onClick={this.getCode.bind(this)} />
                </li>*/}
                <li className='auth-act'>
                <span onClick={this.subscribe.bind(this)}>
                  {this.state.is_subscribe ?
                    <i className='iconfont checked'>&#xe633;</i> :
                    <i className='iconfont'>&#xe634;</i>
                  }
                  {compo.register_subscribe_tip}
                </span>
                </li>
                <li>
                  <button className='submit' type='submit'>{compo.register_register}</button>
                </li>
                <li><a href="javascript:;" onClick={this.returnLogin.bind(this)} className='cancel'>{compo.register_sign_in}</a></li>
              </ul>
            </form>
          </div>
        </div>
      </div>
    );
  }
};

export default Register;
