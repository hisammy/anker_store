#https://semaphoreci.com/community/tutorials/how-to-deploy-node-js-applications-with-capistrano
#http://vladigleba.com/blog/2014/04/10/deploying-rails-apps-part-6-writing-capistrano-tasks/
require 'json'

namespace :pm2 do
  def app_status
    within current_path do
      ps = JSON.parse(capture :pm2, :jlist, "/home/deploy/apps/anker_store_tablet/current/build/server.js") rescue []
      if ps.empty?
        return nil
      else
        # status: online, errored, stopped
        return ps[0]["pm2_env"]["status"]
      end
    end
  end
  
  def restart_app
    within current_path do
      execute :pm2, :delete, "/home/deploy/apps/anker_store_tablet/current/build/server.js"
      execute :pm2, :start, "/home/deploy/apps/anker_store_tablet/current/build/server.js"
    end
  end

  def start_app
    within current_path do
      execute :pm2, :start, "/home/deploy/apps/anker_store_tablet/current/build/server.js"
#      execute :pm2, :stop, fetch(:app_command)
    end
  end

  desc 'Restart app gracefully'
  task :restart do
    on roles(:all) do
      info 'App is online'
      puts "--------------------------------------------------------------"
      execute "pwd"
      #execute "cd /home/deploy/apps/anker_store_tablet/current; (test -s build-#{fetch(:branch)} &&  mv build-#{fetch(:branch)} build)"

      case app_status

      when nil
        info 'App is not registerd'
        start_app
      when 'stopped'
        info 'App is stopped'
        restart_app
      when 'errored'
        info 'App has errored'
        restart_app
      when 'online'
        info 'App is online'
        restart_app
      end
    end
  end

end
