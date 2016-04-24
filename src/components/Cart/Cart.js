/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { PropTypes, Component } from 'react';
import withStyles from '../../decorators/withStyles';
import styles from './Cart.scss';
import AppActions from '../../core/AppActions';
import Location from '../../core/Location';
import Http from '../../core/HttpClient';
import Link from '../../utils/Link';
import Dialog from '../Dialog';
import Track from '../../utils/Track';
import { md5 } from '../../utils/Helper';
import PopupSignup from '../Authorize/PopupSignup';

@withStyles(styles)
class Cart extends Component {

  static propTypes = {
    data: PropTypes.object
  };

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  componentWillMount() {
    this.setState({
      'order': this.props.data,
    });
  };

  componentDidMount() {
    this.setState({
      'dialogOption': {
        'close': this.closeDialog.bind(this)
      }
    });
    const user = AppActions.getUser();
    const hashedMail = user.invitation_code || md5(user.email);
    const items = this.state.order.line_items ? this.state.order.line_items.map((item, i) => {
      return {id: (item.variant.sku || item.id), price: item.price, quantity: item.quantity}
    }) : {};
    // console.log(hashedMail, items);
    Track.criteoOneTag(hashedMail, {event: 'viewBasket', item: items});
  };

  address = async () => {
    const fbq = window.fbq || function () {};
    fbq('track', 'InitiateCheckout');
    if (this.state.order.user_id) {
      const body = {
        'id': this.state.order.number,
        'state': 'cart'
      };
      const json = await Http.post('PUT', '/api/content?path=/api/checkouts/' + this.state.order.number, body);
      if (json.state === 'address') {
        if(json.ship_address && json.bill_address && json.bill_address.state_id) {
          this.delivery();
        } else {
          Location.push( '/process');
        }
        Track.ecCheckout(json.line_items, 1);
      } else {
        this.setState({
          dialogOption: {
            'content': json,
            'dialogType': 'tips'
          }
        });
      }
    } else {
      Location.push( '/process');
    }
  };

  delivery = async () => {
    const body = {
      'id': this.state.order.number,
      'state': 'address'
    };
    const json = await Http.post('PUT', '/api/content?path=/api/checkouts/' + this.state.order.number, body);
    if (json.state === 'delivery') {
      Location.push( '/process');
      Track.ecCheckout(json.line_items, 2);
    } else {
      this.setState({
        'dialogOption': {
          'content': json,
          'dialogType': 'tips'
        }
      });
    }
  };


  quantitySet = async (itemid, type, i, event) => {
    event.preventDefault();
    let quant = this.state.order.line_items[i].quantity ? this.state.order.line_items[i].quantity : 1;
    //判断是否达到最大/最小值
    if ((type === 'reduce' && quant <= 1) || (type === 'add' && quant >= 999)) {
      return;
    }
    //判断是执行加还是减操作并给予变化
    quant = (type === 'reduce') ? --quant :
      (type === 'add') ? ++quant :
        parseInt(event.target.value) ? event.target.value : 1;
    let body = {
      'line_item': {
        'variant_id': itemid,
        'quantity': quant
      }
    };
    const json = await Http.post('PUT', '/api/content?path=/api/orders/' + this.state.order.number + '/line_items/' + itemid, body);
    if (json.error || json.exception) {
      this.setState({
        'dialogOption': {
          'content': json,
          'dialogType': 'tips'
        }
      });
    } else {
      const variant = this.state.order.line_items[i];
      const prod = Track.formatProdItem(variant, variant.sku, variant.quantity);
      // console.log(variant, prod);
      this.setState({
        order: json
      });
      AppActions.setCart(json.total_quantity);
      if (type === 'reduce') {
        Track.ecRemoveFromCart(prod, 1, 'Cart');
      } else {
        Track.ecAddToCart(prod, 1, 'Cart');
      }
    }
  };

  quantityInput(i, event) {
    this.state.order.line_items[i].quantity = /^[0-9]{0,3}$/.test(event.target.value) ? event.target.value : this.state.order.line_items[i].quantity;
    this.setState(this.state);
  };

  closeDialog(event) {
    this.setState({
      'dialogOption': {
        'content': '',
        'title': '',
        'dialogTYpe': '',
        'buttons': ''
      }
    });
  };

  variantDel = async (itemid, i) => {
    const i18n = this.props.i18n || {};
    const compo = i18n['cart'];
    this.setState({
      'dialogOption': {
        'dialogType': 'confirm',
        'title': compo.remove_item,
        'content': compo.remove_item_desc,
        'buttons': <div>
          <a className="button normalBtn" onClick={this.closeDialog.bind(this)} id="aCancelBtn">{compo.no}</a>
          <a className="button deepButton" onClick={this.removeItem.bind(this, itemid, i)} id="aConfirmBtn">{compo.yes}</a>
        </div>
      }
    });
  };

  removeItem = async (itemid, i) => {
    const json = await Http.post('DELETE', '/api/content?path=/api/orders/' + this.state.order.number + '/line_items/' + itemid);
    if (json.error || json.exception) {
      this.setState({
        'dialogOption': {
          'content': json,
          'dialogType': 'tips'
        }
      });
    } else {
      const variant = this.state.order.line_items[i];
      const prod = Track.formatProdItem(variant, variant.sku, variant.quantity);
      this.setState({
        'dialogOption': {
          'content': '',
          'dialogType': 'tips'
        },
        'order': json
      });
      AppActions.setCart(json.total_quantity);
      Track.ecRemoveFromCart(prod, prod.quantity, 'Cart'); // remove
    }
  };

  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['cart'];
    this.context.onSetTitle(compo.cart_title);
    return (
      <div className="Cart">
        <PopupSignup i18n={i18n}/>
        <Dialog {...this.state.dialogOption} />
        {(!this.state.order || !this.state.order.line_items || !this.state.order.line_items.length) ?
          <div className="Cart-empty">
            <i className="iconfont">&#xe62e;</i>
            <section className="info">
              <p className="text1">{compo.cart_is_empty}</p>
              <p className="url">
                <a href="/" onClick={Link.handleClick}>{common.shop_now}</a>
              </p>
            </section>
          </div>
          :
          <div className="module-container">

            <div className="Cart-title">
              <span className="item">
                <i className="iconfont">&#xe609;</i>
                <span>{compo.shopping_cart}</span>
              </span>
            </div>

            <ul className="Cart-ul">
              {this.state.order.line_items.map((item, i) => {
                return (
                  <li key={i} className="Cart-ul-li">

                    <div className="image">
                      <a href={'/products/' + item.variant.sku} onCLick={Link.handleClick}>
                        <img src={item.variant.image.mini_url}/>
                      </a>
                    </div>

                    <div className="text">
                      <span className="title">{item.variant.name}</span>
                      <span className="price" dangerouslySetInnerHTML={{__html: i18n.format(compo.price, item.price)}} />
                      <span className="color" dangerouslySetInnerHTML={{__html: i18n.format(compo.color_colon, item.variant.option_values[0].name)}} />
                    </div>

                    <div className="ctrl">
                      <div className="table">
                        <div className="quantity-name">{compo.cart_quantity}</div>
                        <div className="quantity">
                          <a className={'reduce_' + item.quantity}
                             onClick={this.quantitySet.bind(this, item.id, 'reduce', i)}>
                            <i className="iconfont">&#xe619;</i>
                          </a>
                          <input type="text" value={item.quantity} onChange={this.quantityInput.bind(this, i)} onBlur={this.quantitySet.bind(this, item.id, 'set', i)}/>
                          <a className={"add_" + item.quantity} onClick={this.quantitySet.bind(this, item.id, 'add', i)}>
                            <i className="iconfont">&#xe616;</i>
                          </a>
                        </div>

                        <div className="remove">
                          <i className="iconfont" onClick={this.variantDel.bind(this, item.id, i)}>&#xe63d;</i>
                        </div>
                      </div>
                    </div>

                  </li>
                );
              })}
            </ul>

            {this.state.order.line_items ?
              <div className="Cart-submit">
                <a onClick={this.address.bind(this)}>
                  <span className="total" dangerouslySetInnerHTML={{__html: i18n.format(compo.subtotal_colon, this.state.order.display_item_total)}} />
                  {compo.checkout}
                </a>
              </div>
              : ''}
          </div>
        }
      </div>
    );
  }
}

export default Cart;
