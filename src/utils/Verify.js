/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

const Verify = {
  reg: {
    'nick_name': /^$/,
    'email': /^[a-zA-Z0-9]+([._\\-]*[a-zA-Z0-9])*@([a-zA-Z0-9]+[-a-zA-Z0-9]*[a-zA-Z0-9]+.){1,63}[a-zA-Z0-9]+$/,
    'phone': /\d+/,
    'zipcode': /^[a-zA-Z0-9]+$/,
    'firstname': /^[a-zA-Z]{1,20}|[\u4e00-\u9fa5]{1,10}$/,
    'lastname': /^[a-zA-Z]{1,20}|[\u4e00-\u9fa5]{1,10}$/,
    'address1': /^[0-9a-zA-Z]+$/,
    'address2': /.*/,
    'city': /^.*[^\s]+.*$/,
    'country_id': /^.*[^\s]+.*$/,
    'state_name': /.*/,
    'state_id': /^.*[^\s]+.*$/
  },
  isEmail: (val) => {
    return Verify.reg.email.test(val);
  },
  isPhone: (val) => {
    return Verify.reg.phone.test(val);
  },
  isPC:() =>{
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone","SymbianOS", "Windows Phone","iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
  },
  creditFormat(val) {
    val = val.replace(/\s*/g, '').split('');
    let vt = '';
    for (let i in val) {
      if (i % 4 === 0) {
        vt += ' ';
      }
      vt += val[i];
    }
    return vt;
  },
  dateFormat(date, format = 'MM/dd/yyyy hh:mm') {
    if (!date) return '';
    let d = typeof date != 'object' ? new Date(date) : date,
      fullyear = d.getFullYear(),
      month = d.getMonth() + 1,
      day = d.getDate(),
      hour = d.getHours(),
      minute = d.getMinutes(),
      second = d.getSeconds(),
      week = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()];
    let newDate = format.replace(/(y{4})/, fullyear) // 4位年
      .replace(/(y{2})/, (fullyear + '').substr(2)) // 2位年
      .replace('MM', month > 9 ? month : '0' + month) // 月
      .replace('dd', day > 9 ? day : '0' + day) // 日
      .replace('hh', hour > 9 ? hour : '0' + hour) // 小时
      .replace('mm', minute > 9 ? minute : '0' + minute) // 分钟
      .replace('ss', second > 9 ? second : '0' + second) // 秒
      .replace('E', week); // 星期
    return newDate;
  },
};

export default Verify;
