/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { PropTypes, Component } from 'react';
import styles from './Password.scss';
import withStyles from '../../decorators/withStyles';
import AppActions from '../../core/AppActions';
import Http from '../../core/HttpClient';
import Link from '../../utils/Link';
import Dialog from '../Dialog';
import Menber from '../Member/Member.js';

@withStyles(styles)
class Password extends Component {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  componentWillMount() {
    this.setState({
      'password': '',
      'password_confirmation': '',
      'original_password': '',
      'token': AppActions.getUser.token,
      'isShowOldPwd': false
    });
  }

  componentDidMount() {
    let urlToken = AppActions.getUrlParam().token || '';
    let original_password = AppActions.getUrlParam().pwd || '';
    let token = AppActions.getUser().token;
    this.state.urlToken = urlToken;
    this.state.dialogOption = {
      close:this.closeDialog.bind(this)
    };
    if(urlToken) {
      AppActions.signOut();
    }
    if (!urlToken && (token || original_password)) {
      this.state.isShowOldPwd = true;
      this.state.original_password = original_password;
    }
    this.setState(this.state);
  }

  changePassword = async (event) => {
    const i18n = this.props.i18n || {};
    // const common = i18n['common'] || {};
    const compo = i18n['password'];
    event.preventDefault();
    if (this.state.isShowOldPwd && this.state.original_password === '') {
      this.state.dialogOption.content = compo.fill_old_password;
      this.state.dialogOption.dialogType = 'tips';
      this.setState(this.state);
      return;
    }
    if (this.state.password === '') {
      this.state.dialogOption.content = compo.fill_new_password;
      this.state.dialogOption.dialogType = 'tips';
      this.setState(this.state);
      return;
    }
    if (this.state.password.length < 8 || this.state.password.length > 20) {
      this.state.dialogOption.content = compo.password_verify_error;
      this.state.dialogOption.dialogType = 'tips';
      this.setState(this.state);
      return;
    }
    if (this.state.password_confirmation === '') {
      this.state.dialogOption.content = compo.fill_confirm_password;
      this.state.dialogOption.dialogType = 'tips';
      this.setState(this.state);
      return;
    }
    if (this.state.password !== this.state.password_confirmation) {
      this.state.dialogOption.content = compo.new_passwords_do_not_match;
      this.state.dialogOption.dialogType = 'tips';
      this.setState(this.state);
      return;
    }
    let body = {
      'password': this.state.password,
      'password_confirmation': this.state.password_confirmation
    };
    let url = '';
    if (this.state.urlToken) {
      body['reset_password_token'] = this.state.urlToken;
      url = '/api/content?path=/api/user_passwords/update_by_token';
    } else {
      body['original_password'] = this.state.original_password;
      url = '/api/content?path=/api/user_passwords/change_password';
    }
    const json = await Http.post('PUT', url, body)
    if (json.apikey) {
      AppActions.signOut();
      this.state.dialogOption.content = compo.password_change_successful;
      this.state.dialogOption.dialogType = 'success';
      this.setState(this.state);
      setTimeout(function(){
        location.href = '/login';
      },2000);
    } else {
      this.state.dialogOption.content = json;
      this.state.dialogOption.dialogType = 'tips';
      this.setState(this.state);
    }
  }

  valueChange(event) {
    this.state[event.target.name] = event.target.value;
    this.setState(this.state);
  }
  closeDialog(event) {
    this.setState({
      dialogOption: {content:''},
    });
  }
  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['password'];
    this.context.onSetTitle(compo.password_title);
    return (
      <div className="Password">
        <Dialog {... this.state.dialogOption}  />
        {this.state.isShowOldPwd ?
        <Menber i18n={i18n} data="profile"  /> : ''}
        <div className="Password-container">
          <h3 className={this.state.isShowOldPwd ? '' : 'title'}>{compo.password_change_password}</h3>
          {this.state.isShowOldPwd ?
            <div className="input">
              <div className={"input-normal " + (this.state.original_password ? 'fill' : '')}>
               <span className="placeholder">{compo.password_old_password}<i className="required-flag">*</i></span>
               <input autoComplete="off" maxLength="200" name="original_password" type="password" value={this.state.original_password} onChange={this.valueChange.bind(this)} />
              </div>
            </div>
          :''}
          <div className="input">
            <div className={"input-normal " + (this.state.password ? 'fill' : '')}>
             <span className="placeholder">{compo.password_new_password}<i className="required-flag">*</i></span>
             <input autoComplete="off" maxLength="200" name="password" type="password"  value={this.state.password} onChange={this.valueChange.bind(this)} />
            </div>
          </div>
          <div className="input">
            <div className={"input-normal " + (this.state.password_confirmation ? 'fill' : '')}>
             <span className="placeholder">{compo.password_confirm_password}<i className="required-flag">*</i></span>
             <input autoComplete="off" maxLength="200" name="password_confirmation" type="password" value={this.state.password_confirmation} onChange={this.valueChange.bind(this)} />
            </div>
          </div>
          <div className="action">
            <button type="button" onClick={this.changePassword.bind(this)} className="submit">{compo.password_change_password}</button>
          </div>
        </div>
      </div>
    );
  }

}

export default Password;
