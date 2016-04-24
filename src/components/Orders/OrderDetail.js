/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { PropTypes, Component} from 'react';
import AppActions from '../../core/AppActions';
import Location from '../../core/Location';
import Http from '../../core/HttpClient';
import styles from './OrderDetail.scss';
import withStyles from '../../decorators/withStyles';
import Review from './Review';
import Dialog from '../Dialog';
import Verify from '../../utils/Verify';
import Track from '../../utils/Track';
import Menber from '../Member/Member.js';
import Link from '../../utils/Link';

@withStyles(styles)
class OrdersDetail extends Component {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  componentWillMount() {
    this.setState({
      'orderDetail': this.props.data || {shipments:[],adjustments:[],bill_address:{}},
      'dialogOption':{}
    });
  };

  componentDidMount() {
    this.line_status = [];
    this.state.orderDetail.shipments.map((item) =>  {
      this.line_status.push(item.confirm_delivery ? 1 : 0);
    });
    this.setState({
      email: AppActions.getUser().email,
      'dialogOption':{close:this.closeDialog.bind(this)}
    });
    localStorage.setItem('orderTime', Verify.dateFormat(this.state.orderDetail.completed_at));
  };

  receiveDialog(shipment_number, index,shipment_id) {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['orders'];
    this.state.dialogOption = {
      'title' : compo.orders_order_received_title,
      'dialogType' : 'confirm',
      'content' : compo.orders_order_received_desc,
      'buttons' : <div>
        <a className="button normalBtn" onClick={this.closeDialog.bind(this)} id="aCancelBtn">{common.no}</a>
        <a className="button deepButton" onClick={this.receive.bind(this,shipment_number, index, shipment_id)} id="aConfirmBtn">{common.yes}</a>
      </div>,
    }
    this.setState(this.state);
  };

  receive = async (shipment_number, index,shipment_id) => {
    const json = await Http.post('PUT', '/api/content?path=/api/orders/' + this.state.orderDetail.number + '/confirm_delivery', {his: 1,order_id:this.state.orderDetail.number, shipment_number: shipment_number})
    if (json.order) {
      this.state.orderDetail.shipments[index].confirm_delivery = true;
      this.line_status[index] = 1;
      this.review(shipment_id);
    } else {
      this.state.dialogOption = {
        'dialogType' : 'tips',
        'content' : json,
        'buttons':''
      }
      this.setState(this.state);
    }
  };

  review(shipment_id) {
    Location.push( '/review?his=1&number=' + this.state.orderDetail.number + '&shipment_id=' + shipment_id);
  };

  shipping(index) {
    localStorage.setItem('shipping', JSON.stringify(this.state.orderDetail.shipments[index]));
    Location.push( '/shipping?index=' + (index + 1));
  };

  paypalSubmit = async () => {
    localStorage.setItem('order_price', this.props.data.total);
    let body = {
      'order_id': this.state.orderDetail.number,
      'order_token': this.state.orderDetail.token,
      'his': 1
    };
    fbq('track', 'AddPaymentInfo');
    Track.saveEcPurchase(this.props.data.line_items, {
      'id': this.props.data.number,
      'revenue': this.props.data.total,
      'shipping': this.props.data.shipment_total,
      'tax': this.props.data.tax_total
    });
    const json = await Http.post('post', '/api/content?path=/api/payments/paypal_create_button', body)
    if (json.result === 'success') {
      let paypal = decodeURIComponent(json.content);
      let link = paypal.slice(paypal.indexOf('EMAILLINK=')).replace('EMAILLINK=', '')
        + '&custom=' + body.order_id + ',web'
        + '&invoice=' + body.order_id;
      AppActions.loading(false);
      location.href = link;
    } else {
       this.state.dialogOption = {
        'dialogType' : 'tips',
        'content' : json,
        'buttons':''
      }
      this.setState(this.state);
    }
  };

  closeDialog(event) {
    this.state.dialogOption.content = '';
    this.setState(this.state);
  };

  cancelOrderDialog() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['orders'];
    this.state.dialogOption = {
      'title' : compo.orders_cancel_order_title,
      'dialogType' : 'confirm',
      'content' : compo.orders_cancel_order_desc,
      'buttons' : <div>
        <a className="button normalBtn" onClick={this.closeDialog.bind(this)} id="aCancelBtn">{common.no}</a>
        <a onClick={this.cancelOrder.bind(this)} className="button deepButton" id="aConfirmBtn">{common.yes}</a>
      </div>,
    }
    this.setState(this.state);
  };

  cancelOrder = async () =>{
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['orders'];
    const json = await Http.post('put', '/api/content?path=/api/orders/' + this.state.orderDetail.number + '/cancel', {'his': 1,'order_id' : this.state.orderDetail.number});
    if (json.id) {
       this.state.dialogOption = {
        'dialogType' : 'success',
        'content' : compo.orders_cancel_order_success,
        'buttons':''
      }
      this.setState(this.state);
      Location.push( '/orders');
    }
  };

  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['orders'];
    this.context.onSetTitle(compo.orders_title);
    const orderDetail = this.state.orderDetail;
    const shipAddress = orderDetail.ship_address;
    return (
      <div className="OrderDetail">
        <Menber i18n={i18n} data="orders" />
        <Dialog {... this.state.dialogOption} />
        {
          orderDetail.number ?
        <div className="OrderDetail-container">
          <div className="orderPath">
            <a href="/orders" onClick={Link.handleClick}>{compo.orders_orders}</a> >
            {i18n.format(compo.orders_orders, orderDetail.number)}
          </div>
          <div className="info">
            <div className="information">{compo.orders_term_order}</div>
            <div className="orderStatus">
              <a>
              {i18n.format(compo.status_colon,
                orderDetail.state === 'canceled' ? compo.orders_cancelled_order
                  : (!orderDetail.paid ? compo.orders_awaiting_payment
                    : (!orderDetail.take_delivery ? compo.orders_awaiting_delivery_confirmation
                      : (orderDetail["reviewed?"] === false ? compo.orders_awaiting_feedback : compo.orders_complete)
                      )
                    )
              )}
              </a>
            </div>
          </div>
          <hr />
          <div className="orderDesc">
            <div>{i18n.format(compo.order_id_colon, orderDetail.number)}</div>
            <div>{i18n.format(compo.order_date_colon, Verify.dateFormat(orderDetail.completed_at))}</div>
            <div>{i18n.format(compo.order_total_colon, orderDetail.display_total)}</div>
            {!orderDetail.paid ? '' :
              <div>
                {i18n.format(compo.payment_method_colon, (!orderDetail.payments || orderDetail.payments.length==0) ? compo.orders_free : orderDetail.payments[0].payment_method.name)}
              </div>}

          </div>
          <h4><strong>{compo.orders_term_item}</strong></h4>
          <hr/>
          <div className="orderDetailList">
            {
            orderDetail.shipments.map(function(item, i){
              return (<div>
                <div className="package title">
                  <div>
                    {i18n.format(compo.delivery_method_colon, item.is_backordered ? compo.orders_pre_order : item.shipping_methods[0].name)}
                  </div>
                  <div>{item.confirm_delivery ? <a href="javascript:;" onClick={this.review.bind(this,item.id)}>{item.reviews_count === 0 ? compo.orders_write_review : compo.orders_check_review}</a> : ''}</div>
                  <div>{item.tracking ? <a href="javascript:;" onClick={this.shipping.bind(this, i)}>{compo.orders_check_shipment}</a> : ''}</div>
                  <div>{(item.tracking && !item.confirm_delivery) ? <a  href="javascript:;" onClick={this.receiveDialog.bind(this, item.number, i,item.id)}>{compo.orders_confirm_receipt}</a> : ''}</div>
                </div>
                  <ul className="orderItem">
                    {item.line_items.map(function(item) {
                      return (
                        <li>
                          <img src={ item.variant.image.mini_url} />
                          <div className="orderInfo">
                            <div>{item.variant.name}</div>
                            <div dangerouslySetInnerHTML={{__html: i18n.format(compo.color_colon, item.variant.option_values[0].name)}}/>
                            <div dangerouslySetInnerHTML={{__html: i18n.format(compo.quantity_colon, item.quantity)}}/>
                          </div>
                          <div className="price"><span className="count">{item.display_amount}</span></div>
                        </li>
                      );
                    }, this)}
                  </ul>
                </div>
                );
            }, this)
          }
          </div>
          <h4><strong>{compo.orders_term_shipping_address}</strong></h4>
          <hr/>
          <div className="addressInfo">
            <p>{shipAddress.firstname} {shipAddress.lastname}</p>
            <p>{i18n.format(compo.phone_number_colon, shipAddress.phone)}</p>
            <p>
              {i18n.format(compo.address_colon, [
                shipAddress.address1, shipAddress.address2, shipAddress.city, shipAddress.state && shipAddress.state.name, compo.default_country_abbr
              ].filter(o=>!!o).join(', '))}
            </p>
            <p>{i18n.format(compo.zip_code_colon, shipAddress.zipcode)}</p>
          </div>
          {orderDetail.applied_coupon ?
            <div><h4>{compo.orders_term_promotion}</h4><hr/><div className="coupon">{orderDetail.applied_coupon.name}</div></div>
          :''}
          <div className="priceList">
            <div>{i18n.format(compo.subtotal_colon, orderDetail.display_item_total)}</div>
            <div>{i18n.format(compo.shipping_colon, orderDetail.display_ship_total)}</div>
            <div>{i18n.format(compo.taxes_colon, orderDetail.display_tax_total)}</div>
            <div className="taxes">
              {orderDetail.adjustments.map((item, i) =>{
                return (
                  <div><span>{item.label}: </span><span>{item.amount}</span></div>
                )
              })}</div>
            <div className="total">
              <strong>{i18n.format(compo.total_colon, orderDetail.display_total)}</strong>
            </div>
            {
              !orderDetail.paid && orderDetail.state !=='canceled' ?
                <div className="btnList">
                <a className="btn payMent" onClick={this.paypalSubmit.bind(this)}>{compo.orders_complete_purchase}</a>
                <a className="btn cancelBtn" onClick={this.cancelOrderDialog.bind(this)}>{common.cancel}</a>
              </div>:''
            }
          </div>
        </div>
        :''}
      </div>
    );
  }
}

export default OrdersDetail;
