/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { PropTypes, Component} from 'react';
import styles from './Shipping.scss';
import withStyles from '../../decorators/withStyles';
import AppActions from '../../core/AppActions';
import Menber from '../Member/Member.js';

@withStyles(styles)
class Shipping extends Component {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  componentWillMount() {
    this.setState({
      packageDetail: {line_items: [], tracking_info: []}
    });
  }

  componentDidMount() {
    this.setState({
      packageDetail: JSON.parse(localStorage.getItem("shipping")) || {line_items: [], tracking_info: []},
      index: AppActions.getUrlParam("index")
    });
  }
  cancel(){
    Location.push( '/orders/' + this.state.packageDetail.number + "?his=1");
  }
  backOrderList(){
    Location.push( '/orders/');
  }
  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['shipping'];
    this.context.onSetTitle(compo.shipping_title);
    return (
      <div className="Shapping">
        <Menber i18n={i18n} data="orders" />
        <div className="orderDetail">
          <div className="orderPath">
            <a onClick={this.backOrderList.bind(this)}>{compo.orders_orders}</a><span> > </span>
            <a onClick={this.cancel.bind(this)}>{i18n.format(compo.orders_order, this.state.packageDetail.number)}</a>
          </div>
          <div className="package">
            <strong>
            {i18n.format(compo.delivery_method_colon, this.state.packageDetail.shipping_methods ? this.state.packageDetail.shipping_methods[0].name : '')}
            </strong>
          </div>
          <ul className="orderItem">
            {this.state.packageDetail.line_items.map(function(item) {
              return (
                <li>
                  <img src={ item.variant.image.mini_url} />
                  <div className="orderInfo">
                    <div>{item.variant.name}</div>
                    <div>{i18n.format(compo.color_colon, item.variant.option_values[0].name)}</div>
                    <div>{i18n.format(compo.quantity_colon, item.quantity)}</div>
                  </div>
                  <div className="price"><span className="count">{item.display_amount}</span></div>
                </li>
              );
            }, this)}
          </ul>
          <div className="tracking_info">
            {this.state.packageDetail.tracking_info.map((item, i) =>  {
              return (
                <div>
                  <span >{item.event}</span>
                  <span className="time">{item.datetime}</span>
                  <span>{item.location}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default Shipping;
