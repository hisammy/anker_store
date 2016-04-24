import Cookie from './Cookie';

const Detector = function() {
  var model = navigator.platform,
    width = screen.width * window.devicePixelRatio,
    height = screen.height * window.devicePixelRatio,
    device = {width: width, height: height};
  if(model === 'iPhone' || model === 'iPad' || model === 'MacIntel') {
    if(model === 'iPhone') {
      if(width == 640 && height == 960) {
        model = 'iPhone 4';
      } else if(width == 640 && height == 1136) {
        model = 'iPhone 5';
      } else if(width == 750 && height == 1334) {
        model = 'iPhone 6';
      } else if(width == 1242 && height == 2208) {
        model = 'iPhone 6 plus';
      }
    } else if(model === 'iPad') {
      if( width == 1024 && height == 768) {
        model = 'iPad';
      } else  if( width == 1536 && height == 2048) {
        model = 'iPad Retina';
      } else if( width == 2048 && height == 2732) {
        model = 'iPad Pro';
      }
    } else if(model === 'MacIntel') {
      if( width == 1366 && height == 768) {
        model = 'MacBook Air 11"';
      } else if( width == 1280 && height == 800) {
        model = 'MacBook Pro 13"';
      } else if( width == 1440 && height == 900) {
        model = 'MacBook Air 13"'; //and MacBook Pro 15"
      } else if( width == 2304 && height == 1440) {
        model = 'MacBook 12"';
      } else if( width == 2560 && height == 1600) {
        model = 'MacBook Pro Retina 13"';
      } else if( width == 2880 && height == 1800) {
        model = 'MacBook Pro Retina 15"';
      } else if( width == 1920 && height == 1080) {
        model = 'iMac 21.5"';
      } else if( width == 2560 && height == 1440) {
        model = 'iMac 27"';
      } else if( width == 4096 && height == 2304) {
        model = 'iMac Retina 21.5"';
      } else if( width == 5120 && height == 2880) {
        model = 'iMac Retina 27"';
      }
    }
    device.name = 'Apple';
    device.model = model;
  }
  Cookie.save('device', JSON.stringify(device), {path: '/'});
}

export default Detector;
