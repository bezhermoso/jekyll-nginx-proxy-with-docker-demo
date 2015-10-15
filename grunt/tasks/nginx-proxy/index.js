const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const shell = require('shelljs');

module.exports = function (grunt) {

  grunt.registerMultiTask('jekyllNginx', 'Generate nginx config using `jekyll-nginx-config` plugin', function () {

    var done = this.async();

    var options = this.options({
      bundleExec: false,
      config: '_config.yml',
      source: '.',
      proxyHost: null,
      proxyPort: null,
      writeTo: './proxy.conf'
    });

    var cmd = [
      options.bundleExec ? 'bundle exec' : '',
      'jekyll nginx_config --trace',
      '--config=' + options.config,
      '--source=' + options.source,
      options.proxyHost ? '--proxy_host=' + options.proxyHost : '',
      options.proxyPort ? '--proxy_port=' + options.proxyPort : '',
    ]; 

    var result = shell.exec(cmd.join(' '), { silent: true });

    if (result.code !== 0) {
      grunt.log.error(result.output);
      done(false);
      return;
    }

    fs.writeFileAsync(options.writeTo, result.output)
      .then(function () {
        grunt.log.writeln('Nginx config saved as ' + options.writeTo);
        done(); 
      }).caught(function (err) {
        grunt.log.error(err);
        done(false);
      });
  });

  grunt.registerMultiTask('dockerProxy', 'Build and run nginx proxy as Docker container', function () {

    var done = this.async();

    var options = this.options({
      imageName: 'jekyll-proxy',
      pidFile: './proxy.pid',
      buildDir: './build/nginx'
    });

    var cleanupFunc = cleanup(options.pidFile);
    return cleanupFunc()
      .then(build(options.imageName, options.buildDir))
      .then(run(options.imageName, options.pidFile))
      .then(function () {
        done(true);
      }).caught(function (err) {
        grunt.log.error(err);
        done(false);
      });
  });

  // Kills existing Docker process in PID file.
  // If PID file doesn't exist, simply continue.
  var cleanup = function (pidFile) {
    return function () {
      return new Promise(function (resolve) {
        fs.exists(pidFile, function (exists) {
          if (exists) {
            fs.readFileAsync(pidFile, { encoding: 'utf8' }).then(function (contents) {
              shell.exec('docker kill ' + contents.trim(), { silent: true});
              return fs.unlinkAsync(pidFile);
            }).then(resolve);
          } else {
            resolve();
          }
        });
      });
    };
  };

  // Run `docker build`.
  var build = function (imageName, buildDir) {
    return function () {
      var result = shell.exec('docker build -t ' + imageName + ' ' + buildDir);
      if (result.code !== 0) {
        return Promise.reject(result.output);
      }
      return true;
    };
  };

  // Run `docker run` and save process ID in PID file.
  var run = function (imageName, pidFile) {
    return function () {
      var result = shell.exec('docker run -d -p  80:80 ' + imageName);
      if (result.code !== 0) {
        return Promise.reject(result.output);
      }
      return fs.writeFileAsync(pidFile, result.output); 
    }
  };
};
