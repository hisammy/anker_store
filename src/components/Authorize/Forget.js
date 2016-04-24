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
class Forget extends Component {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  componentWillMount() {
    this.state = {
      'email': '',
      'dialogOption':{}
    };
  }

  componentDidMount() {
    this.setState({
      'dialogOption':{close:this.closeDialog.bind(this)},
      'loginBackground':localStorage.getItem('login_background'),
      'isPC': Verify.isPC(),
      'screenH': screen.height * .8 + 'px'
    });
  }

  valueChange(event) {
    this.state[event.target.name] = event.target.value;
    this.setState(this.state);
  }

  forgetSubmit = async (e) => {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['forget'];
    e.preventDefault();
    if (this.state.email === '') {
      this.state.dialogOption.content = common.fill_email;
      this.setState(this.state);
      return;
    }
    if (!Verify.isEmail(this.state.email)) {
      this.state.dialogOption.content = common.fill_valid_email;
      this.setState(this.state);
      return;
    }
    const body = {
      'email': this.state.email,
      'host': window.location.protocol + '//' + window.location.host
    };
    const json = await Http.post('POST', '/api/content?path=/api/user_passwords', body);
    if (json.result && json.result === 'ok') {
      this.state.dialogOption.content = compo.forget_sent_reset_email_tip;
      this.state.dialogOption.dialogType = 'success';
      this.setState(this.state);
      setTimeout(() =>{
        Location.push( "/login");
      },2000)
    } else {
      this.state.dialogOption.content = json;
      this.setState(this.state);
      if(json.status === 405){
        setTimeout(() =>{
            Location.push( '/activation?email=' + this.state.email);
        },2000)
      }
    }
  };

  closeDialog(event) {
    this.setState({
      dialogOption: {content:''},
    });
  }

  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['forget'];
    this.context.onSetTitle(compo.forget_title);
    return (
      <div className={'Authorize ' + (this.state.loginBackground ? 'custom-bg' : '')}>
        <Dialog {... this.state.dialogOption}  />
        <div className={'Authorize-container '  +(!this.state.isPC ? 'mob' : '')} style={{"backgroundImage":this.state.isPC ? "url(" + this.state.loginBackground + ")" : "none"}}>
          <div className="bg-box">
            {
              !this.state.isPC ? <img src={this.state.loginBackground} className="uploadBackgroun" /> :''
            }
          </div>
          <div className='Forget'>
            <h3 className="title">{compo.forget_tips_title}</h3>
            <div className="forgetTips">{compo.forget_tips_desc}</div>
            <form onSubmit={this.forgetSubmit.bind(this)}>
              <ul className="input">
                <li>
                  <div className={"input-normal " + (this.state.email ? 'fill' : '')}>
                 <span className="placeholder">{compo.forget_placeholder_email}<i className="required-flag">*</i></span>
                    <input type='email' name='email' value={this.state.email} onChange={this.valueChange.bind(this)}/>
                </div>
                </li>
                <li>
                  <button className='submit' type='submit'>{common.submit}</button>
                </li>
                <li><a href="/login" onClick={Link.handleClick} className='cancel'>{compo.forget_cancel_link}</a></li>
              </ul>
            </form>

          </div>

        </div>
      </div>
    );
  }

}

export default Forget;
