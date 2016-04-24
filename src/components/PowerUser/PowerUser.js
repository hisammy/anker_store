/**
 * Created by Leon on 2015-11-23 11:04:40
 */

import React, { PropTypes, Component } from 'react';
import withViewport from '../../decorators/withViewport';
import withStyles from '../../decorators/withStyles.js';
import styles from './PowerUser.scss';
import classNames from 'classnames';
import AppActions from '../../core/AppActions';
import Location from '../../core/Location';
import Link from '../../utils/Link';
import Cookie from '../../utils/Cookie';
// import Verify from '../../utils/Verify';
import Http from '../../core/HttpClient';
// import Dialog from '../../utils/Dialog';
import Dialog from '../Dialog';
import PopupSignup from '../Authorize/PopupSignup';

@withViewport
@withStyles(styles)
class PowerUser extends Component {

  static propTypes = {
    data: PropTypes.object.isRequired,
  };
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  componentWillMount() {
    const data = this.props.data;
    const isDesktop = (this.props.viewport.width || window.innerWidth) > 768;
    // console.log(isDesktop, data);
    const PUCountrys = [
      {
        code: 'US',
        name: 'United States',
        codes: ['US'],
      },
      {
        code: 'DE',
        name: 'Deutschland',
        codes: ['DE', 'AT'], // 德, 奥地利
        // link: 'http://de.anker.com',
      },
      // {
      //   code: 'JP',
      //   name: '日本',
      //   codes: ['JP'],
      // },
      {
        code: 'CA',
        name: 'Canada',
        codes: ['CA'],
      },
      {
        code: 'UK',
        name: 'UK',
        codes: ['UK'],
      },
      {
        code: 'FR',
        name: 'France',
        codes: ['FR', 'BE', 'LU'], // 法, 比利时, 卢森堡
      },
      {
        code: 'ES',
        name: 'España',
        codes: ['ES'],
      },
      {
        code: 'IT',
        name: 'Italia',
        codes: ['IT'],
      }
    ];
    this.setState({
      'is_desktop': isDesktop,
      'country_list': PUCountrys,
      'selected_country': data.is_power_user && data.country_code || 'US', // 非PU, 默认选中US
      'pu_country': data.country_code || 'US', // PU以后台国家为准, 非: Cookie.load('country')
      'is_power_user': data.is_power_user,
      'can_apply_power_user': data['can_apply_power_user?'], // 是否能申请PU(审核中/是PU...)
      'can_apply_sample': true, // 标记: 已提交申请, 不能再继续申请
      'gifts': data.gifts || [],
      'current_page': data.current_page || 0,
      'pages': data.pages || 0,
      'loadMore': false,
      'choosed_sample': null,
      'formData': {}, // 申请Sample
      'dialogOption': { // 提示信息
        'content': '',
      },
      faqIndex: null,
    });
  }
  componentWillReceiveProps(nextProps) {
    // console.log(this.props, nextProps);
    var data = nextProps.data || {};
    const isDesktop = (nextProps.viewport.width || window.innerWidth) > 768;
    // console.log(isDesktop);
    this.scrollDetect();
    this.setState({
      'is_desktop': isDesktop,
      'gifts': data.gifts || [],
      'current_page': data.current_page || 0,
      'pages': data.pages || 0,
      'loadMore': false,
    });
  }
  componentDidMount() {
    if(AppActions.getUser().token) {
      this.getSampleInfo();
      this.getFlashDeal(); // this.state.is_power_user
    } else {
      this.setState({
        'can_apply_power_user': true,
      });
    }
    this.scrollDetect();
    const countryBox = this.refs.country_box;
    countryBox && countryBox.addEventListener('wheel', this.handleScroll, false);
  }

  setCountry = async (country) => {
    this.setState({
      'selected_country': country,
      'gifts': null,
      'pages': 0,
    });
    const query = {
      'per_page': 100,
      'selected_country_code': country,
    };
    const json = await Http.post(`get`, `/api/content?path=/api/power_user_gifts`, query, null, false);
    // console.log(country, query, json);
    this.setState({
      'gifts': json.gifts || [],
      'current_page': json.current_page,
      'pages': json.pages,
    });
  }
  LoadMore = async () => {
    if (this.state.loadMore) {
      return;
    }
    this.setState({
      'loadMore': true,
    });
    let query = {
      'per_page': 8,
      'page': this.state.current_page + 1,
    };
    if (this.state.selected_country) {
      query.selected_country_code = this.state.selected_country;
    }
    const json = await Http.post(`get`, `/api/content?path=/api/power_user_gifts`, query, null, true);
    this.setState({
      'gifts': this.state.gifts.concat(json.gifts),
      'current_page': json.current_page,
      'pages': json.pages,
      'loadMore': false,
    })
  }
  applySample = async(gift_id, event) => {
    const i18n = this.props.i18n;
    const compo = i18n['poweruser'];
    const common = i18n['common'];
    let formData = {
      'gift_id': gift_id,
      'quantity': 1,
    };
    let baseData = this.state.formData;
    // console.log(gift_id, baseData);
    this.state.dialogOption.dialogType = 'tips';
    this.state.dialogOption.close = this.closeDialog.bind(this);
    if (!baseData.first_name) {
      this.state.dialogOption.content = common.fill_first_name;
      return this.setState(this.state);
    } else if(!baseData.last_name) {
      this.state.dialogOption.content = common.fill_last_name;
      return this.setState(this.state);
    } else if(!baseData.address1 && !baseData.address2) {
      this.state.dialogOption.content = common.fill_address;
      return this.setState(this.state);
    } else if(!baseData.state_id) {
      this.state.dialogOption.content = common.fill_state;
      return this.setState(this.state);
    } else if(!baseData.city) {
      this.state.dialogOption.content = common.fill_city;
      return this.setState(this.state);
    } else if(!baseData.zipcode) {
      this.state.dialogOption.content = common.fill_zipcode;
      return this.setState(this.state);
    } else if(!baseData.phone_num) {
      this.state.dialogOption.content = common.fill_phone;
      return this.setState(this.state);
    }
    formData.address = baseData;
    // return console.log(formData);
    const api = '/api/pu_sample_applications';
    const json = await Http.post('post', `/api/content?path=${api}`, formData);
    // console.log(json);
    const error = json && (json.error || json.exception);
    if (error) {
      this.state.dialogOption.content = error || compo.apply_failed;
      this.setState(this.state);
    } else { // success
      this.state.dialogOption.dialogType = 'success';
      this.state.dialogOption.content = compo.apply_success;
      this.state.choosed_sample = null;
      this.state.can_apply_sample = false;
      this.setState(this.state);
      this.getSampleInfo();
    }
  }
  getSampleInfo = async () => { // 上次申请提交的信息
    const api = '/api/pu_sample_applications';
    const json = await Http.post('get', `/api/content?path=${api}`);
    // console.log(json);
    if (json && json.country_id) {
      this.getStates(json.country_id);
      this.state.applications = json.applications.length ? json.applications : false;
      let formData = json.last_address || this.state.formData;
      formData.country_id = json.country_id;
      // console.log('getSampleInfo', formData.state_id, this.state.states);
      this.state.formData = formData;
      this.setState(this.state);
      this.detectionStateChange();
    }
  }
  getFlashDeal = async () => {
    const api = '/api/activities/flash_deal_show';
    const json = await Http.post('get', `/api/content?path=${api}`);
    console.log(json);
    if (json && json.activity_items && json.activity_items.length > 0) {
      this.setState({
        show_pu_flash: 1,
      });
    }
  }
  getStates = async (country) => {
    // country = country || 232;
    const json = await Http.post('get', `/api/content?path=/api/countries/${country}/states`);
    // console.log('getStates', country, json, this.state.formData);
    if (json.states) {
      this.setState({
        'states': json.states
      });
      this.detectionStateChange();
    }
  };
  detectionStateChange() { // 防止更改国家, 再次申请时, 州错误
    let formData = this.state.formData;
    let states = this.state.states;
    // console.log(formData, states);
    if (!formData.state_id || !this.state.states) {
      return;
    }
    const stateIDs = this.state.states.map( o => o.id );
    // console.log(stateIDs, stateIDs.indexOf(formData.state_id));
    if (stateIDs.indexOf(formData.state_id) < 0) { // !stateIDs.includes(formData.state_id);
      formData.state_id = '';
      formData.state_name = '';
    }
    this.setState({formData: formData});
  }
  changeValue(event) {
    const elem = event.target;
    let formData = this.state.formData;
    // console.log(elem.name, elem.value);
    formData[elem.name] = elem.value;
    this.setState(this.state);
  }
  chooseSample(variant, gift_id, event) {
    if (!this.state.is_desktop) {
      window.scroll(0,50);
    }
    this.setState({
      'choosed_sample': variant,
    });
  }
  closeDialog(event) {
    this.state.dialogOption.content = '';
    this.setState(this.state);
  }
  toggleFaq(i, event) {
    let state = this.state;
    const prevIndex = state.faqIndex;
    state.faqIndex = i == prevIndex ? null : i;
    this.setState(state);
  }
  toggleSubDesc(event) {
    this.setState({
      show_sub_desc: !this.state.show_sub_desc,
    });
  }
  scrollDetect(action, event) {
    const countryBox = this.refs.country_box;
    // console.log(countryBox);
    if (!countryBox) return;
    const boxw = countryBox.offsetWidth;
    const sw = countryBox.scrollWidth; //this.refs.country_list.offsetWidth;
    // console.log(boxw, sw);
    this.setState({
      show_scroll: sw > boxw ? true : false,
    });
  }
  handleScroll(event) {
    if (!this.refs || !this.refs.auto_scroll) {
      return;
    }
    const scrollWrap = this.refs.auto_scroll;
    const countryBox = event.target;
    const targetVal = countryBox.scrollLeft;
    // console.log(boxw, maxw, targetVal);
    if (countryBox.offsetWidth + targetVal >= countryBox.scrollWidth) {
      scrollWrap.classList.add('show-back');
    } else {
      scrollWrap.classList.remove('show-back');
    }
  }
  scrollCountry(action, event) { // 点击按钮滚动
    // const countryBox = this.refs.country_box;
    // const boxw = countryBox.offsetWidth;
    // const maxw = countryBox.scrollWidth;
    // // console.log(action, maxw, boxw, countryBox.scrollLeft);
    // const modw = boxw/2;
    // const targetVal = countryBox.scrollLeft + ('back' == action ? -modw : modw)
    // countryBox.scrollLeft = targetVal;
    // // console.log(maxw, boxw, targetVal);
    // const back = this.refs.back;
    // const more = this.refs.more;
    // if(targetVal>0) {
    //   back.classList.add('active');
    // } else {
    //   back.classList.remove('active');
    // }
    // if (boxw + targetVal >= maxw) {
    //   more.classList.remove('active');
    // } else {
    //   more.classList.add('active');
    // }
  }
  amazon_link_change(variant, event) {
    let url = variant.amazon_link || event.currentTarget.href;
    const country = this.state.pu_country;
    const base = url.replace(/\/[?|ref].+$/g, '');
    // console.error(country, variant, url);
    if (country != 'US' || variant.top_category != 'Portable Chargers') {
      return;
    }
    const keyword = 'external+battery+charger';
    const tag = 'ianker-20';
    const timestamp = Math.round(new Date().getTime()/1000) - 60;
    url = base + '/ref=sr_1_10?ie=UTF8&qid=' +timestamp+ '&sr=1-10&keywords=' +keyword+ '&m=A294P4X9EWVXLJ&tag=' + tag;
    // console.error(url, timestamp);
    event.currentTarget.href = url;
  };

  render() {
    const i18n = this.props.i18n;
    const common = i18n['common'];
    const compo = i18n['poweruser'];
    // console.log(i18n);
    this.context.onSetTitle(compo.pu_title);
    // this.state.gifts = [];
    return (
      <div className="PowerUser">
        <PopupSignup i18n={i18n}/>
        <Dialog {... this.state.dialogOption} />
        <div className="Banner-container">
          <div className="module-container banner">
            <img className="img" src={require('../../public/poweruser/banner.jpg')} />
            <div className="text">
              <h2>{compo.banner_title}</h2>
              <div className="info" dangerouslySetInnerHTML={{__html: compo.banner_text}} />
            </div>
          </div>
        </div>
        {this.state.is_desktop ? '' :
          <div className="module-container sub-desc">
            <h3 onClick={this.toggleSubDesc.bind(this)}>
              {this.state.show_sub_desc ?
                <i className="iconfont">&#xe619;</i>
                :
                <i className="iconfont">&#xe616;</i>
              }
              {compo.sub_title}
            </h3>
            {!this.state.show_sub_desc ? '' :
              <div dangerouslySetInnerHTML={{__html: compo.banner_text}} />
            }
          </div>
        }
        {!this.state.show_pu_flash ? '' :
          <div className="module-container">
            <a className="sub-banner" href="/deals/pu_flash_deal">
              <i className="iconfont">&#xe600;</i>
              <h2>
                {compo.pu_flash_deal}
                <i className="iconfont">&#xe613;</i>
              </h2>
              <i className="iconfont">&#xe600;</i>
            </a>
          </div>
        }
        <div className="module-container PowerUser-container">
          <div ref="auto_scroll" className={'auto-scroll ' + (this.state.show_scroll ? 'show-btn' : '')}>
            <div ref={this.state.is_power_user ? '' : 'country_box'} onScroll={this.handleScroll.bind(this)} className={'country' + (this.state.is_power_user ? ' pu' : '')}>
              <ul ref={this.state.is_power_user ? '' : 'country_list'} className="list clearfix">
              {this.state.country_list.map((item, i) => {
                if(this.state.is_power_user && -1 === item.codes.indexOf(this.state.pu_country)) return;
                return (
                  <li key={i} className={this.state.selected_country === item.code ? 'cur' :  ''}>
                  <a onClick={this.setCountry.bind(this, item.code)} href={item.link ? item.link : 'javascript:;'} target={item.link ? '_blank': ''}>
                  {item.name}
                  </a>
                  </li>
                )
              })}
              </ul>
            </div>
            <i ref="back" className="iconfont back" onClick={this.scrollCountry.bind(this, 'back')}>&#xe608;</i>
            <i ref="more" className="iconfont more active" onClick={this.scrollCountry.bind(this, 'more')}>&#xe613;</i>
          </div>
          <div className={this.state.choosed_sample ? 'auto-hide' : ''}>
            <div className="module-items clearfix">
              {this.state.gifts && this.state.gifts.length ?
                <div className="module-wraper">
                  {this.state.gifts.map((item, i) => {
                    const variant = item.variant || {};
                    variant.gift_id = item.id;
                    return (
                      <div key={i} className="item">
                        <span className="border"></span>
                        <div className="image">
                          <span className="tag-amazon"></span>
                          <span className="tag-sellout"></span>
                          {variant.image && variant.image.mini_url ? <img src={variant.image.mini_url} /> : ''}
                        </div>
                        { !AppActions.getUser().token ? '' :
                            !this.state.can_apply_sample || item['clean?'] || !item['can_apply?'] ?
                              <p className="get-sample disable">{item['clean?'] ? compo.sample_claimed : compo.get_sample}</p>
                              :
                              <p className="get-sample" onClick={this.chooseSample.bind(this, variant)}>{compo.get_sample}</p>
                        }
                        {/* variant.option_values ?
                          <div className="attr">
                            <ul className="color">
                              <li><img src={variant.option_values[0].image.mini_url} /></li>
                            </ul>
                          </div> : ''
                        */}
                        <div className="title">{variant.name}</div>
                        <div className="description" dangerouslySetInnerHTML={{__html: (variant.description ? variant.description.replace(/\r\n/g, '<br>') : '')}} />
                      </div>
                    );
                  })}
                </div>
                :
                this.state.gifts == null ? '' :
                  <div className="product-empty">
                    <i className="iconfont">&#xe63c;</i>
                    <div>{common.empty}</div>
                  </div>
              }
            </div>
            {/*<div className="module-more">
              {this.state.current_page >= this.state.pages ? '' :
                <a className="load-btn" onClick={this.LoadMore.bind(this)}>
                  LOAD MORE {this.state.loadMore ? <i className="iconfont load-icon">&#xe63a;</i> : ''}
                </a>
              }
            </div>*/}
            {this.state.can_apply_power_user ?
            <a className="apply-btn" href={!AppActions.getUser().token ? '/login?back=poweruser' : '/poweruser/apply'} onClick={Link.handleClick}>
              {compo.apply_now}
            </a> : ''
            }
          </div>
          {(() => {
            const choosedSample = this.state.choosed_sample;
            // console.log(choosedSample);
            if (!choosedSample) return;
            return(
              <div id="apply" className="sample-apply">
                <div className="mask"></div>
                <div className="container">
                  <h4>{compo.sample_apply}</h4>
                  <div className="clearfix box">
                    <div className="cell prod">
                      <div className="image">
                        {choosedSample.image && choosedSample.image.mini_url ?<img src={choosedSample.image.mini_url} /> : ''}
                      </div>
                      <div className="line-clamp title">{choosedSample.name}</div>
                      {/*<div className="description">{choosedSample.description}</div>*/}
                    </div>
                    <div className="cell form">
                      <h5>{common.shipping_address}</h5>
                      <p>
                        <span className={"input-normal first-name " + (this.state.formData.first_name ? 'fill' : '')}>
                          <span className="placeholder">{common.first_name}<i className="required-flag">*</i></span>
                          <input type="text" name="first_name" onChange={this.changeValue.bind(this)} value={this.state.formData.first_name} />
                        </span>
                        <span className={"input-normal last-name " + (this.state.formData.last_name ? 'fill' : '')} style={{display: 'inline-block'}}>
                          <span className="placeholder">{common.last_name}<i className="required-flag">*</i></span>
                          <input type="text" name="last_name" onChange={this.changeValue.bind(this)} value={this.state.formData.last_name} />
                        </span>
                      </p>
                      <p>
                        <span className={"input-normal address1 " + (this.state.formData.address1 ? 'fill' : '')}>
                          <span className="placeholder">{common.address_line_1}<i className="required-flag">*</i></span>
                          <input type="text" name="address1" onChange={this.changeValue.bind(this)} value={this.state.formData.address1} />
                        </span>
                        <span className={"input-normal address2 " + (this.state.formData.address2 ? 'fill' : '')}>
                          <span className="placeholder">{common.address_line_1}</span>
                          <input type="text" name="address2" onChange={this.changeValue.bind(this)} value={this.state.formData.address2} />
                        </span>
                      </p>
                      <p>
                        <span className="input-normal country fill">
                          <span className="placeholder" dangerouslySetInnerHTML={{__html: `${common.country}:`}} />
                          <input type="text" value={this.state.pu_country} readOnly="readonly" />
                        </span>
                        <span className={"input-normal state " + (this.state.formData.state_id ? 'fill' : '')}>
                          <span className="placeholder">{common.state}<i className="required-flag">*</i></span>
                          <select name="state_id" onChange={this.changeValue.bind(this)} value={this.state.formData.state_id}>
                            <option></option>
                            {this.state.states && this.state.states.map((item, i) =>  {
                              return (
                              <option key={i} value={item.id}>{item.name}</option>
                              );
                            })}
                          </select>
                        </span>
                        <span className={"input-normal city " + (this.state.formData.city ? 'fill' : '')}>
                          <span className="placeholder">{common.city}<i className="required-flag">*</i></span>
                          <input type="text" name="city" onChange={this.changeValue.bind(this)} value={this.state.formData.city} />
                        </span>
                        <span className={"input-normal zipcode " + (this.state.formData.zipcode ? 'fill' : '')}>
                          <span className="placeholder">{common.zipcode}<i className="required-flag">*</i></span>
                          <input type="text" name="zipcode" onChange={this.changeValue.bind(this)} value={this.state.formData.zipcode} />
                        </span>
                      </p>
                      <p className={"input-normal phone " + (this.state.formData.phone_num ? 'fill' : '')}>
                          <span className="placeholder">{common.phone_number}<i className="required-flag">*</i></span>
                        <input type="text" name="phone_num" onChange={this.changeValue.bind(this)} value={this.state.formData.phone_num} />
                      </p>
                      <p className="btn">
                        <button className="submit" onClick={this.applySample.bind(this, choosedSample.gift_id)}>{common.submit}</button>
                        <button className="reset" onClick={this.chooseSample.bind(this, null)}>{common.cancel}</button>
                      </p>
                    </div>
                  </div>
                  <i className="close iconfont" onClick={this.chooseSample.bind(this, null)}>&#xe642;</i>
                </div>
              </div>
            );
          })()}
          {this.state.is_power_user && this.state.applications ?
            <div className="my-sample">
              <h4>{compo.my_sample}</h4>
              {this.state.applications.map((item, i) =>  {
                const gift = item.gift || {};
                const variant = gift.variant || {};
                const address = item.address || {};
                return (
                <div className="box" key={i}>
                  <div className="cell prod">
                    <a href={variant.amazon_link} target="_blank" onClick={this.amazon_link_change.bind(this, variant)}>
                    <div className="image">
                      {variant.image && variant.image.mini_url ? <img src={variant.image.mini_url} /> : ''}
                    </div>
                    <div className="line-clamp title">{variant.name}</div>
                    </a>
                  </div>
                  <div className="cell status">
                    <p className="state">
                      <span className="highlight">{common.status}:</span> {item.status}
                    </p>
                    <h6 className="highlight">{compo.ship_info}:</h6>
                    <ul>
                      <li>
                        <label>{common.first_name}:</label>
                        {address.first_name}
                      </li>
                      <li>
                        <label>{common.last_name}:</label>
                        {address.last_name}
                      </li>
                      <li>
                        <label>{compo.address1}:</label>
                        {address.address1}
                      </li>
                      <li>
                        <label>{compo.address2}:</label>
                        {address.address2}
                      </li>
                      <li>
                        <label>{common.country}:</label>
                        {address.country_iso}
                      </li>
                      <li>
                        <label>{common.state}:</label>
                        {address.state_name}
                      </li>
                      <li>
                        <label>{common.city}:</label>
                        {address.city}
                      </li>
                      <li>
                        <label>{common.zipcode}:</label>
                        {address.zipcode}
                      </li>
                      <li>
                        <label>{compo.phone}:</label>
                        {address.phone_num}
                      </li>
                    </ul>
                  </div>
                </div>
                );
              })}
            </div>
            : ''
          }
          {!compo.faq_list ? '' :
            <div className="faq">
            <div className="box">
              <h3>{compo.faqs}</h3>
              <ul className="list">
              {compo.faq_list.map((item, i) => {
                return(
                  <li key={i}>
                    <h5 onClick={this.toggleFaq.bind(this, i)}>
                      {this.state.faqIndex == i ?
                        <i className="iconfont">&#xe619;</i>
                        :
                        <i className="iconfont">&#xe616;</i>
                      }
                      {item.title}
                    </h5>
                    {this.state.faqIndex == i ?
                      <div className="text" dangerouslySetInnerHTML={{__html: item.text}} />
                      : ''
                    }
                  </li>
                );
              })}
              </ul>
            </div>
            <div dangerouslySetInnerHTML={{__html: compo.mailto}} />
            </div>
          }
        </div>
        <div className="space-100"></div>
      </div>
    );
  }
}

export default PowerUser;
