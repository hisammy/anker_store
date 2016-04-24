/**
 * Created by Leon on 2015-11-23 11:04:40
 */

import React, { PropTypes, Component } from 'react';
import styles from './ServiceNav.scss';
import withStyles from '../../decorators/withStyles.js';
import classNames from 'classnames';
import AppActions from '../../core/AppActions';
import Location from '../../core/Location';
import Link from '../../utils/Link';

@withStyles(styles)
class ServiceNav extends Component {

  static propTypes = {
  };
  static contextTypes = {
  };

  componentWillMount() {
    this.setState({
      'nav': 'download',
    })
  }
  componentDidMount() {
    this.focusNav();
  }

  focusNav() {
    let pathname = location.pathname.toLowerCase().replace(/\/$/, ''),
      nav = '';
    console.log(pathname);
    switch (pathname){
      case '/support':
      case '/support/download':
        nav = 'download';
        break;
      case '/support/refund-exchange':
        nav = 'refund-exchange';
        break;
      case '/support/privacy-policy':
        nav = 'privacy-policy';
        break;
      case '/support/terms':
        nav = 'terms';
        break;
      case '/support/warranty':
        nav = 'warranty';
        break;
      case '/support/faq':
        nav = 'faq';
        break;
    }
    // console.warn(pathname, nav);
    this.setState({
      'nav': nav
    });
  }

  render() {
    const supportNav = this.props.support_nav || {};
    return (
        <div className="module-container ServiceNav">
          <ul className="clearfix">
            <li className={this.state.nav === 'download' ? 'cur' : ''}>
              <a href="/support/download" onClick={Link.handleClick}>
              <i className="iconfont">&#xe671;</i>
              {supportNav.downloads}
              </a>
            </li>
            <li className={this.state.nav === 'refund-exchange' ? 'cur' : ''}>
              <a href="/support/refund-exchange" onClick={Link.handleClick}>
              <i className="iconfont">&#xe66f;</i>
              {supportNav.refunds_exchanges}
              </a>
            </li>
            <li className={this.state.nav === 'privacy-policy' ? 'cur' : ''}>
              <a href="/support/privacy-policy" onClick={Link.handleClick}>
              <i className="iconfont">&#xe604;</i>
                {supportNav.privacy_policy}
              </a>
            </li>
            <li className={this.state.nav === 'terms' ? 'cur' : ''}>
              <a href="/support/terms" onClick={Link.handleClick}>
              <i className="iconfont">&#xe65e;</i>
              {supportNav.term_of_use}
              </a>
            </li>
            <li className={this.state.nav === 'warranty' ? 'cur' : ''}>
              <a href="/support/warranty" onClick={Link.handleClick}>
              <i className="iconfont">&#xe673;</i>
              {supportNav.warranty}
              </a>
            </li>
            {/*<li className={this.state.nav === 'faq' ? 'cur' : ''}>
              <a href="/support/faq" onClick={Link.handleClick}>
              <i className="iconfont">&#xe605;</i>
              FAQs
              </a>
            </li>*/}
          </ul>
        </div>
    );
  }
}

export default ServiceNav;
