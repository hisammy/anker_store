/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { PropTypes, Component } from 'react';
import withStyles from '../../decorators/withStyles';
import AppActions from '../../core/AppActions';
import styles from './Complete.scss';
import Link from '../../utils/Link';
import Track from '../../utils/Track';
import ReactDOM from 'react-dom';

@withStyles(styles)
class Complete extends Component {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
    onSetMeta: PropTypes.func.isRequired
  };

  componentWillMount() {
    this.setState({
      'paid_success': this.props.query.paid === 'true',
      'order_price': !global.server ? localStorage.getItem('order_price') : 0,
      'now': new Date().getMonth() + 1 + ' / ' + new Date().getDate() + ' / ' + new Date().getFullYear(),
    });
  }

  componentDidMount() {
    const orderPrice = this.state.order_price;
    if (this.state.paid_success && !global.server) {
      const fbq = window.fbq || function () {};

      Track.ecPurchase();
      fbq('track', 'Purchase', {'value': orderPrice, 'currency': 'USD'});

      // US Anker PLA
      // const totalValue = orderPrice || 0.11;
      // this.setState({
      //   'gg_pla_img_src': `//www.googleadservices.com/pagead/conversion/961408788/?value=${totalValue}&currency_code=USD&label=gk7yCJPf_2MQlN63ygM&guid=ON&script=0`
      // });
    }
  };

  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['complete'];
    this.context.onSetTitle(compo.complete_title);
    let gg_pla_img_src = '';
    if (this.state.paid_success) {
      this.context.onSetMeta('track_google_pla', true);
    }
    return (
      <div className="Complete">
        <div className="module-container">
          {this.props.query.paid === 'true' ?
            <div className="Complete-mod">
              <p>{compo.payment_successful}</p>
              <p>{compo.thank_you}</p>
              <div className="links">
                <a href="/" onClick={Link.handleClick}>{compo.back_to_home_page}</a>
              </div>
            </div>
            :
            <div className="Complete-mod">
              <p>{compo.sorry}</p>
              <p>{compo.payment_unsuccessful}</p>
              <div className="links">
                <a href="/orders" onClick={Link.handleClick}>{compo.back_to_my_order}</a>
              </div>
            </div>
          }
        </div>
        {!this.state.gg_pla_img_src? '' :
          <img height="1" width="1" style={{borderStyle:'none'}} src={this.state.gg_pla_img_src}/>
        }
      </div>
    );
  }

}

export default Complete;
