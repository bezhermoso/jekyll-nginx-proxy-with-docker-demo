# Demo: Jekyll + nginx proxy via Docker

> This has been tried and tested on __Mac OS X__. It _should_ work on __Linux__ as well. However, Windows is not guranteed, as Jekyll does not 
officially support it.

### Prerequisites

* Ruby 2.0+
* Python 2.7+
* NodeJS v0.12.* with `npm` v2.0+
* [Bower](http://bower.io/). (get via `npm install -g bower`)
* Docker (you can get it through [Docker Toolbox](https://www.docker.com/toolbox))

### Getting Started

Run the following commands on the project root:

```
> bundle install --path vendor/bundle
> npm install && bower install
```

Get your local IP address and set it as the `LOCAL_IP` environment variable:

```
> export LOCAL_IP=192.168.99.1
```

> This IP address should be what Docker can use to talk to your host machine. `192.168.99.1` should be what it is for a default
install of Docker.

### Serving the static site

Run:

```
> grunt serve
```

Once complete, a browser window should eventually open up pointing to `http://localhost:8080`. 

__To hit the proxy, you will have to access the site through `http://192.168.99.1`.__

Test the following redirects to see it in action:

`http://192.168.99.1/activelamp => http://activelamp.com`

`http://182.168.99.1/bienvenue => http://192.168.99.1/jekyll/update/2015/10/15/welcome-to-jekyll/` 

The first redirect is configured in `_config.yml`. The second one is in `app/_posts/2016-10-15-welcome-to-jekyll.md`.

### Grunt config & tasks

The `grunt proxy` task is the entry task that orchestrates the building and running of the nginx proxy.  Checkout 
the [`Gruntfile.js`](https://github.com/bezhermoso/jekyll-nginx-proxy-with-docker-demo/blob/master/Gruntfile.js) file for how it is done. Its a rather long file (~300 lines), so I added `@notes` in comments preceeding all pertinent parts.

Majority of the implementation can be found in [`grunt/tasks/nginx-proxy/index.js`](https://github.com/bezhermoso/jekyll-nginx-proxy-with-docker-demo/blob/master/grunt/tasks/nginx-proxy/index.js).

### Jekyll::NginxConfig

You can find more info about this module here: https://github.com/activelamp/jekyll-nginx-config


## Questions?

For questions, comments, and feedbacks, you can shoot me an email at [bez@activelamp.com](mailto:bez@activelamp.com).
