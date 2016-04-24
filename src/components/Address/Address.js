/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { PropTypes, Component} from 'react';
import AppActions from '../../core/AppActions';
import Http from '../../core/HttpClient';
import styles from './Address.scss';
import withStyles from '../../decorators/withStyles';
import Dialog from '../Dialog';
import Link from '../../utils/Link';
import Menber from '../Member/Member.js';

@withStyles(styles)
class Address extends Component {
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  componentWillMount() {
    this.setState({
      'addresses': this.props.data ? this.props.data.addresses : [],
      'states':[],
      'editdata':{"country_id":232}
    });
  }
  componentDidMount() {
    this.setState({
      'dialogOption':{close:this.closeDialog.bind(this)}
    })
    this.getState();
  }
  getList = async () => {
    const json = await Http.post('GET', '/api/content?path=/api/extend_addresses');
    if (json.addresses) {
      this.setState({
        addresses: json.addresses
      });
    }
  };
  setDefault = async (id, e) => {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['address'];
    e.preventDefault();
    const json = await Http.post('PUT', '/api/content?path=/api/extend_addresses/' + id + '/set_default');
    if (json.error || json.exception) {
      this.setState({
        dialogOption: {
          content:json,
          dialogType:'tips'
        }
      });
    } else {
      this.setState({
        dialogOption: {
          content: compo.address_primary_address_changed,
          dialogType:'success'
        }
      });
      this.getList();
    }
  };
  deleteAddress = async (id, index,e) => {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['address'];
    e.preventDefault();
    if(this.state.editdata.id == id){
      this.state.editdata = {"country_id":232};
      this.setState(this.state);
    }
    const json = await Http.post('DELETE', '/api/content?path=/api/extend_addresses/' + id);
    if (json && (json.error || json.exception)) {
      this.setState({
        dialogOption: {
          content: json.error || json.exception,
          dialogType:'tips'
        }
      });
    } else {
      this.setState({
        dialogOption: {
          content: compo.address_address_deleted,
          dialogType:'success'
        }
      });
      this.getList();
    }
  };
  editAddr(index){
    this.state.editdata = this.state.addresses[index];
    this.setState(this.state);
    document.body.scrollTop = 250;
  }
  valueChange(event){
    this.state.editdata[event.target.name] = event.target.value;
    if(event.target.name === 'state_id') {
      this.state.editdata['state_name'] = event.target.selectedOptions.item(0).text;
    }
    this.setState({
      'editdata': this.state.editdata
    });
  }
  saveAddr = async (e) => {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['address'];
    e.preventDefault();
      this.state.dialogOption.dialogType = 'tips';
    if(!this.state.editdata.firstname) {
      this.state.dialogOption.content = common.fill_first_name;
      this.setState(this.state);
      return false;
    }
    if(!this.state.editdata.lastname) {
      this.state.dialogOption.content = common.fill_last_name;
      this.setState(this.state);
      return false;
    }
    if(!this.state.editdata.address1) {
      this.state.dialogOption.content = common.fill_address;
      this.setState(this.state);
      return false;
    }
    if(!this.state.editdata.state_id) {
      this.state.dialogOption.content = common.fill_state;
      this.setState(this.state);
      return false;
    }
    if(!this.state.editdata.city) {
      this.state.dialogOption.content = common.fill_city;
      this.setState(this.state);
      return false;
    }
    if(!this.state.editdata.zipcode) {
      this.state.dialogOption.content = common.fill_zipcode;
      this.setState(this.state);
      return false;
    }
    if(!this.state.editdata.phone) {
      this.state.dialogOption.content = common.fill_phone;
      this.setState(this.state);
      return false;
    }
    let url ='/api/extend_addresses', method ='post';
    if(this.state.editdata.id){
        url +='/'+this.state.editdata.id;
        method = 'put';
    }
    delete this.state.editdata.isDefault;
    const json = await Http.post(method, '/api/content?path=' + url, {address:this.state.editdata});
    if(json.address) {
      this.state.editdata = {"country_id":232,"state_id":""};
      this.state.dialogOption.dialogType="success";
      this.state.dialogOption.content = compo.address_address_added;
      this.setState(this.state);
      this.getList();

    } else {
        this.state.dialogOption.dialogType="tips";
        this.state.dialogOption.content=json;
        this.setState(this.state);
    }
  }
  getState = async () => {
      const json = await Http.post('get', '/api/content?path=/api/countries/232/states');
      if (json.states) {
        this.setState({
          'states': json.states
        });
      }
  };
  closeDialog(event) {
    this.state.dialogOption.content = '';
    this.setState(this.state);
  }
  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['address'];
    this.context.onSetTitle(compo.address_title);
    return (
      <div className="Address">
        <Menber i18n={i18n} data="address" />
        <Dialog  {... this.state.dialogOption}  />
        <div className="Address-container">
          <div>
            <h3>{compo.address_term_new_address}</h3>
            <form onSubmit={this.saveAddr.bind(this)}>
            <div className="firstname">
              <div className={"input-normal " + (this.state.editdata.firstname ? 'fill' : '')}>
               <span className="placeholder">{common.first_name}<i className="required-flag">*</i></span>
               <input type="text" name="firstname" value={this.state.editdata.firstname} onChange={this.valueChange.bind(this)}  />
              </div>
            </div>
            <div className="lastname">
              <div className={"input-normal " + (this.state.editdata.lastname ? 'fill' : '')}>
               <span className="placeholder">{common.last_name}<i className="required-flag">*</i></span>
               <input type="text" name="lastname" value={this.state.editdata.lastname} onChange={this.valueChange.bind(this)}  />
              </div>
            </div>
            <div className="address1">
              <div className={"input-normal " + (this.state.editdata.address1 ? 'fill' : '')}>
               <span className="placeholder">{common.address_line_1}<i className="required-flag">*</i></span>
               <input type="text" name="address1" value={this.state.editdata.address1} onChange={this.valueChange.bind(this)}  />
              </div>
            </div>
            <div className="address2">
              <div className={"input-normal " + (this.state.editdata.address2 ? 'fill' : '')}>
               <span className="placeholder">{common.address_line_2}</span>
               <input type="text" name="address2" value={this.state.editdata.address2} onChange={this.valueChange.bind(this)}  />
              </div>
            </div>
            <div className="addCountry">
              <div className="input-normal fill">
               <span className="placeholder">{common.country}<i className="required-flag">*</i></span>
               <select><option>{compo.default_country}</option></select>
              </div>
            </div>
            <div className="addState">
              <div className={"input-normal " + (this.state.editdata.state_id ? 'fill' : '')}>
               <span className="placeholder">{common.state}<i className="required-flag">*</i></span>
                <select className="state" autoComplete="off" name="state_id"  onChange={this.valueChange.bind(this)}>
                  <option value="" selected={this.state.editdata.state_id == "" ? true : false}></option>
                  {this.state.states.map((item, i) =>  {
                    return (
                      <option key={i} value={item.id} selected={item.id === this.state.editdata.state_id ? true : false} >{item.name}</option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className="city">
              <div className={"input-normal " + (this.state.editdata.city ? 'fill' : '')}>
               <span className="placeholder">{common.city}<i className="required-flag">*</i></span>
               <input type="text" name="city"  onChange={this.valueChange.bind(this)} value={this.state.editdata.city}  />
              </div>
            </div>
            <div className="zipCode">
              <div className={"input-normal " + (this.state.editdata.zipcode ? 'fill' : '')}>
               <span className="placeholder">{common.zipcode}<i className="required-flag">*</i></span>
               <input type="text" name ="zipcode"  onChange={this.valueChange.bind(this)} value={this.state.editdata.zipcode}  />
              </div>
            </div>
            <div className="phone">
              <div className={"input-normal " + (this.state.editdata.phone ? 'fill' : '')}>
               <span className="placeholder">{common.phone_number}<i className="required-flag">*</i></span>
               <input type="tel" name="phone"  onChange={this.valueChange.bind(this)} value={this.state.editdata.phone}  />
              </div>
            </div>
            <div className="btn"><button>{common.submit}</button></div>
            </form>
          </div>
          <h3 className="book">{compo.address_term_address_book}</h3>
          <ul className="list">
            {this.state.addresses.map((item, i) =>  {
              return (
                <li key={i}>
                  <div className="addrDetal">
                    <div>{item.firstname} {item.lastname}</div>
                    <div>{i18n.format(compo.phone_number_colon, item.phone)}</div>
                    <div>
                      {i18n.format(compo.address_colon, [
                        item.address1, item.address2
                      ].filter(o=>!!o).join(', '))}
                    </div>
                    <div>
                      {[item.city, item.state_name, compo.default_country_abbr].filter(o=>!!o).join(', ')}
                    </div>
                    <div>{i18n.format(compo.zip_code_colon, item.zipcode)}</div>
                   </div>
                   <div className="addrTool">
                    <a onClick={this.setDefault.bind(this, item.id)}><i className={item.isDefault===true?" iconfont setDefaultBtn selected" :"iconfont setDefaultBtn"}>&#xe651;</i></a>
                    <a onClick={this.deleteAddress.bind(this, item.id,i)}><i className="iconfont">&#xe63d;</i></a>
                    <a onClick={this.editAddr.bind(this, i)}><i className="iconfont">&#xe63f;</i></a>
                    </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }
}

export default Address;
