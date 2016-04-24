/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { PropTypes, Component } from 'react';
import withViewport from '../../decorators/withViewport';
import withStyles from '../../decorators/withStyles';
import styles from './Business.scss';
import Link from '../../utils/Link';
import PopupSignup from '../Authorize/PopupSignup';
import { autoLink } from '../../utils/Helper';

@withViewport
@withStyles(styles)
class Business extends Component {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };
  componentWillMount() {
    this.setState({
      actives: [],
    });
  }

  componentWillReceiveProps(nextProps) {
    // console.log(this.props.viewport, nextProps.viewport);
    const isMobile = (nextProps.viewport.width || window.innerWidth) < 768;
    let actives = this.state.actives;
    if (!isMobile) {
      actives = actives.slice(0, 1); // keep only first
      this.setState({
        actives: actives,
      });
    }
  }

  componentDidMount() {
    // window.addEventListener('resize', this.handleResize.bind(this)); // console.log(window.innerWidth);
  }

  showDetail(index, event) {
    const isMobile = (this.props.viewport.width || window.innerWidth) < 768;
    let actives = isMobile ? this.state.actives : []; // mobile可显示多个, tablet只显示1个;
    const i = actives.indexOf(index);
    // console.log(isMobile, index, i);
    (-1 === i) ? actives.push(index) : actives.splice(i, 1); // not exist: add; exist: delete;
    // console.log(actives);
    this.setState({
      actives: actives,
    });
  }

  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['business'];
    this.context.onSetTitle(compo.business_title);
    return (
      <div className="Business">
        <PopupSignup i18n={i18n}/>
        <div className="module-container">
          <div className="title">
            <h2>{compo.business_sub_title}</h2>
          </div>
          <div className="content">
            <div onClick={ autoLink } dangerouslySetInnerHTML={{__html: compo.business_sub_desc}}/>
            <ul className="list">
              {compo.business_list && compo.business_list.map((item, i) => {
                const index = i + 1;
                return (
                  <li key={i}>
                    <div className="summary">
                      <p className="img" style={{backgroundImage: 'url(' + require(`../../public/business/business${index}.jpg`) + ')'}} />
                      <div className="cnt">
                        <h4>{item.title}</h4>
                        <div className="ellipsis" dangerouslySetInnerHTML={{__html: item.summary}}/>
                        <p className="btns">
                          <button onClick={this.showDetail.bind(this, index)}>{compo.learn_more}</button>
                        </p>
                        <i className={'line' + (-1 !== this.state.actives.indexOf(index) ? ' active' : '')}></i>
                      </div>
                    </div>
                    <div className={`desc detail${index}` + (-1 !== this.state.actives.indexOf(index) ? ' active' : '')}>
                      <h4>{item.title}</h4>
                      <div dangerouslySetInnerHTML={{__html: item.text}}/>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className="space-100"></div>
      </div>
    );
  }

}

export default Business;
