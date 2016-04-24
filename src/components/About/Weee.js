/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { PropTypes, Component } from 'react';
import withStyles from '../../decorators/withStyles';
import styles from './Weee.scss';
import Link from '../../utils/Link';
import Http from '../../core/HttpClient';
import Helper from '../../utils/Helper';
import PopupSignup from '../Authorize/PopupSignup';

@withStyles(styles)
class WEEE extends Component {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  componentWillMount() {
    const data = this.props.data;
    this.setState({
    });
  }
  componentWillReceiveProps(nextProps) {
    // console.log(this.props, nextProps);
    // var data = nextProps.data || {};
  }
  componentDidMount() {
  }

  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['weee'];
    this.context.onSetTitle(compo.weee_title);
    return (
      <div className="weee">
        <PopupSignup i18n={i18n}/>
        <div className="module-container">
          <div className="title">
            <h2>{compo.weee_sub_title}</h2>
            {/*<p>Whatever your question, we’re here to help.</p>*/}
          </div>
          <div className="content" dangerouslySetInnerHTML={{__html: compo.weee_content}} />
        </div>
        <div className="space-100"></div>
      </div>
    );
  }

}

export default WEEE;
