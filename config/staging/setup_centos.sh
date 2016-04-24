APP="anker_store_tablet"
ROOT="/home/deploy/apps/$APP/current"
sudo cp $ROOT/config/staging/nginx.conf /etc/nginx/conf.d/$APP.conf
sudo cp $ROOT/config/log_rotate.conf /etc/logrotate.d/anker_store.conf

sudo service nginx restart
