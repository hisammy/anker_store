/**
 * Created by Leon on 2016-02-01 11:27:00
 */

import React, { PropTypes, Component } from 'react';
import styles from './PETScreenProtectors.scss';
import withStyles from '../../decorators/withStyles.js';
import classNames from 'classnames';
// import AppActions from '../../core/AppActions';
// import Location from '../../core/Location';
// import Link from '../../utils/Link';

@withStyles(styles)
class PETScreenProtectors extends Component {

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
          vlink: "https://youtu.be/hZqLXNeE9sw",
          type: [
              {
                  title: "iPhone",
                  list: [
                      {
                        name: "iPhone 6",
                      },
                      {
                        name: "iPhone 6 Plus",
                      },
                      {
                        name: "iPhone 5s",
                      },
                      {
                        name: "iPhone 5c",
                      },
                      {
                        name: "iPhone 5",
                      },
                  ],
              },
              {
                title: "Android",
                list: [
                  {
                    name: "Nexus 5",
                  },
                  {
                    name: "Galaxy S4/Ⅳ Mini",
                  },
                  {
                    name: "Galaxy Note 4",
                  },
                  {
                    name: "Galaxy S6",
                  },
                  {
                    name: "Galaxy S5",
                  },
                  {
                    name: "Galaxy S4",
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
          vlink: "https://youtu.be/hZqLXNeE9sw",
          type: [
            {
              title: "iPad",
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
            {
              title: "Android",
              list: [
                {
                  name: "Galaxy Tab 3 10.1\"",
                },
                {
                  name: "MemO Pad HD 7",
                },
                {
                  name: "Galaxy Tab Pro",
                },
                {
                  name: "Nexus 7",
                },
                {
                  name: "Galaxy Tab S 10.5\"",
                },
                {
                  name: "Nexus 9",
                },
                {
                  name: "Galaxy Tab 3 8'",
                },
                {
                  name: "Galaxy Tab S 8.4\"",
                },
              ]
            }
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
    this.context.onSetTitle(compo.pet_title);
    const currentCate = this.state.current_cate || {};
    return (
        <div className="module-container PETScreenProtectors">
          <div className="title">
            <h1>{compo.pet_main_title}</h1>
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

export default PETScreenProtectors;
