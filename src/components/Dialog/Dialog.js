/**
 * Created by leon on 2015-11-26 14:57:36.
 */
/*
usage:
$$- import:
import Dialog from '../Dialog';
$$- add funcs:
showDialog() {
  this.setState({
    showDialog: true,
    dialogContent: (<div>sdfsdf</div>), // React 元素
  });
}
closeDialog(){
  this.setState({
    showDialog: false,
  });
}
$$- render():
  {this.state.showDialog ? <Dialog content={this.state.dialogContent} close={this.closeDialog.bind(this)} /> : ''}

$$- Ps:
1. close 参数为可选, 如果不传, dialog也可以通过点击关闭button关闭
*/

import React, { PropTypes, Component } from 'react';
import styles from './Dialog.scss';
import withStyles from '../../decorators/withStyles';

// import AppActions from '../../core/AppActions';
// import Link from '../../utils/Link';

@withStyles(styles)
class Dialog extends Component {

  static propTypes = {
    // close: PropTypes.func,
    // content: PropTypes.object, //PropTypes.element
  };

  componentWillMount() {
    this.setState({
      'content':'',
      'title':'',
      'dialogType':'tips',
      'close': this.props.close
    });
  };
  componentDidMount() {
    this.setState({'close':this.props.close});
  };
  componentWillReceiveProps(next) {
    const body = document.body;
    if (next.content) {
      body.classList.add('disableScroll'); // IE >= 10
    } else {
      body.classList.remove('disableScroll');
    }
    const p = this;
    this.setState(next);
    if(this.state.func) {
      clearTimeout(this.state.func);
    }
    if(next.content && next.dialogType !='confirm' && next.dialogType !='auto') {
      this.state.func = setTimeout(function() {
        p.closeDialog();
      }, 3000);
    }
  };

  closeDialog() {
    if (this.state.close) {
      this.state.close();
    } else {
      this.setState({'content':''});
      document.body.classList.remove('disableScroll');
    }
  };
  /** div dangerouslySetInnerHTML**/
  render() {
    let content = '';
    if(this.state.dialogType ==='auto' || typeof(this.state.content) === "string") {
      content = this.state.content;
    }
    else if (typeof(this.state.content) === 'object') {
      if(this.state.content.errors) {
        let index = 0;
        for (let i in this.state.content.errors) {
          index++;
          if(index > 1) {
            content += ' ; ';
          }
          if (i === 'base') {
            this.state.content.errors.base.map((item) => {
             content += item;
            });
          } else {
            content +=  i + ' ' + this.state.content.errors[i];
          }
        }
      } else if(this.state.content.error || this.state.content.exception) {
        content = this.state.content.error || this.state.content.exception ;
      } else {
        content = 'Error!';
      }
    }
    return (
      !content ? <div className="Empty"></div> :
      <div className='Dialog'>
        <div className="Dialog-mask"></div>
        <div className="Dialog-container">
          {this.state.dialogType !=='success' ?
            <header className="dialogHeader">
              <h2>{this.state.title || '' }</h2>
            </header> : ''
          }
          <section>
            <div className="dialogContenter">{content}</div>
          </section>
          {this.state.buttons ?
            <footer className="dialogFooter">{this.state.buttons}</footer>
            : ''
          }
        </div>
      </div>
    );
  }
}

export default Dialog;
