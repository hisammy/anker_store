/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { PropTypes, Component} from 'react';
import AppActions from '../../core/AppActions';
import Location from '../../core/Location';
import styles from './Orders.scss';
import withStyles from '../../decorators/withStyles';
import Menber from '../Member/Member.js';
import Verify from '../../utils/Verify';
import Http from '../../core/HttpClient';

@withStyles(styles)
class Orders extends Component {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  componentWillMount() {
    this.setState({
      'screenH': '350px',
      'orders': this.props.data ? this.props.data.orders : []
    });
  }

  componentDidMount() {
    this.setState({
      'screenH': screen.height * .73 + 'px'
    });
  }

  goOderDetail(number, token) {
    AppActions.tempOrderToken(token);
    Location.push( '/orders/' + number + "?his=1");
  }

  reload() {
    location.reload();
  }

  go = async () => {
    const json = await Http.post('get', '/api/content?path=/api/orders/history_order&page=' + (parseInt(this.props.data.current_page) + 1) + '&per_page=20')
    this.state.orders = this.state.orders.concat(json.orders);
    this.props.data.current_page = json.current_page;
    this.setState(this.state);
  };

  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['orders'];
    this.context.onSetTitle(compo.orders_title);
    return (
      <div className="Orders">
      <Menber i18n={i18n} data="orders" />
        <div className="Orders-container">
          <ul>
            {this.state.orders.map((item) =>  {
              var orderStatus = item.state === 'canceled' ? compo.orders_cancelled_order
               : (!item.paid ? compo.orders_awaiting_payment
                : (!item.take_delivery ? compo.orders_awaiting_delivery_confirmation
                 : (item["reviewed?"] === false ? compo.orders_awaiting_feedback : compo.orders_complete)
               ));
              //  console.log(item.number, item.paid, item.take_delivery, item["reviewed?"]);
              return (
                <li className={(item.state === 'canceled' || item["reviewed?"]) ? "completeLi" : ""}>
                  <div className={(item.state === 'canceled' || item["reviewed?"]) ? "Orders-status complete" : "Orders-status"}>{ orderStatus}</div>
                    <ul>
                    {
                      item.line_items.map((imgItem, i) => {
                        return (
                          <li>
                           {i < 3 ?
                            <div className="itemDiv">
                              <div className="itemImg"><img src={ imgItem.variant.image.mini_url}/> </div>
                              <div className="itemContent">
                                <div>{imgItem.variant.name}</div>
                                <div dangerouslySetInnerHTML={{__html: i18n.format(compo.color_colon, imgItem.variant.option_values[0].name)}}/>
                                <div dangerouslySetInnerHTML={{__html: i18n.format(compo.quantity_colon, imgItem.quantity)}}/>
                              </div>
                              <div className="price"><stong>{imgItem.display_amount}</stong></div>
                            </div>
                            : (i == 3 ? <div className="more">{i18n.format(compo.orders_n_items, 3)}</div> :'')}
                          </li>
                        )
                      })
                    }
                    </ul>
                    <div className="orderDetail">
                      <div className="orderId">{i18n.format(compo.order_id_colon, item.number)}</div>
                      <div>{i18n.format(compo.order_date_colon, Verify.dateFormat(new Date(item.completed_at)))}</div>
                      <div>{i18n.format(compo.order_total_colon, item.display_total)}</div>
                      <div className="viewDetail">
                        <a onClick={this.goOderDetail.bind(this, item.number, item.token)}>{compo.orders_view_details}</a>
                      </div>
                    </div>
                </li>
              );
            })}
          </ul>
          {
            this.state.orders.length==0 ?
              <div className="empty">
                <i className="iconfont">&#xe63c;</i>
                <div>{common.could_not_find_anything}</div>
              </div>
            :''
          }
          {
            (this.props.data && this.props.data.pages > parseInt(this.props.data.current_page)) ?
              <div className="more"><a className="loadMore" onClick={this.go.bind(this)}>{common.load_more}</a></div> : ''
          }
        </div>
      </div>
    );
  }
}
export default Orders;
