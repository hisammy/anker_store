/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, {PropTypes, Component} from 'react';
import styles from './Footer.scss';
import withStyles from '../../decorators/withStyles';
import Link from '../../utils/Link';
import BackTop from '../../utils/BackTop';
import AppActions from '../../core/AppActions';
import Cookie from '../../utils/Cookie';
import Http from '../../core/HttpClient';
import Dialog from '../Dialog';
import Verify from '../../utils/Verify';
import { config } from '../../../build/config';

@withStyles(styles)
class Footer extends Component {

  componentWillMount() {
    this.state = {
      'email': '',
      'email_lock': false,
      'country_list': config.country_list,
      'links': [0, 0],
      'country': global.server ? this.props.cookie.country : Cookie.load('country'),
      'dialogOption': {
        'close': this.closeDialog.bind(this),
        'content': ''
      },
      'backTop': false
    }
  }

  componentWillReceiveProps(nextProps) {
    this.state.country = global.server ? this.props.cookie.country : Cookie.load('country');
  }

  componentDidMount() {
    document.onscroll = () => {
      if (document.body.scrollTop > 520 && !this.state.backTop) {
        this.setState({
          'backTop': true
        })
      }
      if (document.body.scrollTop <= 520 && this.state.backTop) {
        this.setState({
          'backTop': false
        })
      }
      ;
    }
  }

  closeDialog(event) {
    this.setState({
      'dialogOption': {
        'content': ''
      }
    });
  }

  linkToggle(n) {
    this.state.links[n] = this.state.links[n] ? 0 : 1;
    this.setState(this.state);
  }

  editEmail() {
    this.setState({
      'email_lock': false
    })
  }

  subscribe = async(event) => {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    event.preventDefault();
    if (this.state.email && Verify.reg.email.test(this.state.email)) {
      event.preventDefault();
      const body = {
        'register_source': encodeURIComponent(location.href),
        'email': this.state.email,
        'is_subscribe': true,
        'country_code':this.state.country_code
      };
      const json = await Http.post('post', '/api/content?path=/api/registrations/subscribe', body);
      if (json && json.result) {
        this.setState({
          'email_lock': true,
          'dialogOption': {
            'content': common.ft_subscribe_success,
            'dialogType': 'Success'
          }
        });
      } else {
        this.state.dialogOption.content = json.error;
        this.setState(this.state);
      }
    } else {
      this.setState({
        'dialogOption': {
          'content': common.fill_email,
          'dialogType': 'tips'
        }
      });
    }
  };

  emailChange(event) {
    this.setState({
      'email': event.target.value
    })
  }

  backTop() {
    BackTop.go(0);
  }

  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    // const compo = i18n['footer'];
    i18n.format = i18n.format || ()=>{};
    return (
      <div className="Footer">
        <Dialog {...this.state.dialogOption} />
        <div className="module-container">
          <div className="table">
            <div className="cell">
              <div className={"subscribe " + (this.state.email_lock ? 'lock' : '')}>
                <form onSubmit={this.state.email_lock ? '' : this.subscribe.bind(this)}>
                  <h3>{common.ft_subscribe}</h3>
                  <p>{common.ft_subscribe_desc}</p>
                  <div className="input">
                    <input type="text" placeholder={common.ft_input_email} value={this.state.email} onChange={this.state.email_lock ? '' : this.emailChange.bind(this)}/>
                  </div>
                  <div className="submit">
                    {this.state.email_lock ?
                      <a onClick={this.editEmail.bind(this)}>{common.edit}</a>
                      :
                      <a onClick={this.subscribe.bind(this)}>{common.submit}</a>
                    }
                  </div>
                </form>
              </div>
              <div className="follow">
                <a target="_blank" className="facebook" href="http://www.facebook.com/Anker.fans"><i className="iconfont">&#xe657;</i></a>
                <a target="_blank" className="twitter" href="https://twitter.com/Ankerofficial"><i className="iconfont">&#xe615;</i></a>
                <a target="_blank" className="google" href="https://plus.google.com/114663344536204280808"><i className="iconfont">&#xe606;</i></a>
                <a target="_blank" className="linkedin" href="https://www.linkedin.com/company/ianker"><i className="iconfont">&#xe61a;</i></a>
                <a target="_blank" className="youtube" href="http://www.youtube.com/user/AnkerOceanwing"><i className="iconfont">&#xe602;</i></a>
                <a target="_blank" className="instagram" href="http://instagram.com/anker_official?ref=badge"><i className="iconfont">&#xe61d;</i></a>
              </div>
            </div>
            <div className="links cell">
              <div className={"linklist " + (this.state.links[1] ? 'show' : '')}>
                <h3 onClick={this.linkToggle.bind(this, 1)}>
                  {common.ft_about}
                  <i className="iconfont">&#xe642;</i>
                </h3>
                <ul>
                  <li><a href="/about" onClick={Link.handleClick}>{common.ft_our_company}</a></li>
                  <li><a href="/press" onClick={Link.handleClick}>{common.ft_press_center}</a></li>
                  <li><a href="/contact" onClick={Link.handleClick}>{common.ft_contact_anker}</a></li>
                  <li><a href="/business" onClick={Link.handleClick}>{common.ft_wholesale}</a></li>
                  <li><a href="/poweriq" onClick={Link.handleClick}>{common.ft_poweriq}</a></li>
                  <li><a href="/weee" onClick={Link.handleClick}>{common.ft_weee}</a></li>
                </ul>
              </div>
              <div className={"linklist " + (this.state.links[0] ? 'show' : '')}>
                <h3 onClick={this.linkToggle.bind(this, 0)}>
                  {common.ft_support}
                  <i className="iconfont">&#xe642;</i>
                </h3>
                <ul>
                  <li><a href="/support/download" onClick={Link.handleClick}>{common.ft_downloads}</a></li>
                  <li><a href="/support/refund-exchange" onClick={Link.handleClick}>{common.ft_refund_exchange}</a></li>
                  <li><a href="/support/privacy-policy" onClick={Link.handleClick}>{common.ft_privacy_policy}</a></li>
                  <li><a href="/support/warranty" onClick={Link.handleClick}>{common.ft_warranty}</a></li>
                  <li><a href="/support/terms" onClick={Link.handleClick}>{common.ft_terms}</a></li>
                  {/*<li><a href="/support/faq" onClick={Link.handleClick}>FAQs</a></li>*/}
                </ul>
              </div>
            </div>
            <div className="contact cell">
              <div className="tels">
                <h4>{common.ft_call_us}</h4>
                <div>
                  <p><a href="tel:+1 (800) 988 7973">+1 (800) 988 7973 (US)</a></p>
                  <p>Mon to Fri 9AM - 5PM(PST)</p>
                </div>
                <div>
                  <p><a href="tel:+44 (0) 1604 936 200">+44 (0) 1604 936 200 (UK)</a></p>
                  <p>Mon to Fri 6AM - 11AM(GMT)</p>
                </div>
              </div>
              <div className="email">
                <h4>{common.ft_email}</h4>
                <p><a href="mailto:support@anker.com">support@anker.com</a></p>
              </div>
            </div>
          </div>
          <div className="clearfix sub">
            <p className="copyright">{common.ft_copyright}</p>
            <div className="country">
              {this.state.country_list.map((item, i) => {
                if (this.state.country === item.code) {
                  return (
                    <a key={i} href="/country" onClick={Link.handleClick}>
                      <img src={require("../../public/country/country_" + this.state.country.toLowerCase() + ".png")}/>
                      <span>{item.name}</span>
                    </a>
                  )
                }
              })}
            </div>
          </div>
        </div>
        <div className={"backTop " + (this.state.backTop ? 'show' : 'hide')} onClick={this.backTop.bind(this)}>
          <i className="iconfont">&#xe601;</i><span>{common.ft_backtop}</span>
        </div>
      </div>
    );
  }

}

export default Footer;
