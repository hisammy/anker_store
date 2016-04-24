/**
 * Created by Leon on 2016-02-01 11:27:00
 */

import React, { PropTypes, Component } from 'react';
import styles from './GlassScreenProtectors.scss';
import withStyles from '../../decorators/withStyles.js';
import classNames from 'classnames';
// import AppActions from '../../core/AppActions';
// import Location from '../../core/Location';
// import Link from '../../utils/Link';

@withStyles(styles)
class GlassScreenProtectors extends Component {

  static propTypes = {
  };
  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };

  componentWillMount() {
    const i18n = this.props.i18n || {};
    // const common = i18n['common'] || {};
    const compo = i18n['support'];
    let state = {
      data: [
        {
          name: compo.pet_glass_type_phone,
          link: '#phone',
          type: [
              {
                  title: "iPhone",
                  vlink: "https://youtu.be/YPTOwqpoa5I",
                  list: [
                      {
                        name: "iPhone 6",
                      },
                      {
                        name: "iPhone 6 Plus",
                      },
                  ],
              },
              {
                title: "Android",
                vlink: "https://youtu.be/f5zU1KtBQB4",
                list: [
                  {
                    name: "Galaxy S5",
                  },
                  {
                    name: "One M9",
                  },
                ]
              }
          ],
        }
        ,{
          name: compo.pet_glass_type_tablet,
          link: '#tablet',
          type: [
            {
              title: "iPad",
              vlink: "https://youtu.be/f5zU1KtBQB4",
              list: [
                {
                  name: "iPad Air 2",
                },
                {
                  name: "iPad Air",
                },
                {
                  name: "iPad Mini 3",
                },
                {
                  name: "iPad Mini 2",
                },
                {
                  name: "iPad Mini",
                },
              ]
            },
          ],
        }
      ],
    };
    state.current_cate = state.data[0];
    this.setState(state);
  }
  componentDidMount() {
  }
  cateChange(i, event) {
    event.preventDefault();
    const elem = event.target;
    const type = elem.getAttribute('href').slice(1);
    // console.log(type);
    this.state.current_cate = this.state.data[i];
    this.setState(this.state);
  }
  showDetail(typeIdx, i, evnet) {
    console.log(typeIdx, i);
  }

  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['support'];
    this.context.onSetTitle(compo.glass_title);
    const currentCate = this.state.current_cate || {};
    return (
        <div className="module-container GlassScreenProtectors">
          <div className="title">
            <h1>{compo.glass_main_title}</h1>
            <p className="tip">{compo.pet_glass_select_yours}</p>
          </div>
          <div className="content">
            <nav className="nav">
              {this.state.data.map((cate, i) => {
                return (
                  <a href={cate.link} className={currentCate.link == cate.link ? 'active' : ''} onClick={this.cateChange.bind(this, i)} key={i}>
                    {cate.name}
                  </a>
                );
              })}
            </nav>
            <div className="box">
              <div className="list">
                {currentCate.type.map((t, ti) => {
                  const list = t.list || [];
                  return (
                    <dl key={ti}>
                      <dt>{t.title}</dt>
                      <dd>
                        {list.map((l, i) => {
                          const link = l.link || t.vlink || currentCate.vlink; // 逐级向上查
                          return (
                            <p onClick={this.showDetail.bind(this, ti, i)} key={i}>
                              <a href={link} target="_blank">
                                {l.name}
                              </a>
                            </p>
                          );
                        })}
                      </dd>
                    </dl>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="space-100"></div>
        </div>
    );
  }
}

export default GlassScreenProtectors;
