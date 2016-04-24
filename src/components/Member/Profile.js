import React, { PropTypes, Component } from 'react';
import AppActions from '../../core/AppActions';
import Location from '../../core/Location';
import Http from '../../core/HttpClient';
import withStyles from '../../decorators/withStyles';
import styles from './Profile.scss';
import Dialog from '../Dialog';
import Verify from '../../utils/Verify';
import Menber from './Member.js';
import Calendar from 'react-input-calendar';

@withStyles(styles)
class Profile extends Component {

  static propTypes = {
    data: PropTypes.object.isRequired
  };
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  componentWillMount() {
    const data = this.props.data;
    this.state = {
      'host': 'm.anker.com',
      'is_power_user': data ? data.is_power_user : false,
      'data': {},
      'country':[],
      'editdata': {},
      'isPC':false,
      'dialogOption':{},
      'editable': '',
      'is_subscribe':false,
      'statelist': {
        'states': []
      },
      'reg': {
        'email': /^&/,
        'gender': /^$/,
        'dob': /^$/,
        'phone_number': /^$/,
        'country_id': /^$/,
        'state_id': /^$/,
        'nick_name': /^$/
      }
    };
    if(!global.server){
      AppActions.setProfile(this.props.data);
    }
  }

  componentDidMount() {
    let isPC = Verify.isPC();
    this.setState({
      'host': location.host,
      'isPC': isPC,
      'dialogOption':{close:this.closeDialog.bind(this)}
    });

    this.props.data.dob = this.props.data.dob ? this.props.data.dob : '';
    if(!isPC && this.props.data.birthday){
      this.props.data.birthday = this.props.data.birthday.substr(6,4) + "-" + this.props.data.birthday.substr(0,2) + "-" + this.props.data.birthday.substr(3,2);
    }
    this.setState({
      'editdata': this.props.data
    });
    console.info(this.props.data.is_subscribe);
    this.setEditProfile(this.props.data);
    this.getState();
    this.getCountry();
  }

  getState = async (countryId) => {
    countryId = countryId || this.props.data.country_id;
    if(!countryId){return;}
    const json = await Http.post('get', '/api/content?path=/api/countries/'+ countryId +'/states');
    if (json.states) {
      this.setState({
        'statelist': json
      });
    }
    else{
     this.setState({
        'statelist': {'states': []}
      });
     }
  };

  setEditProfile(json) {
    AppActions.setProfile(json);
    /*
    this.setState({
      'editdata': json
    });*/
  }

  valueChange(event) {
    if(!event || typeof(event) === 'string'){
      event = event ? event.replace(/-/g,'/') : '';
      this.state.editdata['birthday'] = event;
    }
    else{
      if(event.target.name === 'is_subscribe'){
        //this.props.data.is_subscribe = event.target.checked || false;
        this.state.editdata['is_subscribe'] = event.target.checked || false;
      }else{
        this.state.editdata[event.target.name] = event.target.value;
      }
      if(event.target.name === "country_id"){
        this.getState(event.target.value);
      }
    }
    this.setState({
      'editdata': this.state.editdata
    });
  }

  profileSubmit = async (e) => {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['profile'];
    e.preventDefault();
    const body = {
      'profile': this.state.editdata
    };
    if(body.profile.birthday){
      body.profile.dob = Verify.dateFormat(body.profile.birthday, 'yyyy/MM/dd');
    }else{
      delete body.profile.dob;
    }
    const json = await Http.post('put', '/api/content?path=/api/users/update_profile', body);
    if (json.id) {
      this.setState({
        data: json
      });
      localStorage.setItem('nick_name', json.nick_name);
      this.state.dialogOption.content = compo.profile_changes_saved;
      this.state.dialogOption.dialogType = 'success';
      this.setState(this.state);
      this.setEditProfile(json);
      document.getElementById("member_niceName").innerHTML = json.nick_name || this.state.editdata.login || compo.profile_default_nickname;
      document.getElementById("heard_nickName").innerHTML = json.nick_name || this.state.editdata.login || compo.profile_default_nickname;
    } else {
      this.state.dialogOption.content = json;
      this.state.dialogOption.dialogType = 'tips';
      this.setState(this.state);
    }
  };
  getCountry = async() =>{
    const json = await Http.post('get', '/api/content?path=/api/countries',{"page": 0, "per_page": 1000});
    if (json.countries) {
      this.state.country = json.countries;
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
    const compo = i18n['profile'];
    this.context.onSetTitle(compo.profile_title);
    return (
      <div className="Profile">
        <Menber i18n={i18n} data="profile" nick_name={this.state.editdata.nick_name} />
        <Dialog {... this.state.dialogOption} />
        <div className="Profile-container">
          <div className="profile">
          <form onSubmit={this.profileSubmit.bind(this)}>
            <div className="userName">
              <div className={"input-normal " + (this.state.editdata.nick_name ? 'fill' : '')}>
               <span className="placeholder">{compo.profile_placeholder_username}</span>
               <input autoComplete="off"  name="nick_name"  maxLength="200" type="text" value={this.state.editdata.nick_name} onChange={this.valueChange.bind(this)} />
              </div>
            </div>
            <div className="email">
              <div className="input-normal fill">
               <span className="placeholder">{compo.profile_placeholder_email}<i className="required-flag">*</i></span>
               <input autoComplete="off" maxLength="200" disabled="true"  value={this.state.editdata.login}/>
              </div>
            </div>
            <div className="dob">
              {this.state.isPC ?
                <div className={"input-normal span-calendar " + (this.state.editdata.birthday ? 'fill' : '')}>
                  <span className="placeholder">{compo.profile_placeholder_birthday}</span>
                  <Calendar format="MM/DD/YYYY" closeOnSelect='true' openOnInputFocus="true" hideIcon="true"  date={this.state.editdata.birthday} onChange={this.valueChange.bind(this)}  />
                </div>
                :
                <div className="input-normal fill">
                  <span className="placeholder">{compo.profile_placeholder_birthday}</span>
                  <input name="birthday"  maxLength="200"  type="date"  value={this.state.editdata.birthday} onChange={this.valueChange.bind(this)} />
                </div>
              }
            </div>
            <div className="gender">
              <div className={"input-normal " + (this.state.editdata.gender ? 'fill' : '')}>
                 <span className="placeholder">{compo.profile_placeholder_gender}</span>
                 <select autoComplete="off" name="gender" onChange={this.valueChange.bind(this)}>
                    <option value=""></option>
                    <option selected={"male" === this.state.editdata.gender ? true : false} value="male">{compo.profile_male}</option>
                    <option selected={"female" === this.state.editdata.gender ? true : false} value="female">{compo.profile_female}</option>
                  </select>
              </div>

            </div>
            <div className="phone">
              <div className={"input-normal " + (this.state.editdata.phone_number ? 'fill' : '')}>
               <span className="placeholder">{common.phone_number}</span>
               <input autoComplete="off" maxLength="200" name="phone_number" type="tel" onChange={this.valueChange.bind(this)} value={this.state.editdata.phone_number}/>
              </div>
            </div>
            <div className="country">
              <div className={"input-normal " + (this.state.editdata.country_id ? 'fill' : '')}>
               <span className="placeholder">{common.country}</span>
               <select placeholder="country"  name="country_id" onChange={this.valueChange.bind(this)} disabled={this.state.is_power_user ? true : false}>
                <option></option>
                {this.state.country.map((item, i) =>  {
                  return (
                    <option key={i} selected={item.id === this.state.editdata.country_id ? true : false} value={item.id}>{item.name}</option>
                  );
                })}
                </select>
              </div>

            </div>
            <div className="state">
              <div className={"input-normal " + (this.state.editdata.state_id ? 'fill' : '')}>
               <span className="placeholder">{common.state}</span>
               <select autoComplete="off" defaultValue={this.state.data.state_id} name="state_id" onChange={this.valueChange.bind(this)}>
                <option selected={!this.state.editdata.state_id ? true : false} ></option>
                {this.state.statelist.states.map((item, i) =>  {
                  return (
                    <option key={i} value={item.id} selected={item.id === this.state.editdata.state_id ? true : false} >{item.name}</option>
                  );
                })}
              </select>
              </div>

            </div>


            <div className="city">
              <div className={"input-normal " + (this.state.editdata.city ? 'fill' : '')}>
               <span className="placeholder">{common.city}</span>
               <input type="text" name="city" value={this.state.editdata.city}  onChange={this.valueChange.bind(this)} />
              </div>

            </div>
            <div className="zipCode">
              <div className={"input-normal " + (this.state.editdata.zipcode ? 'fill' : '')}>
               <span className="placeholder">{common.zipcode}</span>
               <input type="text" name="zipcode" value={this.state.editdata.zipcode}  onChange={this.valueChange.bind(this)} />
              </div>
            </div>
              <div className="submit"><button>{common.submit}</button></div>
              <div className="submit"><input type="checkbox" name="is_subscribe" checked={this.state.editdata.is_subscribe} onChange={this.valueChange.bind(this)} /><a> {compo.profile_subscribe}</a></div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default Profile;
