/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { PropTypes, Component } from 'react';
import withStyles from '../../decorators/withStyles';
import styles from './Place.scss';
import AppActions from '../../core/AppActions';
import Dialog from '../Dialog';
import Verify from '../../utils/Verify';
import Location from '../../core/Location';
import Link from '../../utils/Link';
import Http from '../../core/HttpClient';
import Track from '../../utils/Track';
import { md5 } from '../../utils/Helper';

@withStyles(styles)
class Payment extends Component {

  static propTypes = {
    data: PropTypes.object.isRequired
  };

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  componentWillMount() {
    this.state = {
      'order': this.props.data,
    };
  };

  componentDidMount() {
    // 购买追踪 - conv tracking (直接写在render()里, 不刷新页面不会执行JS)
    const script = document.createElement('script');
    const data = document.createTextNode(this.conversionCode()['__html']);
    // console.log(this.conversionCode(), data);
    script.appendChild(data);
    document.body.appendChild(script);
    const conversion = document.createElement('script');
    conversion.src= '//www.googleadservices.com/pagead/conversion_async.js';
    document.body.appendChild(conversion);

    this.setState({
      'dialogOption': {
        'close': this.closeDialog.bind(this)
      }
    });
    AppActions.removeOrder();
  };

  closeDialog(event) {
    this.setState({
      dialogOption: {content:''},
    });
  }

  payment = async (event) => {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['place'];
    // return console.log(goog_report_conversion);
    localStorage.setItem('order_price', this.state.order.total);
    let body = {
      'order_id': this.state.order.number,
      'order_token': this.state.order.token
    };
    fbq('track', 'AddPaymentInfo');
    const order = this.state.order;
    const prods = order.line_items.map((item, i) => {
      return {id: (item.variant.sku || item.id), price: item.price, quantity: item.quantity}
    });
    Track.saveEcPurchase(order.line_items, {
      'id': order.number,
      'revenue': order.total,
      'shipping': order.shipment_total,
      'tax': order.tax_total
    });
    Track.steelHouseConversion({
      order_id: order.number,
      total_amount: order.total,
      ids: prods.map(o=>o.id).join(','),
      quantities: prods.map(o=>o.quantity).join(','),
      unit_prices: prods.map(o=>o.price).join(','),
    });
    const json = await Http.post('post', '/api/content?path=/api/payments/paypal_create_button', body);
    if(json.result === 'success') {
      let paypal = decodeURIComponent(json.content);
      let link = paypal.slice(paypal.indexOf('EMAILLINK=')).replace('EMAILLINK=', '')
      + '&custom=' + this.state.order.number + ',web' + '&invoice=' + this.state.order.number;
      AppActions.loading(true);
      AppActions.removeOrder();
      try {
        const user = AppActions.getUser();
        const hashedMail = user.invitation_code || md5(this.state.order.email);
        // console.log(hashedMail, order.number, prods);
        Track.criteoOneTag(hashedMail, { event: "trackTransaction" , id: this.state.order.number, item: prods});
      } catch(e) {
        console.log(e);
      }
      if (window.goog_report_conversion) {
        window.goog_report_conversion(link);
      } else {
        location.href = link;
      }
    } else {
      this.setState({
        'dialogOption': {
          'dialogType': 'confirm',
          'title': compo.payment_fail,
          'content': json,
          'buttons': <div>
            <a className="button normalBtn" onClick={this.goHome.bind(this)} id="aCancelBtn">{compo.back_home}</a>
            <a className="button deepButton" onClick={this.checkOrders.bind(this)} id="aConfirmBtn">{compo.check_orders}</a>
          </div>
        }
      });
    }
  }

  goHome() {
    Location.push( '/');
  }

  checkOrders() {
    Location.push( '/orders');
  }
  conversionCode() {
    return ({
      // Google Code for Payment Conversion Page
      // In your html page, add the snippet and call
      // goog_report_conversion when someone clicks on the
      // chosen link or button
      __html: `goog_snippet_vars = function() {
          var w = window;
          w.google_conversion_id = 921123694;
          w.google_conversion_label = "xFR6CPyJ4mQQ7vactwM";
          w.google_conversion_value = ${this.state.order.total};
          w.google_conversion_currency = "USD";
          w.google_remarketing_only = false;
        }
        // DO NOT CHANGE THE CODE BELOW.
        goog_report_conversion = function(url) {
          goog_snippet_vars();
          window.google_conversion_format = "3";
          var opt = new Object();
          opt.onload_callback = function() {
            if (typeof(url) != 'undefined') {
              window.location = url;
            }
          }
          var conv_handler = window['google_trackConversion'];
          if (typeof(conv_handler) == 'function') {
            conv_handler(opt);
          }
        }`
    });
  }

  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['place'];
    this.context.onSetTitle(compo.place_title);
    if(this.state.order && this.state.order.shipments && this.state.order.shipments.length) {
      this.state.order.preorder = this.state.order.preorder || [];
      this.state.order.shipby = this.state.order.shipby || [];
      this.state.order.shipments.map((item, i) => {
        if(item.is_backordered) {
          this.state.order.preorder.push(item);
        } else {
          this.state.order.shipby.push(item);
        }
      });
      this.state.order.shipments = [];
    }
    return (
      <div className="Place">
        <Dialog {...this.state.dialogOption} />
        {(!this.state.order || !this.state.order.line_items || !this.state.order.line_items.length) ?
          <div className="Cart-empty">
            <i className="iconfont">&#xe62e;</i>
            <section className="info">
              <p className="text1">{compo.cart_empty}</p>
              <p className="text2">{compo.cart_empty_desc}</p>
              <p className="url">
                <a href="/" onClick={Link.handleClick}>{common.shop_now}</a>
              </p>
            </section>
          </div>
          :
          <div className="module-container">
            <div className="page-title">
              <span className="item">
                <i className="iconfont">&#xe603;</i>
                <span>{compo.payment}</span>
              </span>
            </div>
            <div className="list">
              {this.state.order.preorder && this.state.order.preorder.length ?
                <dl>
                  <dt>{compo.preorder}</dt>
                    {this.state.order.preorder.map((item, i) => {
                      if(item.is_backordered) {
                        return (
                          <dd key={i}>
                            <div className="image"><img src={item.line_items[0].variant.image ? item.line_items[0].variant.image.mini_url : ''} /></div>
                            <div className="text">
                              <span className="name">{item.line_items[0].variant.name}</span>
                              <span className="color" dangerouslySetInnerHTML={{
                                __html: i18n.format(compo.color_colon, item.line_items[0].variant.option_values.length ? item.line_items[0].variant.option_values[0].name : '')
                              }}/>
                              <span className="quantity" dangerouslySetInnerHTML={{__html: i18n.format(compo.quantity_colon, item.line_items[0].quantity)}}/>
                              <span className="price">{item.line_items[0].display_amount}</span>
                            </div>
                          </dd>
                        );
                      };
                    })}
                </dl> : ''
              }
              {this.state.order.shipby ? this.state.order.shipby.map((item, i) => {
                return (
                  <dl key={i}>
                    <dt dangerouslySetInnerHTML={{__html: i18n.format(compo.ship_by, item.stock_location_name)}}/>
                      {item.line_items.map((item, i) => {
                        return (
                          <dd key={i}>
                            <div className="image"><img src={item.variant.image ? item.variant.image.mini_url : ''} /></div>
                            <div className="text">
                              <span className="name">{item.variant.name}</span>
                              <span className="color" dangerouslySetInnerHTML={{
                                __html: i18n.format(compo.color_colon, item.variant.option_values.length ? item.variant.option_values[0].name : '')
                              }}/>
                              <span className="quantity" dangerouslySetInnerHTML={{__html: i18n.format(compo.quantity_colon, item.quantity)}}/>
                              <span className="price">{item.display_amount}</span>
                            </div>
                          </dd>
                        );
                      })}
                  </dl>
                )
              }) : ''}
            </div>
            <ul className="count">
              <li>
                <span className="key">{compo.place_subtotal}</span>
                <span className="value">{this.state.order.display_item_total}</span>
              </li>
              <li>
                <span className="key">{compo.place_shipping}</span>
                <span className="value">{this.state.order.display_ship_total}</span>
              </li>
              <li>
                <span className="key">{compo.place_taxes}</span>
                <span className="value">{this.state.order.display_tax_total}</span>
              </li>
              {this.state.order.adjustments ? this.state.order.adjustments.map((item, i) => {
                return(
                  <li key={i}>
                    <span className="key">{item.label}:</span>
                    <span className="value">{item.amount}</span>
                  </li>
                );
              }) : ''}
              <li className="total">
                <span className="key">{compo.place_total}</span>
                <span className="value">{this.state.order.display_total}</span>
              </li>
            </ul>
            <div className="checkout">
              <p className="title">{compo.payment_method}</p>
              <p className="description">{compo.payment_method_desc}</p>
              <p className="credit">
                <img src={require('../../public/credit/visa.png')} />
                <img src={require('../../public/credit/master.png')} />
                <img src={require('../../public/credit/amex.png')} />
                <img src={require('../../public/credit/discover.png')} />
              </p>
              <p className="description" dangerouslySetInnerHTML={{__html: compo.payment_method_paypal}} />
              <a className="submit" onClick={this.payment.bind(this)}>
                <span className="price">
                  {this.state.order.display_total}
                  <span className="line">|</span>
                </span>
                <span>{compo.pay_with_paypal}</span>
              </a>
            </div>
          </div>
        }
      </div>
    );
  }
}

export default Payment;
