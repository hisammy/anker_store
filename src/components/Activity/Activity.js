/**
 * Created by shady on 15/6/29.
 */

import React, { PropTypes, Component } from 'react';
import moment from 'moment-timezone';
import styles from './Activity.scss';
import withViewport from '../../decorators/withViewport';
import withStyles from '../../decorators/withStyles';
import AppActions from '../../core/AppActions';
import Dialog from '../Dialog';
import Link from '../../utils/Link';
import Verify from '../../utils/Verify';
import Track from '../../utils/Track';
import Http from '../../core/HttpClient';
import Location from '../../core/Location';
import { FBShare, md5 } from '../../utils/Helper';

// @withViewport
@withStyles(styles)
class Activity extends Component {

  static propTypes = {
    data: PropTypes.object.isRequired
  };
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
    onSetMeta: PropTypes.func.isRequired
  };

  componentWillMount() {
    const data = this.props.data;
    data.items = data.activity_items || []; // 统一名称, 避免后台改了字段名, 前台要改N多地方
    // data.items = data.items.concat(data.items).concat(data.items); // clone for test
    const hasLogin = AppActions.getUser().token;
    data.items.map((item) => {
      item.quantity = 1;
      // if (!hasLogin) {item.promo_code = '';}
    });
    // console.log(data);
    delete data['activity_items'];
    // console.log(data);
    moment.tz.setDefault('PST8PDT'); // .format('YYYY-MM-DD HH:mm:ss Z z')
    this.setState({
      'login': hasLogin,
      'dialog_msg': '',
      'data': data,
    });
  }

  componentDidMount() {
    this.state.data.detail = this.props.data.detail.replace(/\r\n/g, '<br>');
    this.setState(this.state);
    this.fireTracking();
  }
  fireTracking() {
    Track.ecAddImpression(this.state.data.items, 'Activity');
    fbq('track', 'ViewContent');
    const user = AppActions.getUser();
    const hashedMail = user.invitation_code || md5(user.email);
    const items = this.state.data.items.map(o => o.variant.sku || o.variant.id);
    Track.criteoOneTag(hashedMail, {event: 'viewList', item: items});
  }

  addCart = async (i, event) => {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['activity'];
    event.preventDefault();
    let variant = this.state.data.items[i], p = this;
    let body = {
      'line_item': {
        'variant_id': variant.variant.id,
        'quantity': variant.quantity
      }
    };
    if (AppActions.getUser().order_id) {
      body['order_id'] = AppActions.getUser().order_id;
    }
    // return console.log(body);
    fbq('track', 'AddToCart');
    const json = await Http.post('POST', '/api/content?path=/api/orders/populate', body);
    // console.log(json);
    if (!!json.token && !!json.number) {
      AppActions.visitor(json);
      this.setState({
        'dialog_msg': compo.activity_added_to_cart,
      });
      AppActions.setCart(json.total_quantity);
      const prod = Track.formatProdItem(variant, variant.sku, variant.quantity);
      Track.ecAddToCart(prod, 1, 'Activity');
    } else {
      this.setState({
        'dialog_msg': json.error || json.exception,
      });
    }
  }

  prodClick(i, event) {
    Link.handleClick(event);
    Track.ecProdClick(this.state.data.items[i], 'Activity');
  }

  selectText(event) {
    const elem = event.target;
    // return console.log(elem);
    if (document.selection) {
      var range = document.body.createTextRange();
      range.moveToElementText(elem);
      range.select();
    } else if (window.getSelection) {
      var range = document.createRange();
      range.selectNode(elem);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
    }
  }

  share() {
    FBShare(location.href);
  }
  goLogin(event) {
    event.preventDefault();
    Location.push( '/login?back=' + location.pathname.slice(1) + location.search);
  }

  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['activity'];
    let title = this.state.data.title;
    this.context.onSetTitle(title);
    const fullUrl = this.props.origin + this.props.path;
    const data = this.props.data;
    this.context.onSetMeta("og:url", fullUrl);
    if (data) {
      this.context.onSetMeta("og:title", data.share_title);
      this.context.onSetMeta("og:description", data.share_content);
      this.context.onSetMeta("og:image", data.share_image && data.share_image.mini_url || '');
    }
    const banner = (data.detail_image || data.image);

    return (
      <div className="Activity">
        <Dialog content={this.state.dialog_msg}/>
        <div className="banner">
          <img src={banner ?  banner.large_url : ''}/>
        </div>
        <div className="Activity-container module-container">
          <div className="intro">
            <div className="text">
              <h1>{this.state.data.title}</h1>
              <div className="detail" dangerouslySetInnerHTML={{__html: this.state.data.detail}}/>
            </div>
          </div>
          <div className="share">
            <a className="item fb" onClick={this.share.bind(this)}>
              <i className="iconfont">&#xe657;</i>
              {compo.activity_share_facebook}
            </a>
          </div>

          <div className="prod-list">
            {this.state.data.items && this.state.data.items.length ?
              <ul className="clearfix wraper">
                {this.state.data.items.map((item, i) => {
                  const variant = item.variant || {};
                  const inAnkerStore = item.sell_platform == 'anker_store';
                  let isAvailable = variant.status === 'on_sale';
                  let notAvailable = variant.status === 'not_available';
                  let notOnSale = variant.status === 'not_on_sale'; // 不显示价格
                  if (!inAnkerStore) { // Amazon的sku没有状态
                    isAvailable = true;
                    notAvailable = false;
                    notOnSale = false;
                  }
                  // variant.discount
                  const link = !inAnkerStore ? item.market_url : `/products/${variant.sku}`;
                  return (
                    <li key={i} className="box">
                      <div key={i} className="item">
                        <span className="border"></span>
                        <a href={link} onClick={inAnkerStore && this.prodClick.bind(this, i)} target="_blank">
                          <div className="image">
                            <span className="tag-amazon"></span>
                            <span className="tag-sellout"></span>
                            {variant.images && variant.images.length ? <img src={variant.images[0].mini_url}/> : ''}
                            {notAvailable ?
                              <div className="available">{compo.activity_not_available}</div>
                            : ''}
                          </div>
                          <div className="title">{variant.name}</div>
                          <div className="description">{variant.description}</div>
                        </a>
                      </div>
                      <div className="actions">
                        {notOnSale ? '' :
                          item.price && item.deal_price && item.deal_price !== item.price ?
                            <div className="price">
                              <p className="paid">
                                ${parseFloat(item.deal_price).toFixed(2)}
                              </p>
                              <p className="original">
                                ${parseFloat(item.price).toFixed(2)}
                              </p>
                            </div> :
                            <div className="price">
                              <div className="paid">
                              {!item.price ? '\u00a0':
                                <span>${parseFloat(item.deal_price || item.price).toFixed(2)}</span>
                              }
                              </div>
                            </div>
                        }
                        <div className="info clearfix">
                          {!this.state.login ?
                            <p>
                              {compo.activity_promo_code}:&nbsp;
                              <a className="link" href="/login" onClick={this.goLogin.bind(this)}>{compo.activity_please_login_first}</a>
                            </p>
                            :
                            item.promo_code ?
                              <p>
                              {compo.activity_promo_code}:&nbsp;
                              {isAvailable ?
                                <i className="code" onClick={this.selectText.bind(this)}>
                                {item.promo_code}
                                </i>
                                :
                                notAvailable ? compo.activity_unavailable : ''}
                                </p>
                                : <p>&nbsp;</p>
                          }
                          {item.start_at ?
                            <p>
                              {i18n.format(compo.activity_date_format, moment(item.start_at).format('MM/DD HH:mm'), moment(item.end_at).format('MM/DD HH:mm (z)'))}
                            </p>
                            : <p>&nbsp;</p>
                          }
                        </div>
                        {inAnkerStore ?
                          isAvailable ?
                            <p className="action" onClick={this.addCart.bind(this, i)}>{compo.activity_add_to_cart}</p>
                            :
                            <p className="disable action">
                              {notAvailable ? 'Not Available' : ''}
                            </p>
                          :
                          <a className="action amazon" href={item.market_url} target="_blank">{compo.activity_buy_at_amazon}</a>
                        }
                      </div>
                    </li>
                  );
                })}
              </ul>
              : ''
            }
          </div>
        </div>
        <div className="space-100"></div>
      </div>
    );
  }
}

export default Activity;
