/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { PropTypes, Component } from 'react';
import withStyles from '../../decorators/withStyles';
import Verify from '../../utils/Verify';
import styles from './Press.scss';
import Location from '../../core/Location';
import PopupSignup from '../Authorize/PopupSignup';

@withStyles(styles)
class PressDetail extends Component {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };


  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['press'];
    this.context.onSetTitle(compo.press_title);
    return (
      <div className="PressDetail">
        <PopupSignup i18n={i18n}/>
        <div className="module-container">
          <div className="content">
            <div className="press-title">{this.props.data.detail.title}</div>
            <div className="press-subtitle">{this.props.data.detail.subtitle}</div>
            <div className="press-info">
              <span className="press-author">
                {i18n.format(compo.press_author, this.props.data.detail.author)}
              </span>
              <span className="press-date">
                {i18n.format(compo.press_date_time, Verify.dateFormat(this.props.data.detail.pub_time, 'MM/dd/yyyy hh:mm'))}
              </span>
            </div>
            <div className="press-content" dangerouslySetInnerHTML={{__html: this.props.data.detail.content}} />
          </div>
        </div>
      </div>
    );
  }

}

export default PressDetail;
