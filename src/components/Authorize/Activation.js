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
class Activation extends Component {
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  componentWillMount() {
    this.setState({
      'dialogOption':{},
      'emailUrl':this.props.email && this.props.email.split('@')[1] ? ('http://mail.' + this.props.email.split('@')[1]) : ''
    });

  }
  componentDidMount() {
    this.setState({
      'dialogOption':{close:this.closeDialog.bind(this)}
    })
  }
  loginSubmit = async (e) =>{
    const i18n = this.props.i18n || {};
    // const common = i18n['common'] || {};
    const compo = i18n['activation'] || {};
    e.preventDefault();
    const json = await Http.post('POST', '/api/content?path=/api/users/resend_active_mail', {email:this.props.email});
    if(json.result){
      this.state.dialogOption.content = compo.activation_resend_email_success;
      this.state.dialogType='success';
      this.setState(this.state);
    }else{
      this.state.dialogOption.content = compo.activation_resend_email_failed;
      this.state.dialogType='tisp';
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
    const compo = i18n['activation'] || {};
    this.context.onSetTitle(compo.activation_title);
    return (
      <div className="Authorize no-bg">
        <div className="Activation">
          <Dialog  {... this.state.dialogOption}  />
          <h3>{compo.activation_tip_title}</h3>
          <div dangerouslySetInnerHTML={{__html: compo.activation_tip_desc}}/>
          <div className="email"><a target="_bank" href={this.state.emailUrl}>{this.props.email}</a></div>
          <div className="btn"><button onClick={this.loginSubmit.bind(this)}>{compo.activation_resend_the_email}</button></div>
        </div>
      </div>
    );
  }
}

export default Activation;
