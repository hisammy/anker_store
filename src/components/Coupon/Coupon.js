import React, { PropTypes, Component} from 'react';
import AppActions from '../../core/AppActions';
import Location from '../../core/Location';
import Http from '../../core/HttpClient';
import styles from './Coupon.scss';
import withStyles from '../../decorators/withStyles';
import Dialog from '../Dialog';
import Verify from '../../utils/Verify';
import Menber from '../Member/Member.js';

@withStyles(styles)
class Coupon extends Component {
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  componentWillMount() {
    this.setState({
      'coupons': this.props.data ? this.props.data.coupons : [],
      'coupon_code': '',
      'dialogOption':{}
    });
  }

  componentDidMount() {
    this.setState({
      'dialogOption':{close:this.closeDialog.bind(this)}
    });
  }

  setValue(event) {
    this.setState({
      'coupon_code': event.target.value
    });
  }

  getList = async () => {
    const json = await Http.post('get', '/api/content?path=/api/promotions/coupons');
    if (json.coupons) {
      this.setState({
        coupons: json.coupons,
        coupon_code: ''
      });
    } else {
      this.state.dialogOption.content = json;
      this.state.dialogOption.dialogType = 'tips';
      this.setState(this.state);
    }
  };
  submit = async () => {
    const i18n = this.props.i18n || {};
    // const common = i18n['common'] || {};
    const compo = i18n['rewards'];
    if (!this.state.coupon_code) {
      this.state.dialogOption.content = compo.fill_promo_code;
      this.state.dialogOption.dialogType = 'tips';
      this.setState(this.state);
      return;
    }
    const body = {'coupon_code': this.state.coupon_code};
    const json = await Http.post('POST', '/api/content?path=/api/promotions/bind_coupon', body);
    if (json.code) {
      this.state.dialogOption.content = compo.rewards_promo_code_added;
      this.state.dialogOption.dialogType = 'success';
      this.setState(this.state);
      this.state.coupon_code = '';
      this.getList();
    } else {
      this.state.dialogOption.content = json;
      this.state.dialogOption.dialogType = 'tips';
      this.setState(this.state);
    }
  }
  closeDialog(event) {
    this.state.dialogOption.content = '';
    this.setState(this.state);
  }
  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['rewards'];
    this.context.onSetTitle(compo.rewards_title);
    return (
      <div className="Coupon">
        <Menber i18n={i18n} data="rewards" />
        <Dialog {... this.state.dialogOption} />
        <div className="Coupon-container">
          <h3>{compo.rewards_new_reward}</h3>
          <div className="code">
            <div><div className={"input-normal " + (this.state.coupon_code ? 'fill' : '')}>
               <span className="placeholder">{compo.rewards_discount_code}<i className="required-flag">*</i></span>
               <input type="text" name="coupon_code" value={this.state.coupon_code} onChange={this.setValue.bind(this)}/>
            </div></div>
            <span className="submit"><button onClick={this.submit.bind(this)}>{compo.rewards_apply_code}</button></span>
          </div>
        </div>
        <h3>{compo.rewards_my_rewards}</h3>
        <ul className="Coupon-list">
            {this.state.coupons.length ? this.state.coupons.map(function (item, i) {
              return (
                <li key={i} className={item.display_state.toLowerCase() === "unused" ? "" : "used" }>
                  <a>
                    <div className="couponName">{item.display_promotion}</div>
                    <div>{i18n.format(compo.status_colon, item.display_state)}</div>
                    <div>{i18n.format(compo.name_colon, item.name)}</div>
                    <div>{i18n.format(compo.rewards_date_format, Verify.dateFormat(item.starts_at,'MM/dd/yyyy'), Verify.dateFormat(item.expires_at,'MM/dd/yyyy'))}</div>
                    <div>{i18n.format(compo.note_colon, item.description)}</div>
                  </a>
                </li>
              );
            }) : ''}
          </ul>
      </div>
    );
  }

}

export default Coupon;
