# blom

[![build status](https://secure.travis-ci.org/escapace/blom.png)](https://travis-ci.org/escapace/blom)
[![Greenkeeper badge](https://badges.greenkeeper.io/escapace/blom.svg)](https://greenkeeper.io/)
[![license](https://img.shields.io/badge/license-Mozilla%20Public%20License%20Version%202.0-blue.svg)][![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fescapace%2Fblom.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fescapace%2Fblom?ref=badge_shield)
()

**Work in progress**

## Overview

Blom is a modern zero-config application bundler running Webpack. The main motivation behind it is taking away all the maintenance hurdles that may arise when using boilerplates like vue-templates.   
Projects of any size and complexity can be created through Blom. It supports all modern style preprocessors.  
Once scaffolding through Blom, a developer need not worry about updating core dependencies. They just update the version to the latest and everything else is handled by Blom itself.    


## Preprocessors

All modern CSS preprocessors such as Sass, Less, Stylus, PostCSS come with Blom by default.


## Hot-module replacement

Hot Module Replacement (HMR) is one of the most useful features of Webpack. It makes it possible to update changed modules without a full page reload. This can significantly speed up development in a few ways:

- Preserve application state which would be lost in case of a full refresh.
- Save development time by only updating what's changed.
- Fiddle with styles much faster.

Cepheus supports HMR out of the box.


## Server-side rendering

Since the inception of the web, the conventional method for getting your HTML up onto a screen was by using server-side rendering. It’s quite simply the process of converting HTML files in the server into usable information for the browser. SSR was the default for a long time. Back then most web pages were just for rendering static text and images in the browser.   However, websites these days are much more advanced, have richer functionality so it makes sense to push rendering to the edge, that is, to send a barebones HTML doc with JavaScript that will handle the rest, including routing, inside the browser, without additional network requests to the server.   
Considering this, SSR these days has a huge benefit: it is great for SEO. Your content is present before you get it, so search engines are able to index and crawl it without problems. This is something that you don’t get initially with client-side rendering. At least not without tricks and hacks.
To recap, the 2 main benefits of server-side rendering are:

- SEO
- Initial page-load time


## End-to-end testing

Cypress is a brand-new end-to-end testing framework not dependent on Selenium. 


## CLI
### Build Commands
- **npm run start**   

  Start application web server. Updates the browser in changes in development mode, performs        server-side rendering in production mode.

- **npm run build**   
  Compiles the application for production deployment.


### Options

*Configurable*

- **devtool**   
  type: string   
  description: Choose a style of source mapping to enhance the debugging process. Set to ‘false’ to disable.   
  default: 'cheap-module-eval-source-map' if NODE_ENV is 'development’, 'nosources-source-map’ otherwise   
- **output-public-path**   
  type: string   
  description: Public URL of the output directory when referenced in a browser.   
  default: ‘/’   
- **context**   
  type: string   
  description: The base directory, an absolute path.   
  default:    
- **entry**   
  type: string   
  description: The entry point of the application.   
  default:  './src/index.ts’   
- **index-template**    
  type: string      
  description: The landing page mustache template.      
  default:       

*Default*

- **host**
  type: string     
  description:   
  default: NODE_HOST if present, ’127.0.0.1’ otherwise   
- **mode**   
  type: string     
  description:   
  default: ‘start’   
- **nodeEnv**    
  type: string   
  description:   
  default: NODE_ENV if present, ‘development’ otherwise   
- **outputPath**   
  type: string   
  description:    
  default: ‘build’   
- **port**   
  type: string   
  description:   
  default: NODE_PORT if present, ’8000’ otherwise   
- **uglifyOptions**
- **postcssConfig**





## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fescapace%2Fblom.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fescapace%2Fblom?ref=badge_large)