/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { PropTypes, Component } from 'react';
import withStyles from '../../decorators/withStyles';
import styles from './Authorize.scss';
import AppActions from '../../core/AppActions';
import Location from '../../core/Location';
import Http from '../../core/HttpClient';
import classnames from 'classnames';
import Link from '../../utils/Link';
import Dialog from '../../utils/Dialog';
import Verify from '../../utils/Verify';

@withStyles(styles)
class Active_for_authentication extends Component {
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  componentWillMount() {
    this.setState({
        'content':''
    })
  }
  componentDidMount() {
    if(this.props.token){
      this.active();
    }
  }
  active = async(e) => {
    const i18n = this.props.i18n || {};
    // const common = i18n['common'] || {};
    const compo = i18n['active_for_authentication'];
    const json = await Http.post('POST', '/api/content?path=/api/users/active_confirm', {active_token:this.props.token});
    if (json.email) {
      this.setState({
        'content': compo.active_for_auth_tip_success,
      });
      setTimeout(function(){
        AppActions.signOut();
        AppActions.signIn(json);
        AppActions.setCart(json.item_count);
        Location.push('/profile');
      },2000)
    } else {
      this.setState({
        'content': compo.active_for_auth_tip_failed
      });
    }
  }
  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['active_for_authentication'];
    this.context.onSetTitle(compo.active_for_auth_title);
    return (
      <div className="Authorize no-bg">
        <div className="Activation">
          <h3>{this.state.content}</h3>
        </div>
      </div>
    );
  }
}

export default Active_for_authentication;
