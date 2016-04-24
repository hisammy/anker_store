# config valid only for current version of Capistrano
# https://semaphoreci.com/community/tutorials/how-to-deploy-node-js-applications-with-capistrano
lock '3.4.0'

set :application, 'anker_store_tablet'
set :repo_url, 'git@github.com:oceanwing/anker_store_tablet.git'

# Default branch is :master
# ask :branch, `git rev-parse --abbrev-ref HEAD`.chomp

# Default deploy_to directory is /var/www/my_app_name
set :deploy_to, '/home/deploy/apps/anker_store_tablet'
set :shared_path, '/home/deploy/apps/anker_store_tablet/shared'

# Default value for :scm is :git
set :scm, :git

# Default value for :format is :pretty
set :format, :pretty

# Default value for :log_level is :debug
# set :log_level, :debug

# Default value for :pty is false
# set :pty, true
set :ssh_options, { :forward_agent => true }

# Default value for :linked_files is []
#set :linked_files, fetch(:linked_files, []).push('config/database.yml', 'config/secrets.yml')
#set :linked_files, ["src/config.js","src/newrelic.js"]

# Default value for linked_dirs is [], 'tmp/sockets', 'vendor/bundle', 'public/system', 'tmp/pids', 'tmp/cache')
#set :linked_dirs, fetch(:linked_dirs, []).push('node_modules')

# Default value for default_env is {}
# set :default_env, { path: "/opt/ruby/bin:$PATH" }

# Default value for keep_releases is 5
# set :keep_releases, 5


namespace :deploy do

  desc 'Restart application'
  task :restart do
    invoke 'pm2:restart'
  end

  after :publishing, :restart   
end

namespace :deploy do

  after :restart, :clear_cache do
    on roles(:web), in: :groups, limit: 3, wait: 10 do
      # Here we can do anything such as:
      # within release_path do
      #   execute :rake, 'cache:clear'
      # end
    end
  end

end
