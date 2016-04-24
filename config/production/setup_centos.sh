APP="anker_store_tablet"
ROOT="/home/deploy/apps/$APP/current"
sudo cp $ROOT/config/production/anker.com.chained.crt /etc/nginx/
sudo cp $ROOT/config/production/anker.com.key         /etc/nginx/

sudo cp $ROOT/config/production/nginx.conf /etc/nginx/conf.d/$APP.conf
sudo cp $ROOT/config/log_rotate.conf /etc/logrotate.d/anker_store.conf

sudo service nginx restart
