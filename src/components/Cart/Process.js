/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { PropTypes, Component } from 'react';
import withStyles from '../../decorators/withStyles';
import styles from './Process.scss';
import AppActions from '../../core/AppActions';
import Location from '../../core/Location';
import Http from '../../core/HttpClient';
import Link from '../../utils/Link';
import Verify from '../../utils/Verify';
import Dialog from '../Dialog';
import Track from '../../utils/Track';
import { config } from '../../../build/config';
import ObjectAssign from 'object-assign';

@withStyles(styles)
class Process extends Component {

  static propTypes = {
    data: PropTypes.object
  };

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  componentWillMount() {
    this.state = {
      'states': [],
      'order': this.props.data,
      'email': this.props.data ? this.props.data.email : '',
      'coupons': [],
      'couponInput': '',
      'addresses': [],
      'repush': false
    };
    this.reloadAddress(this.props.data ? this.props.data.ship_address : '');
  };

  componentWillReceiveProps(nextProps) {
    this.state.order = nextProps.data;
    this.reloadAddress(nextProps.data ? nextProps.data.ship_address : '');
    if (this.state.order.user_id) {
      this.address(); //anker登录，合并订单以后再推一次订单
      this.getCoupons();
      this.getAddresses();
    }
  };

  componentDidMount() {
    if (typeof(FB) === "object" && FB.getUserID() != "") {
      FB.api('/me', function () {
        FB.logout();
      })
    }
    this.setState({
      'dialogOption': {
        'close': this.closeDialog.bind(this)
      }
    });
    if (this.state.order) {
      this.getStates();
      if (this.state.order.user_id) {
        this.address(); //anker登录，合并订单以后再推一次订单
        this.getCoupons();
        this.getAddresses();
      }
    }
  };

  reloadAddress = (address) => {
    this.setState({
      'address': {
        "firstname": address ? address.firstname : '',
        "lastname": address ? address.lastname : '',
        "address1": address ? address.address1 : '',
        "address2": address ? address.address2 : '',
        "country_id": address ? address.country_id : 232,
        "state_name": address ? (address.state_name || address.state.name) : '',
        "state_id": address ? address.state_id : '',
        "city": address ? address.city : '',
        "phone": address ? address.phone : '',
        "zipcode": address ? address.zipcode : ''
      }
    })
  };

  googleLoginDig() {
    var webconfig = {
      'client_id': config.GOOGLE_APP_ID,
      'scope': 'https://www.googleapis.com/auth/userinfo.email',
      'collection': 'visible'
    };
    gapi.auth.authorize(webconfig, (authResult) => {
      gapi.client.load('plus', 'v1', () => {
        gapi.client.plus.people.get({'userId': 'me'}).execute((resp) => {
          var email = resp.emails ? resp.emails[0].value : '';
          var user = {
            "login": email,
            "uid": resp.id,
            "third_party": "google",
            "nick_name": resp.displayName || email.split('@')[0]
          };
          this.third_party_login(user);
        });
      });
    });
  };

  facebookLoginDig() {
    if (FB.getUserID() != "") {
      FB.api('/me', function () {
        FB.logout();
      })
    }
    FB.login((response) => {
      if (response.status === "connected") {
        FB.api('/me?fields=name,email',
          {locale: 'en_US', fields: 'name, email'},
          async (response) => {
            if (!response.error) {
              var user = {
                "login": response.email || "",
                "uid": response.id,
                "third_party": "facebook",
                "nick_name": response.name
              };
              this.third_party_login(user);
            }
          });
      }
    }, {'scope': 'public_profile,email,user_birthday'});
  };

  third_party_login = async (user) => {
    const body = {
      "register_source": encodeURIComponent(location.href),
      "user": user,
      "order_id": this.state.order.number
    };
    const json = await Http.post('POST', '/api/content?path=/api/sessions/third_party_login', body);
    if (json.token) {
      AppActions.signOut();
      AppActions.signIn(json);
      AppActions.setCart(json.item_count);
      Location.push('/process');
    } else {
      this.setState({
        'dialogOption': {
          'content': json,
          'dialogType': 'fail'
        }
      });
    }
  };

  closeDialog(event) {
    this.setState({
      'dialogOption': {
        'content': ''
      }
    });
  }

  getStates = async () => {
    const json = await Http.post('get', `/api/content?path=/api/countries/232/states`);
    if (json.states) {
      this.setState({
        'states': json.states
      });
    }
  };

  valueChange(event) {
    if(event.target.name === 'email') {
      this.state.email = event.target.value;
    } else {
      this.state.address[event.target.name] = event.target.value;
    }
    if(event.target.name === 'state_id') {
      this.state.address.state_name = event.target.selectedOptions.item(0).text;
    }
    this.setState(this.state);
  };

  editAddress(type) {
    this.reloadAddress(this.state.order.ship_address);
    this.setState({
      'editAddress': type
    })
  };

  getAddresses = async () => {
    const json = await Http.post('GET', '/api/content?path=/api/extend_addresses');
    if (json.addresses && json.addresses.length) {
      this.setState({
        'addresses': json.addresses
      })
      if (!this.state.order.ship_address) {
        json.addresses.map((item, i) => {
          if (item.isDefault) {
            this.reloadAddress(item);
          }
        })
      }
    }
  };

  getCoupons = async () => {
    const json = await Http.post('GET', '/api/content?path=/api/promotions/available_coupons');
    if (json.coupons) {
      this.setState({
        'coupons': json.coupons
      });
    }
  };

  inputCoupon(event) {
    this.setState({
      'couponInput': event.target.value
    })
  };

  couponSelect(code, event) {
    this.state.couponInput = code;
    this.setCoupon('set', event);
  };

  setCoupon = async (type, event) => {
    const i18n = this.props.i18n || {};
    // const common = i18n['common'] || {};
    const compo = i18n['process'];
    event.preventDefault();
    if (type !== 'del' && !this.state.couponInput) {
      this.setState({
        'dialogOption': {
          'content': compo.fill_promo_code,
          'dialogType': 'tips'
        }
      });
    } else {
      let body = {
        'coupon_code': type === 'del' ? this.state.order.applied_coupon.code : this.state.couponInput
      };
      const json = await Http.post('PUT', '/api/content?path=/api/orders/' + AppActions.getUser().order_id + (type === 'del' ? '/remove_coupon_code' : '/apply_coupon_code'), body)
      if (json.error || json.exception) {
        this.setState({
          'dialogOption': {
            'content': json,
            'dialogType': 'tips'
          }
        });
      } else {
        this.setState({
          'order': json
        });
        if (type === 'del') {
          this.setState({
            'couponInput': ''
          });
          this.setState({
            'dialogOption': {
              'content': compo.promo_code_removed,
              'dialogType': 'success'
            }
          });
        } else {
          this.setState({
            'dialogOption': {
              'content': compo.promo_code_added,
              'dialogType': 'success'
            }
          });
        }
      };
    }
  };

  addressSelect(address) {
    this.state.address = address;
    this.address();
  };

  submitAddress() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['process'];
    //地址非空验证
    let addressDialog = '';
    for (let key in (this.state.address)) {
      if(!(this.state.address[key] + '').trim()) {
        if(key === 'firstname' && !addressDialog) {
          addressDialog = {
            'content': common.fill_first_name,
            'dialogType': 'fail'
          }
        }
        if(key === 'lastname' && !addressDialog) {
          addressDialog = {
            'content': common.fill_last_name,
            'dialogType': 'fail'
          }
        }
        if(key === 'address1' && !addressDialog) {
          addressDialog = {
            'content': common.fill_address,
            'dialogType': 'fail'
          }
        }
        if(key === 'country_id' && !addressDialog) {
          addressDialog = {
            'content': compo.fill_country,
            'dialogType': 'fail'
          }
        }
        if(key === 'state_id' && !addressDialog) {
          addressDialog = {
            'content': common.fill_state,
            'dialogType': 'fail'
          }
        }
        if(key === 'city' && !addressDialog) {
          addressDialog = {
            'content': common.fill_city,
            'dialogType': 'fail'
          }
        }
        if(key === 'phone' && !addressDialog) {
          addressDialog = {
            'content': common.fill_phone,
            'dialogType': 'fail'
          }
        }
        if(key === 'zipcode' && !addressDialog) {
          addressDialog = {
            'content': common.fill_zipcode,
            'dialogType': 'fail'
          }
        }
      }
    }
    if(!addressDialog) {
      this.state.editAddress = 'edit';
      this.address();
    } else {
      this.setState({
        dialogOption: addressDialog
      })
      if(this.state.order.ship_address) {
        this.state.editAddress = 'edit';
      } else {
        this.state.editAddress = ''
      }
    }
  }

  address = async () => {
    if (this.state.order.state === 'cart') {
      const body = {
        'id': this.state.order.number,
        'state': 'cart'
      };
      const json = await Http.post('PUT', '/api/content?path=/api/checkouts/' + this.state.order.number, body);
      if (json.state === 'address') {
        Track.ecCheckout(json.line_items, 1);
      } else {
        this.setState({
          dialogOption: {
            'content': json,
            'dialogType': 'fail'
          }
        });
        return false;
      }
    }
    if(this.state.editAddress || this.state.order.ship_address) {
      this.delivery();
    }
  };

  delivery = async () => {
    const body = {
      'id': this.state.order.number,
      'state': 'address',
      'order': {
        'bill_address_attributes': this.state.address,
        'ship_address_attributes': this.state.address
      }
    };
    const json = await Http.post('PUT', '/api/content?path=/api/checkouts/' + this.state.order.number, body);
    if (json.state === 'delivery') {
      this.setState({
        'editAddress': '',
        'order': json
      });
      Track.ecCheckout(json.line_items, 2);
    } else {
      this.setState({
        'dialogOption': {
          'content': json,
          'dialogType': 'fail'
        }
      });
    }
  };

  complete = async () => {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    // const compo = i18n['process'];
    /*判断订单内有没有email，如果没有验证输入，如果正确提交*/
    if(!this.state.order.email) {
      if(Verify.reg.email.test(this.state.email)) {
        var result = await Http.post('POST', '/api/content?path=/api/orders/add_email', {
          'email': this.state.email
        });
      } else {
        this.setState({
          dialogOption: {
            'content': common.fill_email,
            'dialogType': 'fail'
          }
        });
        return ;
      }
    }
    /*与地址列表全等比较，如果非全等，则添加到地址列表*/
    let addAddress = true,
        stateAddress = this.state.address;
    delete stateAddress.state_name;
    this.state.addresses.map((item, i) => {
      let address = {
        'firstname': item.firstname,
        'lastname': item.lastname,
        'address1': item.address1,
        'address2': item.address2,
        'country_id': item.country_id,
        'state_id': item.state_id,
        'city': item.city,
        'phone': item.phone,
        'zipcode': item.zipcode
      };
      if(JSON.stringify(address) === JSON.stringify(stateAddress)) {
        addAddress = false;
        return false;
      };
    });

    if(addAddress) {
      var result = await Http.post('POST', '/api/content?path=/api/extend_addresses', {
        'address': this.state.address,
        'order_id': this.state.order.number
      });
    }

    let body = {
      'token': AppActions.getUser().token,
      'order_token': this.state.order.token,
      'id': this.state.order.number,
      'state': 'delivery'
    };

    const json = await Http.post('PUT', '/api/content?path=/api/checkouts/' + AppActions.getUser().order_id, body);
    if (json.state === 'complete') {
      AppActions.tempOrderToken(this.state.order.token);
      AppActions.removeOrder();
      AppActions.setCart(0);
      Location.push(`/place/${this.state.order.number}?his=1`);
      Track.ecShippingComplete(1);
    } else {
      this.setState({
        dialogOption: {
          content: json,
          dialogType: 'fail'
        }
      });
    }
  };

  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['process'];
    this.context.onSetTitle(compo.process_title);
    if (this.state.order && this.state.order.shipments && this.state.order.shipments.length) {
      this.state.order.preorder = this.state.order.preorder || [];
      this.state.order.shipby = this.state.order.shipby || [];
      this.state.order.shipments.map((item, i) => {
        if (item.is_backordered) {
          this.state.order.preorder.push(item);
        } else {
          this.state.order.shipby.push(item);
        }
      });
      this.state.order.shipments = [];
    }
    return (
      <div className="Process">
        <Dialog {...this.state.dialogOption} />
        {(!this.state.order || !this.state.order.id) ?
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
        : <div className={"module-container " + this.state.editAddress}>
          {this.state.editAddress === 'list' ?
            <div className="addresses">
              <div className="container">
                <div className="header">
                  <span>{common.address_book}</span>
                  <i className="iconfont close" onClick={this.editAddress.bind(this, '')}>&#xe642;</i>
                </div>
                <div className="content">
                  <ul className="list">
                    {this.state.addresses ? this.state.addresses.map((item, i) => {
                      return (
                        <li>
                          <div className="item" onClick={this.addressSelect.bind(this,
                              { "firstname": item.firstname ,
                                "lastname": item.lastname,
                                "address1": item.address1,
                                "address2": item.address2 ? item.address2 : '',
                                "country_id": item.country_id,
                                "state_name": item.state_name,
                                "state_id": item.state_id,
                                "city": item.city,
                                "phone": item.phone,
                                "zipcode": item.zipcode
                              }
                            )}>
                            <p>{item.firstname + ' ' + item.lastname}</p>
                            <p>{common.phone_number}: {item.phone}</p>
                            <p dangerouslySetInnerHTML={{__html: i18n.format(compo.address, item.address1 + (item.address2 ? (', ' + item.address2) : '') )}} />
                            <p>{item.city + ', ' + item.state_name + ', ' + compo.default_country_abbr}</p>
                            <p>{common.zipcode}: {item.zipcode}</p>
                          </div>
                        </li>
                      );
                    }) : ''}
                  </ul>
                  <a className="close" onClick={this.editAddress.bind(this, '')}>{common.cancel}</a>
                </div>
              </div>
            </div> : ''}
          <div className="table">
            <div className="order-input">

              <div className="page-title">
                  <span className="item">
                    <i className="iconfont">&#xe64a;</i>
                    <span>{compo.order_details}</span>
                  </span>
              </div>

              {this.state.order.user_id ?
                this.state.order.email ? '' :
                  <div className="email">
                    <ul className="inputs">
                      <li dangerouslySetInnerHTML={{__html: compo.indicates_required_fields}}/>
                      <li className="p100">
                        <div className={"input-normal " + (this.state.email ? 'fill' : '')}>
                          <span className="placeholder">{compo.process_placeholder_email}<i className="required-flag">*</i></span>
                          <input type="text" name="email" onChange={this.valueChange.bind(this)} value={this.state.email}/>
                        </div>
                      </li>
                    </ul>
                  </div>
                :
                <div className="customer">
                  <h5>{compo.customer_login}</h5>
                  <ul className="links">
                    <li>
                      <a className="google" onClick={this.googleLoginDig.bind(this)}>
                      <i className="iconfont">&#xe606;</i>{compo.signin_with_google}</a></li>
                    <li>
                      <a className="facebook" onClick={this.facebookLoginDig.bind(this)}>
                      <i className="iconfont">&#xe657;</i>{compo.signin_with_facebook}</a></li>
                    <li>
                      <a className="anker" href="/login?back=process" onClick={Link.handleClick}>{compo.login_register}</a></li>
                  </ul>
                </div>
              }

              {this.state.order.user_id ?
                <div className={'address ' + (this.state.order.ship_address && !this.state.editAddress ? 'fill' :'')}>
                  <h5>{common.shipping_address}
                    {this.state.addresses.length ?
                      <a className="describe" onClick={this.editAddress.bind(this, 'list')}>({compo.select_from_address_book})</a>
                      : ''}
                  </h5>
                  <ul className="inputs">
                    <li className="p50">
                      <div className={"input-normal " + (this.state.address.firstname ? 'fill' : '')}>
                        <span className="placeholder">{common.first_name}<i className="required-flag">*</i></span>
                        <input type="text" name="firstname" onChange={this.valueChange.bind(this)}
                               value={this.state.address.firstname}/>
                      </div>
                    </li>
                    <li className="p50">
                      <div className={"input-normal " + (this.state.address.lastname ? 'fill' : '')}>
                        <span className="placeholder">{common.last_name}<i className="required-flag">*</i></span>
                        <input type="text" name="lastname" onChange={this.valueChange.bind(this)}
                               value={this.state.address.lastname}/>
                      </div>
                    </li>
                    <li className="p100">
                      <div className={"input-normal " + (this.state.address.address1 ? 'fill' : '')}>
                        <span className="placeholder">{common.address_line_1}<i className="required-flag">*</i></span>
                        <input typt="text" name="address1" onChange={this.valueChange.bind(this)}
                               value={this.state.address.address1}/>
                      </div>
                    </li>
                    <li className="p100">
                      <div className={"input-normal " + (this.state.address.address2 ? 'fill' : '')}>
                        <span className="placeholder">{common.address_line_2}</span>
                        <input type="text" name="address2" onChange={this.valueChange.bind(this)}
                               value={this.state.address.address2}/>
                      </div>
                    </li>
                    <li className="p33">
                      <div className={"input-normal " + (this.state.address.country_id ? 'fill' : '')}>
                        <span className="placeholder">{common.country}<i className="required-flag">*</i></span>
                        <select name="country_id">
                          <option value="232">{compo.default_country}</option>
                        </select>
                      </div>
                    </li>
                    <li className="p33">
                      <div className={"input-normal " + (this.state.address.state_id ? 'fill' : '')}>
                        <span className="placeholder">{common.state}<i className="required-flag">*</i></span>
                        <select className="state" autoComplete="off" name="state_id" onChange={this.valueChange.bind(this)}>
                          <option></option>
                          {this.state.states.map((item, i) => {
                            return (
                              <option key={i} value={item.id} selected={item.id === this.state.address.state_id ? true : false}>{item.name}</option>
                            );
                          })}
                        </select>
                      </div>
                    </li>
                    <li className="p33">
                      <div className={"input-normal " + (this.state.address.city ? 'fill' : '')}>
                        <span className="placeholder">{common.city}<i className="required-flag">*</i></span>
                        <input type="text" name="city" onChange={this.valueChange.bind(this)}
                               value={this.state.address.city}/>
                      </div>
                    </li>
                    <li className="p25">
                      <div className={"input-normal " + (this.state.address.zipcode ? 'fill' : '')}>
                        <span className="placeholder">{common.zipcode}<i className="required-flag">*</i></span>
                        <input type="text" name="zipcode" onChange={this.valueChange.bind(this)}
                               value={this.state.address.zipcode}/>
                      </div>
                    </li>
                    <li className="p75">
                      <div className={"input-normal " + (this.state.address.phone ? 'fill' : '')}>
                        <span className="placeholder">{common.phone_number}<i className="required-flag">*</i></span>
                        <input type="text" name="phone" onChange={this.valueChange.bind(this)}
                               value={this.state.address.phone}/>
                      </div>
                    </li>
                  </ul>
                  <div className="next">
                    <a className="submit" onClick={this.submitAddress.bind(this)}>{common.save}</a>
                    {this.state.editAddress === 'edit' ?
                      <a className="cancel" onClick={this.editAddress.bind(this, '')}>{common.cancel}</a>
                      : ''}
                    {!this.state.editAddress ?
                      <a className="edit" onClick={this.editAddress.bind(this, 'edit')}>{common.edit}</a>
                      : ''}
                  </div>
                </div>
                : ''}
              {this.state.order.ship_address ?
                <div className="promotion">
                  <h5>{compo.promotion_code}</h5>
                  <form onSubmit={this.setCoupon.bind(this, this.state.order.applied_coupon ? 'del' : 'set')}>
                    <ul className="inputs">
                      <li className="p75">
                        {this.state.order.applied_coupon ?
                          <div className="input-normal fill">
                            <span className="placeholder" dangerouslySetInnerHTML={{ __html: compo.new_code}} />
                            <input type="text" disabled="disabled" value={this.state.order.applied_coupon.name}/>
                          </div>
                          :
                          <div className={"input-normal " + (this.state.couponInput ? 'fill' : '')}>
                            <span className="placeholder" dangerouslySetInnerHTML={{ __html: compo.new_code}} />
                            <input type="text" value={this.state.couponInput} onChange={this.inputCoupon.bind(this)}/>
                          </div>
                        }
                      </li>
                      <li className="p25">
                        {this.state.order.applied_coupon ?
                          <button type="submit" className="delete">{compo.remove}</button>
                          :
                          <button type="submit" className="apply">{compo.apply}</button>
                        }
                      </li>
                    </ul>
                  </form>
                  {this.state.order.applied_coupon ? '' :
                    <ul className="list">
                      {this.state.coupons.map((item, i) => {
                        const start = Verify.dateFormat(item.starts_at, 'MM/dd/yyyy');
                        const expire = Verify.dateFormat(item.expires_at, 'MM/dd/yyyy');
                        return (
                          <li key={i} className="cur" onClick={this.couponSelect.bind(this, item.code)}>
                            <h5 className="price">{item.display_promotion}</h5>
                            <span className="name" dangerouslySetInnerHTML={{ __html: i18n.format(compo.name, item.name) }} />
                            <span className="date" dangerouslySetInnerHTML={{ __html: i18n.format(compo.date, start, expire) }} />
                            <span className="note" dangerouslySetInnerHTML={{ __html: i18n.format(compo.note, item.description) }} />
                          </li>
                        );
                      })}
                    </ul>
                  }
                </div> : ''}
            </div>
            <div className="order-info">
              {this.state.order && (this.state.order.preorder || this.state.order.shipby) ?
                <div className="list">
                  {this.state.order.preorder.length ?
                    <dl>
                      <dt>{compo.preorder}</dt>
                      {this.state.order.preorder.map((item, i) => {
                        return (
                          <dd key={i}>
                            <div className="image"><img src={item.line_items[0].variant.image ? item.line_items[0].variant.image.mini_url : ''}/>
                            </div>
                            <div className="text">
                              <p className="name">{item.line_items[0].variant.name}</p>
                              <p className="color" dangerouslySetInnerHTML={{
                                __html: i18n.format(compo.color_colon, item.line_items[0].variant.option_values.length ? item.line_items[0].variant.option_values[0].name : '')
                              }}/>
                              <p className="quantity" dangerouslySetInnerHTML={{__html: i18n.format(compo.quantity_colon, item.line_items[0].quantity)}}/>
                              <p className="price">{item.line_items[0].display_amount}</p>
                            </div>
                          </dd>
                        );
                      })}
                    </dl> : ''
                  }
                  {this.state.order.shipby.map((item, i) => {
                    return (
                      <dl key={i}>
                        <dt dangerouslySetInnerHTML={{__html: i18n.format(compo.shipped_by, item.stock_location_name)}}/>
                        {item.line_items.map((item, i) => {
                          return (
                            <dd key={i}>
                              <div className="image"><img
                                src={item.variant.image ? item.variant.image.mini_url : ''}/></div>
                              <div className="text">
                                <p className="name">{item.variant.name}</p>
                                <p className="color" dangerouslySetInnerHTML={{
                                  __html: i18n.format(compo.color_colon, item.variant.option_values.length ? item.variant.option_values[0].name : '')
                                }}/>
                                <p className="quantity" dangerouslySetInnerHTML={{__html: i18n.format(compo.quantity_colon, item.quantity)}}/>
                                <p className="price">{item.display_amount}</p>
                              </div>
                            </dd>
                          );
                        })}
                      </dl>
                    )
                  })}
                </div>
                :
                <div className="list">
                  {this.state.order.line_items ? this.state.order.line_items.map((item, i) => {
                    return (
                      <dl key={i}>
                        <dd>
                          <div className="image"><img src={item.variant.image.mini_url}/></div>
                          <div className="text">
                            <p className="name">{item.variant.name}</p>
                            <p className="color" dangerouslySetInnerHTML={{__html: i18n.format(compo.color_colon, item.variant.option_values[0].name)}}/>
                            <p className="quantity" dangerouslySetInnerHTML={{__html: i18n.format(compo.quantity_colon, item.quantity)}}/>
                            <p className="price">{item.display_amount}</p>
                          </div>
                        </dd>
                      </dl>
                    );
                  }) : ''}
                </div>
              }

              <ul className="count">
                <li>
                  <span className="key">{compo.process_subtotal}</span>
                  <span className="value">{this.state.order.display_item_total}</span>
                </li>
                <li>
                  <span className="key">{compo.process_shipping}</span>
                  <span className="value">{this.state.order.display_ship_total}</span>
                </li>
                <li>
                  <span className="key">{compo.process_taxes}</span>
                  <span className="value">{this.state.order.display_tax_total}</span>
                </li>
                {this.state.order.adjustments ? this.state.order.adjustments.map((item, i) => {
                  return (
                    <li key={i}>
                      <span className="key">{item.label}</span>
                      <span className="value">{item.amount}</span>
                    </li>
                  );
                }) : ''}
              </ul>

              <div className="total">
                <span className="key">{compo.process_total}</span>
                <span className="value">{this.state.order.display_total}</span>
              </div>
            </div>
          </div>
          <div className={this.state.order.ship_address && !this.state.editAddress ? 'checkout' : 'checkout hide'}
               onClick={this.complete.bind(this)}>
            <span className="price">
              {this.state.order.display_total}
              <span className="line">|</span>
            </span>
            <span>{compo.continue_to_payment}</span>
          </div>
        </div>
        }
      </div>
    );
  }
}

export default Process;
