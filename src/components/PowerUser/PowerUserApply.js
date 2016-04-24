/**
 * Created by Leon on 2015-11-23 11:04:40
 */

import React, { PropTypes, Component } from 'react';
import styles from './PowerUserApply.scss';
import withStyles from '../../decorators/withStyles.js';
// import classNames from 'classnames';
import AppActions from '../../core/AppActions';
import Location from '../../core/Location';
import Link from '../../utils/Link';
import Cookie from '../../utils/Cookie';
// import Verify from '../../utils/Verify';
import { isEmail } from '../../utils/Verify';
import Http from '../../core/HttpClient';
// import Dialog from '../../utils/Dialog';
import Dialog from '../Dialog';

@withStyles(styles)
class PowerUserApply extends Component {

  static propTypes = {
    data: PropTypes.object.isRequired,
  };
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  componentWillMount() {
    const data = this.props.data;
    const i18n = this.props.i18n;
    const common = i18n['common'];
    const compo = i18n['poweruser'];
    this.setState({
      'dialog_msg': '', // 提示信息
      'country_list': [],
      // 'country': Cookie.load('country') || 'US',
      'show_review': false,
      'markets': [
        {
          'name': 'Amazon.com',
          'value': 'amazon',
          'review': 'https://www.amazon.com/gp/profile/',
          'countrys': [
            {
              'code': 'US',
              'name': 'United States',
            },
          ],
        },
        {
          'name': 'Amazon.ca',
          'value': 'amazon_ca',
          'review': 'https://www.amazon.ca/gp/profile/',
          'countrys': [
            {
              'code': 'CA',
              'name': 'Canada',
            },
          ],
        },
        {
          'name': 'Amazon.de',
          'value': 'amazon_de',
          'review': 'https://www.amazon.de/gp/profile/',
          'countrys': [
            {
              'code': 'DE',
              'name': 'Deutschland',
            },
            {
              'code': 'AT',
              'name': 'Österreich',
            },
          ],
        },
        {
          'name': 'Amazon.fr',
          'value': 'amazon_fr',
          'review': 'https://www.amazon.fr/gp/profile/',
          'countrys': [
            {
              'code': 'FR',
              'name': 'France',
            },
            {
              'code': 'BE',
              'name': 'Belgique',
            },
            {
              'code': 'LU',
              'name': 'Luxembourg',
            },
          ],
        },
        // {
        //   'name': 'Amazon.jp',
        //   'value': 'amazon_jp',
        //   'review': 'https://www.amazon.co.jp/gp/profile/',
        //   'countrys': [
        //     {
        //       'code': 'JP',
        //       'name': '日本',
        //     },
        //   ],
        // },
        {
          'name': 'Amazon.it',
          'value': 'amazon_it',
          'review': 'https://www.amazon.it/gp/profile/',
          'countrys': [
            {
              'code': 'IT',
              'name': 'Italia',
            },
          ],
        },
        {
          'name': 'Amazon.uk',
          'value': 'amazon_uk',
          'review': 'https://www.amazon.co.uk/gp/profile/',
          'countrys': [
            {
              'code': 'UK',
              'name': 'UK',
            },
          ],
        },
        {
          'name': 'Amazon.es',
          'value': 'amazon_es',
          'review': 'https://www.amazon.es/gp/profile/',
          'countrys': [
            {
              'code': 'ES',
              'name': 'España',
            },
          ],
        },
      ],
      // display: both: checkbox+input; checkbox(default): only checkbox, input: only input
      'participates': compo.pu_participates.map((item, i) => {
        return { 'title': item, 'display': 'input',}
      }),
      'interests': compo.pu_interests.map((item, i) => {
        let t = { 'title': item };
        if (i+1 == compo.pu_interests.length) {
          t.display = 'input';
        }
        return t;
      }),
      'identifys': compo.pu_identifys.map((item, i) => {
        return { 'title': item }
      }),
      'hear_ways': compo.pu_hear_ways.map((item, i) => {
        let t = { 'title': item };
        if (i+1 == compo.pu_hear_ways.length) {
          t.display = 'input';
        }
        return t;
      }),
      'props': {},
      'formData': {},
    });
  }
  componentWillReceiveProps(nextProps) {
    // console.log(this.props, nextProps);
  }
  componentDidMount() {
    if (!AppActions.getUser().token) {
      Location.push( '/login?back=' + location.pathname.slice(1) + location.search);
      return;
    }
    this.getProps();
    this.getCaptchaCode();
  }
  applySubmit = async (event) => {
    event.preventDefault();
    const i18n = this.props.i18n;
    const common = i18n['common'];
    const compo = i18n['poweruser'];
    let formData = this.state.formData;
    const api = '/api/pu_applications';
    const props = this.state.props;
    formData.code = this.state.captcha_code;
    this.state.auto_focus = null;
    for (let key in props) {
        let prop = props[key];
        let arr = [];
        // console.log(key, prop);
        for (let k in prop) {
          arr.push(prop[k]);
        }
        formData[key] = arr;
    }
    // return console.log(formData);
    if (!formData.username) {
      this.state.auto_focus = 'username';
      return this.setState({
        dialog_msg: compo.pu_fill_username,
      });
    } else if (!formData.email || !isEmail(formData.email)) {
      this.state.auto_focus = 'email';
      return this.setState({
        dialog_msg: common.fill_email,
      });
    // } else if (!formData.gender) {
    //   this.state.auto_focus = 'gender';
    //   return this.setState({
    //     dialog_msg: 'Please enter your gender.',
    //   });
    } else if (!formData.market) {
      this.state.auto_focus = 'market';
      return this.setState({
        dialog_msg: compo.pu_fill_amazon_market,
      });
    // } else if (!formData.country_code) {
    //   this.state.auto_focus = 'country_code';
    //   return this.setState({
    //     dialog_msg: 'Please select a country or region',
    //   });
    } else if(!formData.amazon_profile) {
      this.state.auto_focus = 'amazon_profile';
      return this.setState({
        dialog_msg: compo.pu_fill_amazon_profile_link,
      });
    } else if(!formData.participate || formData.participate.length < 1) {
      this.state.auto_focus = 'participate_0';
      return this.setState({
        dialog_msg: compo.pu_fill_post_links,
      });
    } else if(!formData.value) {
      this.state.auto_focus = 'captcha';
      return this.setState({
        dialog_msg: common.fill_captcha,
      });
    }
    // return console.log(formData);
    // return this.resetForm();
    const json = await Http.post('post', `/api/content?path=${api}`, formData);
    // console.log('post', json);
    if (json && json.id) { // json.success
      this.setState({
        applied: true,
        dialog_msg: compo.apply_success,
      });
      this.resetForm();
    } else {
      this.setState({
        dialog_msg: json.error || content.exception,
      });
      this.getCaptchaCode();
    }
  }
  resetForm(event){
    if(event) event.preventDefault();
    this.setState({
      'props': {},
      'formData': {},
    });
  }
  getProps = async () =>{
    const user = AppActions.getUser();
    const json = await Http.post('get', '/api/content?path=/api/pu_applications/obtain_items');
    // console.log(json);
    let email = user.email;
    let state = this.state;
    // this.state.items = json.items;
    state.formData.username = json.username;
    state.formData.gender = json.gender || 'secret';
    if (json.email) {
      email = json.email;
      // json.country_code = 'BE'; // for test
      state.review_url = this.state.markets[0].review;
      json.country_code && this.state.markets.some((item, i) => {
        const match = item.countrys.filter(o => o.code == json.country_code); // exist
        if (match.length) {
          state.country_list = item.countrys;
          state.formData.market = item.value;
          state.formData.country_code = json.country_code;
          state.review_url = item.review;
          return true;
        }
      });
    }
    this.state.hasEmail = !!email;
    this.state.formData.email = email;
    this.setState(this.state);
  }
  getCaptchaCode = async () =>{
    const json = await Http.post('get', '/api/content?path=/api/users/obtain_captcha');
    if (json.captcha_code) {
      this.state.formData.value = '';
      this.state.captcha_url = json.captcha_url;
      this.state.captcha_code = json.captcha_code;
      this.setState(this.state);
    }
  }
  changeMarket(event) {
    const elem = event.target;
    const option = [...elem.options].filter(o => o.selected)[0]; // elem.selectedOptions (not work IE11?)
    const market = this.state.markets[option.dataset.i];
    let state = this.state;
    // console.log(elem.name, elem.value, option.dataset.i);
    state.formData[elem.name] = elem.value;
    if (market) {
      state.country_list = market.countrys;
      state.formData.country_code = market.countrys[0].code;
      state.review_url = market.review;
    }
    this.setState(state);
  }
  changeValue(event) {
    const elem = event.target;
    let formData = this.state.formData;
    // console.log(elem.name, elem.value);
    formData[elem.name] = elem.value;
    this.setState(this.state);
  }
  changePropValue(type, i, event) {
    const elem = event.target;
    let props = this.state.props;
    // console.log(i, type, elem.name, elem.value, elem.checked, elem.type);
    let prop = props[type] || [];
    prop[i] = prop[i] || {};
    if ('checkbox' == elem.type && !elem.checked) {
      delete prop[i];
    } else {
      prop[i][elem.name] = elem.value;
      const refKey = this.refs[type +'_'+ i];
      // console.log(this.refs, refKey, refKey.dataset.title, refKey.getAttribute('data-title'));
      if (refKey) {
        prop[i]['title'] = refKey.dataset.title || '';
      }
      if (!elem.value) {
        delete prop[i];
      }
    }
    props[type] = prop;
    this.setState(this.state);
  }
  renderProps(tmplProps, key) { // 根据结构化表单, 输出表单
    // return console.log(tmplProps, key);
    return (
      tmplProps ?
        tmplProps.map((item, i) => {
          const obj = this.state.props[key] || {};
          const v = obj[i] || {};
          const display = item.display || 'checkbox';
          return (
            <p className="row" key={i}>
              {-1 != ['both', 'checkbox'].indexOf(display) ?
                <label className="cell label">
                  <input type="checkbox" ref={i == 0 ? key : null} name="title" value={item.title} onChange={this.changePropValue.bind(this, key, i)} checked={v.title == item.title}/>
                  {item.title}
                </label>
                : ''
              }
              {-1 != ['both', 'input'].indexOf(display) ?
                <span className={"input-normal cell text " + (v.value ? 'fill' : '')}>
                  <span className="placeholder">{item.title}</span>
                  <input type="text" name="value" className="large" ref={key +'_'+ i} data-title={item.title} onChange={this.changePropValue.bind(this, key, i)} value={v.value} />
                </span>
                : ''
              }
            </p>
          );
        })
      :
      ''
    );
  }
  closeDialog(event) {
    if (this.state.applied) {
      Location.push( '/poweruser');
    }
    this.setState({
      dialog_msg: '',
    });
    const ref = this.refs[this.state.auto_focus];
    if (ref) {
      ref.focus();
    }
  }
  toggleReview(event) {
    this.setState({
      'show_review': !this.state.show_review,
    });
  }

  render() {
    const i18n = this.props.i18n;
    const common = i18n['common'];
    const compo = i18n['poweruser'];
    this.context.onSetTitle(compo.pu_apply_title);
    return (
      <div className="PowerUserApply">
        <Dialog content={this.state.dialog_msg} close={this.closeDialog.bind(this)} />
        <div className="Banner-container">
          <div className="module-container banner">
            <div className="text">
              <h2>{compo.pu_apply_banner_title}</h2>
              <div className="info" dangerouslySetInnerHTML={{__html: compo.banner_text}} />
            </div>
          </div>
        </div>
        <div className="module-container PowerUserApply-container">
          <form action="" onSubmit={this.applySubmit.bind(this)}>
            <div className="box" dangerouslySetInnerHTML={{__html: compo.pu_apply_desc}} />
            <div className="box">
              <h3>{compo.pu_apply_pu_information}</h3>
              <p className={"input-normal username " + (this.state.formData.username ? 'fill' : '')}>
                <span className="placeholder">{compo.pu_apply_input_username}<i className="required-flag">*</i></span>
                <input type="text" name="username" ref="username" onChange={this.changeValue.bind(this)} value={this.state.formData.username} />
              </p>
              <p className={"input-normal email " + (this.state.formData.email ? 'fill' : '')}>
                <span className="placeholder">{compo.pu_apply_input_email}<i className="required-flag">*</i></span>
                <input type="email" name="email" ref="email" onChange={this.changeValue.bind(this)} value={this.state.formData.email} readOnly={this.state.hasEmail} />
              </p>
              <div className="gender">
                <div className={"input-normal " + (this.state.formData.gender ? 'fill' : '')}>
                   <span className="placeholder">{compo.pu_placeholder_gender}</span>
                   <select autoComplete="off" name="gender" ref="gender" onChange={this.changeValue.bind(this)} value={this.state.formData.gender}>
                      <option value="secret">{compo.pu_prefer_not_to_answer}</option>
                      <option selected={"male" === this.state.formData.gender ? true : false} value="male">{compo.pu_male}</option>
                      <option selected={"female" === this.state.formData.gender ? true : false} value="female">{compo.pu_female}</option>
                    </select>
                </div>
              </div>
              <p className={"input-normal amazon-domain " + (this.state.formData.market ? 'fill' : '')}>
                <span className="placeholder">{compo.pu_apply_input_amazon_domain}<i className="required-flag">*</i></span>
                <select name="market" ref="market" className="large" onChange={this.changeMarket.bind(this)} value={this.state.formData.market}>
                  <option value=""></option>
                  {this.state.markets.map((item, i) => {
                    return (
                      <option value={item.value} data-i={i} key={i}>
                        {item.name}
                      </option>
                    );
                  })}
                </select>
              </p>
              <p className={"input-normal " + (this.state.formData.country_code ? 'fill' : '')}>
                <span className="placeholder">{compo.pu_apply_input_location}<i className="required-flag">*</i></span>
                <select name="country_code" ref="country_code" className="large" onChange={this.changeValue.bind(this)} value={this.state.formData.country_code}>
                  {this.state.country_list.map((item, i) => {
                    return (
                      <option value={item.code} key={i}>
                        {item.name}
                      </option>
                    );
                  })}
                </select>
              </p>
              <p>
                {compo.pu_apply_link_to_profile}
                <i className="toggle-review iconfont" onClick={this.toggleReview.bind(this)}>&#xe605;</i>
              </p>
              <p className={'amazon-tip' + (this.state.show_review ? '' : ' hide')} dangerouslySetInnerHTML={{__html: i18n.format(compo.pu_apply_link_to_profile_tip, this.state.review_url)}} />
              <p className={"input-normal " + (this.state.formData.amazon_profile ? 'fill' : '')}>
                <span className="placeholder">{compo.pu_apply_amazon_profile_url}<i className="required-flag">*</i></span>
                <input type="url" name="amazon_profile" ref="amazon_profile" className="large" onChange={this.changeValue.bind(this)} value={this.state.formData.amazon_profile} />
              </p>
            </div>
            <div className="box">
              <h3>{compo.pu_apply_review_invitations_tip}</h3>
              <p>
                <b>{compo.pu_apply_include_links_tip}</b>:
                <i className="required-flag">*</i>
              </p>
              {this.renderProps(this.state.participates, 'participate')}
            </div>
            <div className="box">
              <h4>
                {compo.pu_apply_interests_tip}
              </h4>
              <p>
                {compo.pu_apply_interested_in}
              </p>
              {this.renderProps(this.state.interests, 'interests')}
            </div>
            <div className="box">
              <h4>
                {compo.pu_apply_identify_tip}
              </h4>
              {this.renderProps(this.state.identifys, 'identify')}
            </div>
            <div className="box">
              <h4>
                {compo.pu_apply_hear_way_tip}
              </h4>
              {this.renderProps(this.state.hear_ways, 'hear_way')}
            </div>
            <div className="captcha-box">
              <span className={"input-normal captcha " + (this.state.formData.value ? 'fill' : '')}>
                <span className="placeholder">{common.verification_code_placeholder}</span>
                <input name="value" ref="captcha" autoComplete="off" onChange={this.changeValue.bind(this)} value={this.state.formData.value} />
              </span>
              <img className="captcha-img" src={this.state.captcha_url} onClick={this.getCaptchaCode.bind(this)} />
              <p>
                <button type="submit" className="button-normal submit">{common.submit}</button>
                <button type="reset" className="button-normal reset" onClick={this.resetForm.bind(this)}>{common.reset}</button>
              </p>
            </div>
          </form>
        </div>
        <div className="space-100"></div>
      </div>
    );
  }
}

export default PowerUserApply;
