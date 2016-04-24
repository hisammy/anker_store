
import React, { PropTypes, Component } from 'react';
import withViewport from '../../decorators/withViewport';
import withStyles from '../../decorators/withStyles';
import styles from './BusinessApply.scss';
import AppActions from '../../core/AppActions';
import Http from '../../core/HttpClient';
import Dialog from '../Dialog';
import Location from '../../core/Location';
import PopupSignup from '../Authorize/PopupSignup';

@withViewport
@withStyles(styles)
class BusinessApply extends Component {
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };
  componentWillMount() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['business'] || {};
    const purposes = [
      {key: "gift", value: compo.business_purpose_gift},
      {key: "bulk", value: compo.business_purpose_bulk},
      {key: "retail", value: compo.business_purpose_retail},
      {key: "reseller_distributor", value: compo.business_purpose_reseller_distributor},
      {key: "custom", value: compo.business_purpose_custom},
      {key: "oem", value: compo.business_purpose_oem},
      {key: "others", value: compo.business_purpose_others},
    ];
    // const purpose = [{a: 1, b:2}];
    this.setState({
      countries: [],
      purposes: purposes,
      formData: {
        email: AppActions.getUser().email,
        products: [
          {
            name: '',
            quantity: '',
            link: '',
          }
        ],
      },
    });
  }
  componentWillReceiveProps(nextProps) {
  }
  componentDidMount() {
    this.getCountries();
    this.getCaptchaCode();
  }
  componentDidUpdate() {
    const ref = this.refs[this.state.auto_focus];
    // console.log(ref);
    if (ref) {
      ref.focus();
      // ref.scrollIntoView();
      this.state.auto_focus = null;
    }
  }
  applySubmit = async (event) => {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['business'] || {};
    event.preventDefault();

    let formData = this.state.formData;
    const api = '/api/business_orders';
    formData.captcha_key = this.state.captcha_code;
    this.state.auto_focus = null;
    // return console.log(formData);
    const defaultMsg = compo.fill_marked_fields;
    if (!formData.company_name) {
      this.state.auto_focus = 'company_name';
      return this.setState({ dialog_msg: defaultMsg });
    } else if (!formData.contact_name) {
      this.state.auto_focus = 'contact_name';
      return this.setState({ dialog_msg: defaultMsg });
    } else if (!formData.email) {
      this.state.auto_focus = 'email';
      return this.setState({ dialog_msg: defaultMsg });
    } else if (!formData.shipping_country) {
      this.state.auto_focus = 'shipping_country';
      return this.setState({ dialog_msg: defaultMsg });
    } else if (!formData.shipping_address) {
      this.state.auto_focus = 'shipping_address';
      return this.setState({ dialog_msg: defaultMsg });
    } else if(!formData.order_size_usd) {
      this.state.auto_focus = 'order_size_usd';
      return this.setState({ dialog_msg: defaultMsg });
    } else if(!formData.purpose) {
      this.state.auto_focus = 'purpose_0';
      return this.setState({ dialog_msg: defaultMsg });
    }
    if(this.state.purpose_key == 'reseller_distributor') {
      if (!formData.regions_sell_in) {
        this.state.auto_focus = 'regions_sell_in';
        return this.setState({ dialog_msg: defaultMsg });
      } else if(!formData.sell_on_3rd_platforms) {
        this.state.auto_focus = 'sell_on_3rd_platforms';
        return this.setState({ dialog_msg: defaultMsg });
      } else if(formData.sell_on_3rd_platforms == 'Yes' && !formData.sell_platforms) {
        this.state.auto_focus = 'sell_platforms';
        return this.setState({ dialog_msg: defaultMsg });
      } else if(!formData.monthly_purchase) {
        this.state.auto_focus = 'monthly_purchase';
        return this.setState({ dialog_msg: defaultMsg });
      }
    }
    if(!formData.captcha) {
      this.state.auto_focus = 'captcha';
      return this.setState({
        dialog_msg: common.fill_captcha,
      });
    }
    // return this.resetForm();
    const json = await Http.post('post', `/api/content?path=${api}`, formData);
    if (json && json.id) { // json.success
      this.setState({
        applied: true,
        dialog_msg: compo.business_form_submitted,
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
      'formData': {
        email: AppActions.getUser().email,
        products: [{
          name: '',
          quantity: '',
          link: '',
        }],
      },
    });
  }
  closeDialog(event) {
    if (this.state.applied) {
      Location.push( '/business');
    }
    this.setState({
      dialog_msg: '',
    });
    const ref = this.refs[this.state.auto_focus];
    if (ref) {
      ref.focus();
      // ref.scrollIntoView();
    }
  }
  valueChange(event) {
    const elem = event.target;
    let formData = this.state.formData;
    // console.log(elem.name, elem.value);
    formData[elem.name] = elem.value;
    this.setState(this.state);
  }
  purposeChange(i, event) {
    const elem = event.target;
    let formData = this.state.formData;
    const purpose = this.state.purposes[i];
    // console.log(i, elem.name, elem.value, purpose);
    this.state.purpose_key = purpose.key;
    formData.purpose = elem.value;
    this.setState(this.state);
  }
  productChange(i, event) {
    const elem = event.target;
    let formData = this.state.formData;
    // console.log(i, elem.name, elem.value);
    formData.products[i][elem.name] = elem.value;
    this.setState(this.state);
  }
  addProduct(){
    let formData = this.state.formData;
    const index = formData.products.length;
    formData.products.push({
      name: '',
      quantity: '',
      link: '',
    });
    this.state.auto_focus = `product_${index}`;
    this.setState(this.state);
  }
  getCaptchaCode = async () =>{
    const json = await Http.post('get', '/api/content?path=/api/users/obtain_captcha');
    if (json.captcha_code) {
      this.state.formData.captcha = '';
      this.state.captcha_url = json.captcha_url;
      this.state.captcha_code = json.captcha_code;
      this.setState(this.state);
    }
  }
  getCountries = async () => {
    const json = await Http.post('get', '/api/content?path=/api/countries', {'page': 0, 'per_page': 1000});
    // console.log(json);
    if (json && json.countries) {
      this.setState({
        countries: json.countries,
      });
    }
  }

  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['business'];
    this.context.onSetTitle(compo.business_title);
    return (
      <div className="BusinessApply">
        <PopupSignup i18n={i18n}/>
        <Dialog content={this.state.dialog_msg} close={this.closeDialog.bind(this)} />
        <div className="module-container">
          {/*<div className="title">
            <h2>Business Center</h2>
          </div>*/}
          <div className="content">
            <form action="" onSubmit={this.applySubmit.bind(this)}>
            {/*<div className="box">
              <p>
                The fields marked<i className="required-flag">*</i> are required.
              </p>
            </div>*/}
            <div className="box">
              <h3 className="tac">{compo.business_term_company_info}</h3>
              <p className={"input-normal " + (this.state.formData.company_name ? 'fill' : '')}>
                <span className="placeholder">{compo.placeholder_company_name}<i className="required-flag">*</i></span>
                <input type="text" name="company_name" ref="company_name" onChange={this.valueChange.bind(this)} value={this.state.formData.company_name} />
              </p>
              <p className={"input-normal " + (this.state.formData.contact_name ? 'fill' : '')}>
                <span className="placeholder">{compo.placeholder_contact_name}<i className="required-flag">*</i></span>
                <input type="text" name="contact_name" ref="contact_name" onChange={this.valueChange.bind(this)} value={this.state.formData.contact_name} />
              </p>
              <p className={"input-normal " + (this.state.formData.phone_number ? 'fill' : '')}>
                <span className="placeholder">{compo.placeholder_contact_phone_number}</span>
                 <input type="tel" name="phone_number" onChange={this.valueChange.bind(this)} value={this.state.formData.phone_number} />
              </p>
              <p className={"input-normal email " + (this.state.formData.email ? 'fill' : '')}>
                <span className="placeholder">{compo.placeholder_email_address}<i className="required-flag">*</i></span>
                <input type="email" name="email" ref="email" onChange={this.valueChange.bind(this)} value={this.state.formData.email} />
              </p>
              <p className={"input-normal " + (this.state.formData.website ? 'fill' : '')}>
                <span className="placeholder">{compo.placeholder_website}</span>
                <input type="text" name="website" onChange={this.valueChange.bind(this)} value={this.state.formData.website} />
              </p>
              <p className={"input-normal " + (this.state.formData.shipping_country ? 'fill' : '')}>
                <span className="placeholder">{compo.placeholder_shipping_country}<i className="required-flag">*</i></span>
                <select name="shipping_country" ref="shipping_country" onChange={this.valueChange.bind(this)} value={this.state.formData.shipping_country}>
                  <option></option>
                  {this.state.countries && this.state.countries.map((item, i) => {
                    return (
                      <option value={item.name} key={i}>
                        {item.name}
                      </option>
                    );
                  })}
                </select>
              </p>
              <p className={"input-normal shipping-address " + (this.state.formData.shipping_address ? 'fill' : '')}>
                <span className="placeholder">{compo.placeholder_shipping_address}<i className="required-flag">*</i></span>
                <input type="text" name="shipping_address" ref="shipping_address" onChange={this.valueChange.bind(this)} value={this.state.formData.shipping_address} />
              </p>
              <p className={"input-normal " + (this.state.formData.billing_address ? 'fill' : '')}>
                <span className="placeholder">{compo.placeholder_billing_address}</span>
                <input type="text" name="billing_address" onChange={this.valueChange.bind(this)} value={this.state.formData.billing_address} />
              </p>
            </div>
            <div className="box">
              <h3 className="tac">{compo.business_order_info}</h3>
              <p className={"input-normal " + (this.state.formData.order_size_usd ? 'fill' : '')}>
                <span className="placeholder">{compo.placeholder_estimated_order_size}<i className="required-flag">*</i></span>
                <input type="text" name="order_size_usd" ref="order_size_usd" onChange={this.valueChange.bind(this)} value={this.state.formData.order_size_usd} />
              </p>
              <p>{compo.business_purchase_purpose}<i className="required-flag">*</i></p>
              <p className="radio-box">
                {this.state.purposes.map((item, i) => {
                  // console.log(i, item);
                  return (
                    <label key={i}>
                      <input type="radio" name="purpose" ref={`purpose_${i}`} value={item.value} onChange={this.purposeChange.bind(this, i)} checked={this.state.formData.purpose == item.value} />
                      {item.value}
                    </label>
                  );
                })}
              </p>
              {this.state.purpose_key !== 'reseller_distributor' ? '' :
                <div>
                  <p>{compo.for_resellers_distributors_only}</p>
                  <p className={"input-normal " + (this.state.formData.regions_sell_in ? 'fill' : '')}>
                    <span className="placeholder">{compo.placeholder_the_regions_you_sell_in}<i className="required-flag">*</i></span>
                    <input type="text" name="regions_sell_in" ref="regions_sell_in" onChange={this.valueChange.bind(this)} value={this.state.formData.regions_sell_in} />
                  </p>
                  <p className={"input-normal " + (this.state.formData.channels_sell_through ? 'fill' : '')}>
                    <span className="placeholder">{compo.placeholder_the_channels_you_sell_through}<i className="phone-hide"> ({compo.placeholder_the_channels_you_sell_through_remark})</i><i className="required-flag">*</i></span>
                    <input type="text" name="channels_sell_through" ref="channels_sell_through" onChange={this.valueChange.bind(this)} value={this.state.formData.channels_sell_through} />
                  </p>
                  <p>{compo.do_you_sell_on_3rd_party_platforms}<i className="required-flag">*</i>:</p>
                  <p className="radio-box">
                    <label>
                      <input type="radio" name="sell_on_3rd_platforms" value="Yes" onChange={this.valueChange.bind(this)} checked={this.state.formData.sell_on_3rd_platforms == "Yes"} />
                      {compo.business_option_yes}
                    </label>
                    <label>
                      <input type="radio" name="sell_on_3rd_platforms" value="No" onChange={this.valueChange.bind(this)} checked={this.state.formData.sell_on_3rd_platforms == "No"} />
                      {compo.business_option_no}
                    </label>
                  </p>
                  {this.state.formData.sell_on_3rd_platforms !== "Yes" ? '' :
                    <p className={"input-normal " + (this.state.formData.sell_platforms ? 'fill' : '')}>
                      <span className="placeholder">{compo.if_yes_which_platforms}<i className="required-flag">*</i></span>
                      <input type="text" name="sell_platforms" ref="sell_platforms" onChange={this.valueChange.bind(this)} value={this.state.formData.sell_platforms} />
                    </p>
                  }
                  <p className={"input-normal " + (this.state.formData.yearly_revenue ? 'fill' : '')}>
                    <span className="placeholder">{compo.placeholder_your_yearly_revenue}</span>
                    <input type="text" name="yearly_revenue" onChange={this.valueChange.bind(this)} value={this.state.formData.yearly_revenue} />
                  </p>
                  <p className={"input-normal monthly-purchase " + (this.state.formData.monthly_purchase ? 'fill' : '')}>
                    <span className="placeholder">{compo.placeholder_the_expected_monthly_purchase_value}<i className="required-flag">*</i></span>
                    <input type="text" name="monthly_purchase" ref="monthly_purchase" onChange={this.valueChange.bind(this)} value={this.state.formData.monthly_purchase} />
                  </p>
                </div>
              }
              {this.state.purpose_key !== 'others' ? '' :
                <div>
                  <p className={"input-normal " + (this.state.formData.purchase_others ? 'fill' : '')}>
                    <span className="placeholder">{compo.if_others_describe_your_purchase_purpose}</span>
                    <input type="text" name="purchase_others" onChange={this.valueChange.bind(this)} value={this.state.formData.purchase_others} />
                  </p>
                </div>
              }
              {this.state.formData.products.map((item, i) => {
                return (
                  <div className="products" key={i}>
                    <p className={"input-normal " + (this.state.formData.products[i].name ? 'fill' : '')}>
                      <span className="placeholder">{compo.placeholder_product}</span>
                      <input type="text" name="name" ref={`product_${i}`} onChange={this.productChange.bind(this, i)} value={this.state.formData.products[i].name} />
                    </p>
                    <p className={"input-normal " + (this.state.formData.products[i].quantity ? 'fill' : '')}>
                      <span className="placeholder">{compo.placeholder_quantity}</span>
                      <input type="text" name="quantity" onChange={this.productChange.bind(this, i)} value={this.state.formData.products[i].quantity} />
                    </p>
                    <p className={"input-normal " + (this.state.formData.products[i].link ? 'fill' : '')}>
                      <span className="placeholder">{compo.business_placeholder_product_link}</span>
                      <input type="text" name="link" onChange={this.productChange.bind(this, i)} value={this.state.formData.products[i].link} />
                    </p>
                  </div>
                );
              })}
              <p>
                <button type="button" className="add-more" onClick={this.addProduct.bind(this)}><i className="iconfont">&#xe616;</i> {compo.business_add_more}</button>
              </p>
              <p className={"input-normal fill " + (this.state.formData.delivery_date ? 'fill' : '')}>
                <span className="placeholder">{compo.placeholder_desired_delivery_date}</span>
                <input type="date" name="delivery_date" onChange={this.valueChange.bind(this)} value={this.state.formData.delivery_date} />
              </p>
              <p>
                {/*<label className="placeholder">A Message</label>*/}
                <textarea name="message" className="large" onChange={this.valueChange.bind(this)} value={this.state.formData.message} placeholder={compo.business_placeholder_message} />
              </p>
            </div>

            <div className="captcha-box">
              <span className={"input-normal captcha " + (this.state.formData.captcha ? 'fill' : '')}>
                <span className="placeholder">{common.verification_code_placeholder}</span>
                <input name="captcha" ref="captcha" autoComplete="off" onChange={this.valueChange.bind(this)} value={this.state.formData.captcha} />
              </span>
              <img className="captcha-img" src={this.state.captcha_url} onClick={this.getCaptchaCode.bind(this)} />
              <p>
                <button type="submit" className="button-normal submit">{common.submit}</button>
                <button type="reset" className="button-normal reset" onClick={this.resetForm.bind(this)}>{common.reset}</button>
              </p>
            </div>
          </form>
          </div>
        </div>
        <div className="space-100"></div>
      </div>
    );
  }
}

export default BusinessApply;
