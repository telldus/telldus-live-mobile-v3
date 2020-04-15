source "https://rubygems.org"

gem "cocoapods"
gem "fastlane"

if ENV['DEPLOY_STORE'] == "huawei"
    plugins_path = File.join(File.dirname(__FILE__), 'fastlane', 'Pluginfile')
    eval_gemfile(plugins_path) if File.exist?(plugins_path)
end
