/**
 * Created by Leon on 2015-11-23 11:04:40
 */

import React, { PropTypes, Component } from 'react';
import styles from './ReturnExchange.scss';
import withStyles from '../../decorators/withStyles.js';
import classNames from 'classnames';
import AppActions from '../../core/AppActions';
import Location from '../../core/Location';
import Link from '../../utils/Link';
import Cookie from '../../utils/Cookie';
import Http from '../../core/HttpClient';
import Verify from '../../utils/Verify'
import ServiceNav from './ServiceNav';
// import Dialog from '../../utils/Dialog';
import Dialog from '../Dialog';

@withStyles(styles)
class ReturnExchange extends Component {

  static propTypes = {
    // data: PropTypes.object.isRequired,
  };
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  componentWillMount() {
    const data = this.props.data || {};
    const orders = data.orders || [];
    // console.log(data);
    const user = AppActions.getUser();
    // console.log(user);
    let hashmap = {};
    orders.map((o) => {
      hashmap[o.id] = o;
    });
    // console.log(orders);
    this.setState({
      'unauthorized': 'Unauthorized' == data.message, // 401 token过期
      'dialog_msg': '', // 提示信息
      // 'country': data.country_code || Cookie.load('country') || 'US',
      'countrys': [data.country_code, Cookie.load('country')], // US 用户才选Anker Store
      'cached_preferences': data.preference || ['Refund', 'Exchange'],
      'cached_problems': data.problem || [],
      'anker': {
        'captcha': '',
        'order_id': '', // 选中的orderID
        'email': user.email,
        'name': user.nick_name,
        'line_items': [], // 选中的orderID里的商品列表
        'other': '',
        'orders': orders, // 获取的订单
        'products': [],
        'cached_orders': hashmap, // hash后的订单信息
      },
      'amazon': {
        'captcha': '',
        'order_id': '',
        'email': user.email,
        'name': user.nick_name,
        'source': '',
        'specification': '',
        'products': [
          {
            name: '',
            series_no: '',
            preference: '',
            problem: '',
          }
        ],
        'cached_sources': data.source || [],
      },
    });
  }

  componentWillReceiveProps(nextProps) {
  }

  componentDidMount() {
    if (!this.props.data) {
      AppActions.loading(false);
      return;
    }
    this.loadAttachs('anker');
    this.loadAttachs('amazon');
    this.getCaptchaCode('anker');
    this.getCaptchaCode('amazon');
  }

  rmaSubmit = async (type, event) => {
    event.preventDefault();
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['support'];
    // console.log(type, this.refs);
    const data = this.state[type];
    let api = '';
    let formData = {};
    let missing = {}; // 缺少必填
    // 公共字段
    formData.order_id = data.order_id;
    formData.name = data.name;
    formData.email = data.email;
    formData.captcha_key = data.captcha_code;
    formData.captcha = data.captcha;
    formData.products = data.products.filter((p) => {
      if (!p.preference) return false;
      // validation
      if (!p.problem) missing.problem = true;
      return p;
    });
    if ('amazon' == type && data.products && !data.products[0].name) {
      missing.name = true;
    }
    const attachs = data.attachs || [];
    const attachMsg = attachs.length > 0 ? '\nImages:\n' + attachs.map(o=>o.url).join('\n') : '';
    if ('anker' == type) {
      api = '/api/rma/rma_store';
      formData.other = data.other + attachMsg;
    } else if('amazon' == type) {
      api = '/api/rma/rma_amazon';
      formData.source = data.source;
      formData.specification = data.specification + attachMsg;
    }
    // return console.log(formData);
    // validation
    if ('anker' == type) {
    } else if('amazon' == type) {
      if (!formData.source) {
        return this.setState({
          dialog_msg: compo.exchange_fill_purchase_site, //Please fill in the field:
        });
      }
    }
    // console.log(missing);
    if(!formData.email || !Verify.isEmail(formData.email)) {
      return this.setState({
        dialog_msg: common.fill_email,
      });
    } else if(!formData.name) {
      return this.setState({
        dialog_msg: compo.exchange_fill_name,
      });
    }else if (!formData.order_id) {
      return this.setState({
        dialog_msg: compo.exchange_fill_order_number,
      });
    } else if('amazon' == type && missing.name) {
      return this.setState({
        dialog_msg: compo.exchange_fill_product_name,
      });
    } else if(formData.products.length < 1) {
      return this.setState({
        dialog_msg: compo.exchange_fill_preference,
      });
    } else if(missing.problem) {
      return this.setState({
        dialog_msg: compo.exchange_fill_problem,
      });
    } else if(!formData.captcha) {
      return this.setState({
        dialog_msg: common.fill_captcha,
      });
    }
    // return console.log('post', formData);
    const json = await Http.post('post', `/api/content?path=${api}`, formData);
    // console.log('post', formData, json);
    const error = json && (json.error || json.exception);
    if (error) {
      this.setState({
        dialog_msg: error,
      });
      this.getCaptchaCode(type); // 自动刷新验证码
    } else { // success
      localStorage.removeItem(`rma_images_${type}`);
      this.setState({
        dialog_msg: compo.exchange_request_success,
      });
      this.resetForm(type);
    }
  }
  resetForm(type, event) {
    if(event) event.preventDefault();
    // console.log('reset', type);
    let data = this.state[type];
    // 公共字段
    data.order_id = '';
    data.name = '';
    data.email = '';
    data.captcha = '';
    data.attachs = [];
    if ('anker' == type) {
      data.line_items = [];
      data.other = '';
    } else if('amazon' == type) {
      data.source = '';
      data.specification = '';
      data.products = [{
        name: '',
        series_no: '',
        preference: '',
        problem: '',
      }];
      this.setState({
        attachs: [],
      });
    }
    // console.log(data);
    this.setState(this.state);
  }
  getCaptchaCode = async (type, event) =>{
    const api = '/api/users/obtain_captcha';
    const json = await Http.post('get', `/api/content?path=${api}`);
    let data = this.state[type];
    if (json.captcha_code) {
      data.captcha = '';
      data.captcha_url = json.captcha_url;
      data.captcha_code = json.captcha_code;
      this.setState(this.state);
    }
  }
  changeAnkerOrder(event) {
    var orderID = event.target.value;
    // console.log(event.target.selectedOptions); // not work IE11?
    // console.log([...event.target.options].filter(o => o.selected).map(o => o.value));
    const items = orderID ? this.state.anker.cached_orders[orderID].line_items : [];
    // console.log(orderID, items);
    this.state.anker.products = items.map((o) => {
      return {
        'line_item_id': o.id,
        'name': o.name,
        'quantity': o.quantity,
        'preference': '',
        'problem': '',
        'series_no': '',
      };
    });
    // console.log(this.state.anker.products);
    this.state.anker.order_id = orderID;
    this.state.anker.line_items = items;
    this.setState(this.state);
  }
  changeNormalValue(type, event) { // 普通的表单值更改(input/textarea/select)
    const elem = event.target;
    let data = this.state[type];
    // console.log(type, elem.name, elem.value);
    data[elem.name] = elem.value;
    this.setState(this.state);
  }
  changeProd(type, i, event) {// 更改anker/amazob产品状态
    const elem = event.target;
    // console.log(type, i, elem.name, elem.value);
    let data = this.state[type];
    data.products[i][elem.name] = elem.value;
    if ('anker' == type && 'preference' == elem.name) { // anker store自动勾选
      data.line_items[i].selected = elem.value ? true : false;
    }
    this.setState(this.state);
    // console.log(data.products);
  }
  selectProd(i, event) {
    // event.preventDefault();
    const elem = event.target;
    // console.log(i, elem.name, elem.value, elem.checked);
    let data = this.state.anker;
    data.line_items[i].selected = elem.checked;
    if (!elem.checked) {
      data.products[i].preference = '';
      // data.products[i].problem = '';
    }
    this.setState(this.state);
  }
  closeDialog(event) {
    this.setState({
      dialog_msg: '',
    });
  }
  range(n = 0) {
    n = parseInt(n);
    let ret = Array.from(Array(n+1).keys());
    ret.shift();
    return ret; //reverse()
  }
  loadAttachs(type) {
    let data = this.state[type];
    const images = localStorage.getItem(`rma_images_${type}`);
    data.attachs = images ? JSON.parse(images) : [];
    this.setState(this.state);
  }
  uploadAttach(type, event) {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['support'];
    const file = event.target.files[0];
    const self = this;
    let data = this.state[type];
    let attachs = data.attachs || [];
    // console.log(file);
    if(file.type.indexOf('image') === -1) {
      this.setState({
        dialog_msg: compo.exchange_file_format_error,
      });
      return;
    }
    if(file.size > (1024 * 1024 * 5)) {
      this.setState({
        dialog_msg: compo.exchange_file_size_error,
      });
      return;
    }
    AppActions.loading(true);
    var fd = new FormData();
    fd.append('attach_key', 'picture');
    fd.append('fileName', file);
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function(evt) {
      // console.log(evt);
      AppActions.loading(false);
      var file = JSON.parse(evt.target.responseText);
      // console.log(evt.target.status, file);
      if (!file || !file.id) {
        if(evt.target.status === 401){
          location.href = '/login?back=' + location.pathname.slice(1);
        }else{
          self.uploadFailed();
        }
      } else {
        attachs.push(file);
        localStorage.setItem(`rma_images_${type}`, JSON.stringify(attachs));
        self.setState(self.state);
      }
    }, false);
    xhr.addEventListener('error', this.uploadFailed, false);
    xhr.open('POST', '/api/file?path=/api/rma/upload_attachment');
    xhr.send(fd);
  }
  uploadFailed(evt) {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['support'];
    AppActions.loading(false);
    this.setState({
      dialog_msg: compo.exchange_upload_fail,
    });
  }
  deleteAttach = async (type, i, event) => {
    let data = this.state[type];
    let attachs = data.attachs || [];
    const attach = attachs[i];
    AppActions.loading(true);
    const json = await Http.post('DELETE', '/api/content?path=/api/rma/delete_attachment', {attachment_id: attach.id});
    AppActions.loading(false);
    const error = json && (json.error || json.exception);
    if (error) {
      this.setState({
        dialog_msg: error,
      });
    } else { // success
      attachs.splice(i, 1);
      localStorage.setItem(`rma_images_${type}`, JSON.stringify(attachs));
      this.setState(this.state);
    }
  }

  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['support'];
    this.context.onSetTitle(compo.exchange_title);
    // console.log(this.state.countrys);
    return this.state.unauthorized ? <div className="Empty"></div> : (
      <div className="ReturnExchange">
        <Dialog content={this.state.dialog_msg} close={this.closeDialog.bind(this)} />
        <div className="Banner-container">
          <div className="module-container banner">
            <img className="img" src={require('../../public/support/banner.jpg')} />
            <div className="text">
              <h2>{compo.exchange_banner_title}</h2>
              <div className="info" dangerouslySetInnerHTML={{__html: compo.exchange_banner_desc}}/>
            </div>
          </div>
        </div>
        <ServiceNav {...{"support_nav": compo.support_nav}}/>
        <div className="module-container">
          {-1 !== this.state.countrys.indexOf('US') &&
          <dl>
            <dt>
              <i className="anker"></i>
              {compo.exchange_anker_store}
            </dt>
            <dd>
              <form action="" onSubmit={this.rmaSubmit.bind(this, 'anker')}>
                <h4>{compo.exchange_contact_info}</h4>
                <p className={"input-normal " + (this.state.anker.email ? 'fill' : '')}>
                  <span className="placeholder">{compo.exchange_input_email}<i className="required-flag">*</i></span>
                  <input type="email" name="email" className="large" onChange={this.changeNormalValue.bind(this, 'anker')} value={this.state.anker.email} />
                </p>
                <p className={"input-normal " + (this.state.anker.name ? 'fill' : '')}>
                  <span className="placeholder">{compo.exchange_input_name}<i className="required-flag">*</i></span>
                  <input type="text" name="name" className="large" onChange={this.changeNormalValue.bind(this, 'anker')} value={this.state.anker.name} />
                </p>
                <p className="line"></p>
                <h4>{compo.exchange_order_details}</h4>
                <p className={"input-normal " + (this.state.anker.order_id ? 'fill' : '')}>
                  <span className="placeholder">{compo.exchange_please_select}<i className="required-flag">*</i></span>
                  <select name="order" className="large" onChange={this.changeAnkerOrder.bind(this)} value={this.state.anker.order_id}>
                    <option value=""></option>
                    {this.state.anker.orders.map((item, i) => {
                      return (
                        <option value={item.id} key={item.id}>
                          {i18n.format(compo.exchange_order_id, item.number)} ({Verify.dateFormat(item.completed_at, 'MM/dd/yyyy hh:mm')})
                        </option>
                      );
                    })}
                  </select>
                </p>
                <div className="prods">
                  {this.state.anker.line_items.map((item, i) => {
                    let p = this.state.anker.products[i];
                    // console.log(item, p);
                    return (
                      <div key={i}>
                        <p className="prod-name">
                          <label>
                            <input type="checkbox" onChange={this.selectProd.bind(this, i)} checked={item.selected} />
                            {item.name}
                          </label>
                        </p>
                        <ul key={i}>
                          {/*<li className="name">
                            <input type="checkbox" disabled={!!p.preference ? false : true} checked={!!p.preference}/>
                            {item.name}
                          </li>*/}
                          <li className="preference">
                            <p className={"input-normal " + (p.preference ? 'fill' : '')}>
                              <span className="placeholder">{compo.exchange_input_exchange}<i className="required-flag">*</i></span>
                              <select name="preference" onChange={this.changeProd.bind(this, 'anker', i)} value={p.preference}>
                                <option value=""></option>
                                {this.state.cached_preferences.map((preference, i) => {
                                  return (
                                    <option value={preference} key={i}>
                                      {preference}
                                    </option>
                                  );
                                })}
                              </select>
                            </p>
                          </li>
                          <li className="quantity">
                            <p className={"input-normal " + (p.quantity ? 'fill' : '')}>
                              <span className="placeholder">{compo.exchange_input_quantity}<i className="required-flag">*</i></span>
                              <select name="quantity" onChange={this.changeProd.bind(this, 'anker', i)} value={p.quantity}>
                                {this.range(item.quantity).reverse().map((v, i) => {
                                  return (
                                    <option value={v} key={i}>{v == item.quantity ? 'All' : v}</option>
                                  );
                                })}
                              </select>
                            </p>
                          </li>
                          <li className="problem">
                            <p className={"input-normal " + (p.problem ? 'fill' : '')}>
                              <span className="placeholder">{compo.exchange_input_problem}<i className="required-flag">*</i></span>
                              <select name="problem" onChange={this.changeProd.bind(this, 'anker', i)} value={p.problem}>
                                <option value=""></option>
                                {this.state.cached_problems.map((problem, i) => {
                                    return (
                                      <option value={problem} key={i}>
                                        {problem}
                                      </option>
                                    );
                                  })}
                              </select>
                            </p>
                          </li>
                          <li className="series-no">
                            <p className="table">
                              <span className="label-sn cell">{compo.exchange_series_no}</span>
                              <span className={"input-normal cell " + (p.series_no ? 'fill' : '')}>
                                <span className="placeholder">{compo.exchange_series_no_tip}</span>
                                <input type="text" name="series_no" onChange={this.changeProd.bind(this, 'anker', i)} value={p.series_no} />
                              </span>
                            </p>
                          </li>
                        </ul>
                      </div>
                    );
                  })}
                </div>
                <p className="line"></p>
                <h4>{compo.exchange_issue_details}</h4>
                <p>
                  <textarea name="other" className="large" onChange={this.changeNormalValue.bind(this, 'anker')} value={this.state.anker.other || ''} />
                </p>
                <div className="images">
                  <h4>{compo.exchange_images}</h4>
                  {!this.state.anker.attachs ? '' : this.state.anker.attachs.map((item, i) => {
                      // console.log(i, item);
                      return(
                        <i key={i} className="item">
                          <i className="img" style={{backgroundImage: `url(${item.url})`}}></i>
                          <b className="iconfont close" onClick={this.deleteAttach.bind(this, 'anker', i)}>&#xe642;</b>
                        </i>
                      );
                  })}
                  {(!this.state.anker.attachs || this.state.anker.attachs.length < 5) ?
                    <i className="up-box">
                      <button type="button" className="iconfont item">&#xe616;</button>
                      <input type="file" accept="image/gif,image/png,image/jpg,image/bmp,image/jpeg" multiple="multiple" capture="camera" onChange={this.uploadAttach.bind(this, 'anker')} />
                    </i>
                  : ''}
                </div>
                <div className="captcha-box">
                  <span className={"input-normal captcha " + (this.state.anker.captcha ? 'fill' : '')}>
                    <span className="placeholder">{common.verification_code_placeholder}</span>
                    <input name="captcha" ref="captcha" autoComplete="off" onChange={this.changeNormalValue.bind(this, 'anker')} value={this.state.anker.captcha} />
                  </span>
                  <img className="captcha-img" src={this.state.anker.captcha_url} onClick={this.getCaptchaCode.bind(this, 'anker')} />
                  <p>
                    <button type="submit" className="button-normal submit">{common.submit}</button>
                    <button type="reset" className="button-normal reset" onClick={this.resetForm.bind(this, 'anker')}>{common.reset}</button>
                  </p>
                </div>
              </form>
            </dd>
          </dl>
          }
          <dl className="rma-amazon">
            <dt>
              <i className="amazon"></i>
              {compo.exchange_amazon_store}
            </dt>
            <dd>
              <form action="" onSubmit={this.rmaSubmit.bind(this, 'amazon')}>
                <div className="source">
                  <h4 className="dib">{compo.exchange_amazon_purchase_site}</h4>
                  <i className="clearfix fr">
                    {this.state.amazon.cached_sources.map((s, i) => {
                      return (
                        <label key={i}>
                        <input type="radio" name="source" value={s.value} onChange={this.changeNormalValue.bind(this, 'amazon')} checked={this.state.amazon.source == s.value}/> {s.name}
                        </label>
                      );
                    })}
                  </i>
                </div>
                <p className="line"></p>
                <h4>{compo.exchange_contact_info}</h4>
                <p className={"input-normal " + (this.state.amazon.email ? 'fill' : '')}>
                  <span className="placeholder">{compo.exchange_input_email}<i className="required-flag">*</i></span>
                  <input type="email" name="email" className="large" onChange={this.changeNormalValue.bind(this, 'amazon')} value={this.state.amazon.email} />
                </p>
                <p className={"input-normal " + (this.state.amazon.name ? 'fill' : '')}>
                  <span className="placeholder">{compo.exchange_input_name}<i className="required-flag">*</i></span>
                  <input type="text" name="name" className="large" onChange={this.changeNormalValue.bind(this, 'amazon')} value={this.state.amazon.name} />
                </p>
                <p className="line"></p>
                <h4>{compo.exchange_order_details}</h4>
                <p className={"input-normal " + (this.state.amazon.order_id ? 'fill' : '')}>
                  <span className="placeholder">{compo.exchange_input_orderid}<i className="required-flag">*</i></span>
                  <input type="text" name="order_id" className="large" onChange={this.changeNormalValue.bind(this, 'amazon')} value={this.state.amazon.order_id} />
                </p>
                {this.state.amazon.products.map((item, i) => {
                  return (
                  <div className="prods" key={i}>
                    <p className={"input-normal " + (item.name ? 'fill' : '')}>
                      <span className="placeholder">{compo.exchange_input_product_name}<i className="required-flag">*</i></span>
                      <input type="text" name="name" className="large" onChange={this.changeProd.bind(this, 'amazon', i)} value={item.name} />
                    </p>
                    <div className="sel-info">
                      <p className="preference">
                        <span className={"input-normal " + (item.preference ? 'fill' : '')}>
                          <span className="placeholder">{compo.exchange_input_exchange}<i className="required-flag">*</i></span>
                          <select name="preference" onChange={this.changeProd.bind(this, 'amazon', i)} value={item.preference}>
                            <option value=""></option>
                            {this.state.cached_preferences.map((preference, i) => {
                                return (
                                  <option value={preference} key={i}>
                                    {preference}
                                  </option>
                                );
                              })}
                          </select>
                        </span>
                      </p>
                      <p className="problem">
                        <span className={"input-normal " + (item.problem ? 'fill' : '')}>
                          <span className="placeholder">{compo.exchange_input_problem}<i className="required-flag">*</i></span>
                          <select name="problem" onChange={this.changeProd.bind(this, 'amazon', i)} value={item.problem}>
                            <option value=""></option>
                            {this.state.cached_problems.map((problem, i) => {
                              return (
                                <option value={problem} key={i}>
                                  {problem}
                                </option>
                              );
                            })}
                          </select>
                        </span>
                      </p>
                      <p>
                        <span className="table">
                          <span className="label-sn cell">{compo.exchange_series_no}</span>
                          <span className={"input-normal cell " + (item.series_no ? 'fill' : '')}>
                            <span className="placeholder">{compo.exchange_series_no_tip}</span>
                            <input type="text" name="series_no" onChange={this.changeProd.bind(this, 'amazon', i)} value={item.series_no} />
                          </span>
                        </span>
                      </p>
                    </div>
                  </div>
                  );
                })}
               <p className="line"></p>
                <h4>{compo.exchange_issue_details}</h4>
                <p>
                  <textarea name="specification" className="large" onChange={this.changeNormalValue.bind(this, 'amazon')} value={this.state.amazon.specification || ''} />
                </p>
                <div className="images">
                  <h4>{compo.exchange_images}</h4>
                  {!this.state.amazon.attachs ? '' : this.state.amazon.attachs.map((item, i) => {
                      // console.log(i, item);
                      return(
                        <i key={i} className="item">
                          <i className="img" style={{backgroundImage: `url(${item.url})`}}></i>
                          <b className="iconfont close" onClick={this.deleteAttach.bind(this, 'amazon', i)}>&#xe642;</b>
                        </i>
                      );
                  })}
                  {(!this.state.amazon.attachs || this.state.amazon.attachs.length < 5) ?
                    <i className="up-box">
                      <button type="button" className="iconfont item">&#xe616;</button>
                      <input type="file" accept="image/gif,image/png,image/jpg,image/bmp,image/jpeg" multiple="multiple" capture="camera" onChange={this.uploadAttach.bind(this, 'amazon')} />
                    </i>
                  : ''}
                </div>
                <div className="captcha-box">
                  <span className={"input-normal captcha " + (this.state.amazon.captcha ? 'fill' : '')}>
                    <span className="placeholder">{common.verification_code_placeholder}</span>
                    <input name="captcha" className="captcha" autoComplete="off" onChange={this.changeNormalValue.bind(this, 'amazon')} value={this.state.amazon.captcha} />
                  </span>
                  <img className="captcha-img" src={this.state.amazon.captcha_url} onClick={this.getCaptchaCode.bind(this, 'amazon')} />
                  <p>
                    <button type="submit" className="button-normal submit">{common.submit}</button>
                    <button type="reset" className="button-normal reset" onClick={this.resetForm.bind(this, 'amazon')}>{common.reset}</button>
                  </p>
                </div>
              </form>
            </dd>
          </dl>
        </div>
        <div className="space-100"></div>
      </div>
    );
  }
}

export default ReturnExchange;
