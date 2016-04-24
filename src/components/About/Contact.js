/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { PropTypes, Component } from 'react';
import withStyles from '../../decorators/withStyles';
import styles from './Contact.scss';
import AppActions from '../../core/AppActions';
import Location from '../../core/Location';
import Link from '../../utils/Link';
import Http from '../../core/HttpClient';
import Dialog from '../Dialog';
import PopupSignup from '../Authorize/PopupSignup';
import { autoLink } from '../../utils/Helper';

@withStyles(styles)
class Contact extends Component {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  componentWillMount() {
    const data = this.props.data;
    this.setState({
      media: {},
    });
  }
  componentWillReceiveProps(nextProps) {
    // console.log(this.props, nextProps);
    var data = nextProps.data || {};
  }
  componentDidMount() {
    this.getCaptchaCode('media');
  }
  mediaSubmit = async (event) => {
    event.preventDefault();
    const data = this.state.media;
    let formData = {
      captcha_code: data.captcha_code,
      captcha: data.captcha,
      name: data.name,
      email: data.email,
      company_name: data.company_name,
      website: data.website,
      interest: data.interest,
      comment: data.comment,
    };
    if (!formData.captcha) {
      return this.setState({
        dialog_msg: 'Please enter the captcha.',
      });
    }
    console.log(formData);
  }
  resetForm(type, event){
    if(event) event.preventDefault();
    let data = this.state[type];
    this.state[type] = {
      captcha_url: data.captcha_url,
      captcha_code: data.captcha_code,
    }
    console.log(this.state);
    this.setState(this.state);
  }
  getCaptchaCode = async (type) =>{
    const json = await Http.post('get', '/api/content?path=/api/users/obtain_captcha');
    let data = this.state[type];
    if (json.captcha_code) {
      data.captcha = '';
      data.captcha_url = json.captcha_url;
      data.captcha_code = json.captcha_code;
      this.setState(this.state);
    }
  }
  changeValue(type, event) {
    const elem = event.target;
    let data = this.state[type];
    // console.log(elem.name, elem.value);
    data[elem.name] = elem.value;
    this.setState(this.state);
  }

  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['contact'];
    this.context.onSetTitle(compo.contact_title);
    return (
      <div className="Contact">
        <PopupSignup i18n={i18n}/>
        <div className="module-container">
          <div className="title">
            <h2>{compo.contact_sub_title}</h2>
            <p>{compo.contact_sub_desc}</p>
          </div>
          <div className="content">
            <h3>{compo.customer_service_inquiries}</h3>
            <p>{compo.customer_service_inquiries_desc}</p>
            <dl>
              <dt>
                {compo.email_us}
              </dt>
              <dd>
                <p>
                  <a href={`mailto:${compo.support_email}`}>{compo.support_email}</a>
                </p>
              </dd>
              <dt>
                {compo.call_us}
              </dt>
              <dd className="tels" dangerouslySetInnerHTML={{__html: compo.contact_tels}}/>
              <dd>
                <p onClick={ autoLink } dangerouslySetInnerHTML={{__html: compo.contact_support_center}}/>
              </dd>
            </dl>

            <h3>{compo.business_inquiries}</h3>
            <p onClick={ autoLink } dangerouslySetInnerHTML={{__html: compo.contact_business_center}}/>
            {/*
            <h3>Media Inquiries</h3>
            <p>
              For media inquiries, please complete the following contact form:
            </p>
            <form action="" className="form" onSubmit={this.mediaSubmit.bind(this)}>
              <p className={"input-normal " + (this.state.media.name ? 'fill' : '')}>
                <span className="placeholder">Name *</span>
                <input type="text" name="name" onChange={this.changeValue.bind(this, 'media')} value={this.state.media.name} />
              </p>
              <p className={"input-normal " + (this.state.media.company_name ? 'fill' : '')}>
                <span className="placeholder">Company name *</span>
                <input type="text" name="company_name" onChange={this.changeValue.bind(this, 'media')} value={this.state.media.company_name} />
              </p>
              <p className={"input-normal " + (this.state.media.company_name ? 'fill' : '')}>
                <span className="placeholder">Website URL *</span>
                <input type="url" name="website" onChange={this.changeValue.bind(this, 'media')} value={this.state.media.website} />
              </p>
              <p className={"input-normal " + (this.state.media.email ? 'fill' : '')}>
                <span className="placeholder">Email address *</span>
                <input type="email" name="email" onChange={this.changeValue.bind(this, 'media')} value={this.state.media.email} />
              </p>
              <p className={"input-normal " + (this.state.media.interest ? 'fill' : '')}>
                <span className="placeholder">Anker product of interest *</span>
                <input type="text" name="interest" onChange={this.changeValue.bind(this, 'media')} value={this.state.media.interest} />
              </p>
              <p>
                <label className="placeholder">Comments or specific requests: <i className="r">*</i></label>
                <textarea name="comment" className="large" onChange={this.changeValue.bind(this, 'media')} value={this.state.media.comment} />
              </p>
              <div className="captcha-box">
                <span className={"input-normal captcha " + (this.state.media.captcha ? 'fill' : '')}>
                  <span className="placeholder">Verification code - humans only!</span>
                  <input name="captcha" ref="captcha" autoComplete="off" onChange={this.changeValue.bind(this, 'media')} value={this.state.media.captcha} />
                </span>
                <img className="captcha-img" src={this.state.media.captcha_url} onClick={this.getCaptchaCode.bind(this, 'media')} />
                <p>
                  <button type="submit" className="button-normal submit">Submit</button>
                  <button type="reset" className="button-normal reset" onClick={this.resetForm.bind(this, 'media')}>Reset</button>
                </p>
              </div>
            </form>
            */}
          </div>
        </div>
        <div className="space-100"></div>
      </div>
    );
  }

}

export default Contact;
