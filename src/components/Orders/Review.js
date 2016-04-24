/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { PropTypes, Component} from 'react';
import AppActions from '../../core/AppActions';
import Location from '../../core/Location';
import Http from '../../core/HttpClient';
import styles from './Review.scss';
import withStyles from '../../decorators/withStyles';
import Dialog from '../Dialog';
import Verify from '../../utils/Verify';
import Menber from '../Member/Member.js';

@withStyles(styles)
class Review extends Component {

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired
  };
  reviewList = [];
  componentWillMount() {
    const data = this.props.data || {};
    this.setState({
      'orderTime': '',
      'line_items': data.line_items,
      'isReview': false,
      'index':0
    })
   //this.setState();
  }
  componentDidMount(){
    this.setState({
      'dialogOption':{close:this.closeDialog.bind(this)},
      'index': AppActions.getUrlParam("index")
    });
  }
  onStar(index, e){
    if(!this.state.isReview){
      var star = parseInt(e.target.getAttribute('data-key') || -1 );
      if(star === -1) {return;}
      this.state.line_items[index]['review']['star'] = star + 1;
      this.setState(this.state);
    }
  }
  setValue(key, index, e){
    if(!this.state.isReview){
      this.state.line_items[index]['review'][key] = e.target.value;
    }
    this.setState(this.state);
  }
  submit = async () => {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['review'];

    var reviewList = [], p = this;
    for(var i = 0, j = this.state.line_items.length; i < j; i++){
      reviewList.push(this.state.line_items[i].review);
    }
    const json = await Http.post('POST','/api/content?path=/api/orders/' + this.props.data.number + '/reviews',{reviews: reviewList, his: 1});
    if(json.error || json.exception) {
      this.state.dialogOption.content = json;
      this.state.dialogOption.dialogType = 'tips';
      this.setState(this.state);
    } else {
      this.state.dialogOption.content = compo.review_success;
      this.state.dialogOption.dialogType = 'success';
      this.setState(this.state);
      Location.push( '/orders/' + this.props.data.number + "?his=1");
    }
  }
  cancel(){
    Location.push( '/orders/' + this.props.data.number + "?his=1");
  }
  backOrderList(){
    Location.push( '/orders/');
  }
  closeDialog(event) {
    this.setState({
      dialogOption: {content:''},
    });
  };
  render() {
    const i18n = this.props.i18n || {};
    const common = i18n['common'] || {};
    const compo = i18n['review'];
    this.context.onSetTitle(compo.review_title);
    if (!this.props.data) {
      return (
        <div className="empty"></div>
      );
    }
    return (
      <div className="Review">
        <Dialog {... this.state.dialogOption}  />
        <Menber i18n={i18n} data="orders" />
        <div className="ReviewDetail">
        <div className="orderPath">
          <a onClick={this.backOrderList.bind(this)} >{compo.review_orders}</a><span> > </span>
          <a onClick={this.cancel.bind(this)}>
            {i18n.format(compo.review_order, this.props.data.number)}
          </a>
        </div>
        <ul className="orderDetailList">
          {
          this.state.line_items ?
          this.state.line_items.map(function(item, i) {
            let defaultReview = {
                'line_item_id': item.id,
                'title': '',
                'content': '',
                'star': 5
              }, startList = [];
            if(!item.review) {
              item.review = defaultReview;
            }
            for(var z = 1; z < 6; z++) {
              item.review.star >= z ? startList.push(1) : startList.push(0);
            }

            return (<li>
              <div className="orderDetail">
                <img src={ item.variant.image.mini_url} />
                <div className="orderInfo">
                  <div>{item.variant.name}</div>
                  <div dangerouslySetInnerHTML={{__html: i18n.format(compo.color_colon, item.variant.option_values[0].name)}} />
                  <div dangerouslySetInnerHTML={{__html: i18n.format(compo.quantity_colon, item.quantity)}} />
                  <div dangerouslySetInnerHTML={{__html: i18n.format(compo.price_colon, item.display_amount)}} />
                </div>
                <div className="star" onClick={this.onStar.bind(this, i)}>
                {
                  startList.map(function(item, z){
                    return ((item === 0 ? <i className='iconfont' data-key={z}>&#xe630;</i>:<i className='iconfont onStar' data-key={z}>&#xe631;</i>));
                  })
                }
                </div>
              </div>
              <div className="reviewContent">
                <div>{this.state.isReview ?
                  <div className={"input-normal " + (item.review.title ? 'fill' : '')}>
                   <span className="placeholder">{compo.review_title}</span>
                   <input type="text" disabled="true" value={item.review.title} onChange={this.setValue.bind(this, 'title', i)} />
                </div> :
                  <div className={"input-normal " + (item.review.title ? 'fill' : '')}>
                   <span className="placeholder">{compo.review_title}</span>
                   <input type="text" value={item.review.title} onChange={this.setValue.bind(this, 'title', i)} />
                </div>
                }</div>
                <div>{this.state.isReview ?
                   <div className={"input-normal " + (item.review.content ? 'fill' : '')}>
                   <span className="placeholder">{compo.review_content}</span>
                   <textarea  disabled="true" onChange={this.setValue.bind(this,'content', i)} value={item.review.content}> </textarea>
                  </div>
                  : <div className={"textarea-normal " + (item.review.content ? 'fill' : '')}>
                   <span className="placeholder">{compo.review_content}</span>
                   <textarea onChange={this.setValue.bind(this,'content', i)} value={item.review.content}> </textarea>
                  </div>}</div>
              </div>
            </li>);
          },this) : ''}
        </ul>
        <div className="submit">
          {this.state.isReview ? '' : <a onClick={this.submit.bind(this)}>{compo.review_submit}</a>}
        </div>
        </div>
      </div>
    );
  }


}

export default Review;
