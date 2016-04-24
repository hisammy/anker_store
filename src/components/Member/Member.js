import React, { PropTypes, Component } from 'react';
import AppActions from '../../core/AppActions';
import withStyles from '../../decorators/withStyles';
import styles from './Member.scss';
import Dialog from '../Dialog';
import Link from '../../utils/Link';
import Http from '../../core/HttpClient';

@withStyles(styles)
class Member extends Component {

  static PropTypes = {
    data: PropTypes.object
  };

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  componentWillMount() {
    this.state = {
      "nick_name": "",
      "avatar_image" : "",
      "country":"",
      "dialogOption":'',
      "is_power_user":false
    }
  }
  componentDidMount() {
    let users = AppActions.getUser();
    this.state.dialogOption = {close:this.closeDialog.bind(this)};
    this.state.nick_name = users.nick_name;
    this.state.avatar_image = users.avatar;
    this.state.country = AppActions.getCountry();
    this.state.loginType = users.loginType;
    this.state.is_power_user = users.is_power_user;
    this.setState(this.state);
  }
  upload = async (event) => {
    const i18n = this.props.i18n || {};
    // const common = i18n['common'] || {};
    const compo = i18n['member'] || {};
    var file = event.target.files[0],p = this;
    if(file.type.indexOf('image') === -1) {
      this.state.dialogOption.content = compo.member_file_format_error;
      this.state.dialogOption.dialogType = 'tips';
      this.setState(this.state);
      return;
    }
    if(file.size > (1024 * 1024 * 5)) {
      this.state.dialogOption.content = compo.member_file_size_error;
      this.state.dialogOption.dialogType = 'tips';
      this.setState(this.state);
      return
    }
    AppActions.loading(true);
    var fd = new FormData();
    fd.append('fileName', file);
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function(evt) {
      p.uploadSuccess(evt)
    }, false);
    xhr.addEventListener('error', this.uploadFailed, false);
    xhr.open('POST', '/api/file?path=/api/users/edit_avatar');
    xhr.send(fd);
  }
  uploadSuccess(evt) {
    const i18n = this.props.i18n || {};
    // const common = i18n['common'] || {};
    const compo = i18n['member'] || {};
    var file = JSON.parse(evt.target.responseText)
    if(file.id) {
      this.setState({
        'avatar_image': file.avatar_image.mini_url
      });
      localStorage.setItem('avatar_image',this.state.avatar_image);
      AppActions.loading(false);
      this.state.dialogOption.content = compo.member_upload_success;
      this.state.dialogOption.dialogType = 'success';
      this.setState(this.state);
    } else {
      if(evt.target.status === 401){
        if(AppActions.getUser().token) {
          AppActions.signOut();
        } else if(AppActions.getUser().order_token && AppActions.getUser().order_id) {
          AppActions.removeOrder();
        }
        location.href = '/login?back=' + location.pathname.slice(1);
      }else{
        this.uploadFailed();
      }
    }
  }
  uploadFailed(evt) {
    const i18n = this.props.i18n || {};
    // const common = i18n['common'] || {};
    const compo = i18n['member'] || {};
    AppActions.loading(false);
    this.state.dialogOption.content = compo.member_upload_fail;
    this.state.dialogOption.dialogType = 'tips';
    this.setState(this.state);
  }
  closeDialog(event) {
    this.setState({
      dialogOption: {content:''},
    });
  }
  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['member'] || {};
    return (
      <div className="Member">
        <Dialog {... this.state.dialogOption} />
        <div className="bannerDiv">
          <div className="banner">
            <image src={require('../../public/menber.jpg')} />
            <div className="userImg">
              <img src={this.state.avatar_image ? this.state.avatar_image : require('../../public/user.jpg')} />
            </div>
            {
              this.state.is_power_user ?

            <div className="userImg puBackground">
              <img className="puImg" src={require('../../public/POWERUSERS-02.png')} />
              <img className="puTips" src={require('../../public/POWERUSERS-04.png')} />
            </div>
            :''}
            <div className="userInfo">
            <div className="userName" id="member_niceName">{this.state.nick_name}</div>
            <div className="imgUpload">
              <a href="javascript:;">{compo.member_change_photo}</a>
              <input type="file" accept="image/gif,image/png,image/jpg,image/bmp,image/jpeg" multiple="multiple" capture="camera" className="upload" onChange={this.upload.bind(this)}  />
            </div>
            {!this.state.loginType ?
            <div><a href="/password" onClick={Link.handleClick}>{compo.member_change_password}</a></div>
            :''}
          </div>
        </div>
        </div>
        {
          this.state.country === "US"?
        <ul>
          <li>
            <a className={this.props.data === "profile" ? "checked":""} href="/profile" onClick={Link.handleClick}>
              <i className="iconfont">&#xe670;</i>
              <span className="name">{compo.member_nav_profile}</span>
            </a>
          </li>
          <li>
            <a className={this.props.data === "orders" ? "checked":""} href="/orders" onClick={Link.handleClick}>
              <i className="iconfont">&#xe675;</i>
              <span className="name">{compo.member_nav_orders}</span>
            </a>
          </li>
          <li>
            <a className={this.props.data === "address" ? "checked":""} href="/address" onClick={Link.handleClick}>
              <i className="iconfont">&#xe676;</i>
              <span className="name">{compo.member_nav_address}</span>
            </a>
          </li>
          <li>
            <a className={this.props.data ==="rewards"?"checked":""} href="/rewards" onClick={Link.handleClick}>
              <i className="iconfont">&#xe674;</i>
              <span className="name">{compo.member_nav_rewards}</span>
            </a>
          </li>
        </ul>
        :
          <ul>
            <li className="wd">
            <a className={this.props.data === "profile" ? "checked":""} href="/profile" onClick={Link.handleClick}>
              <i className="iconfont">&#xe670;</i>
              <span className="name">{compo.member_nav_profile}</span>
            </a>
          </li>
          </ul>
        }
      </div>
    );
  }
}
export default Member;
