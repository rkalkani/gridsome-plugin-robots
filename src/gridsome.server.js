import fs from 'fs';
import robotsTxt from 'generate-robotstxt';
import path from 'path';
import url from 'url';

const publicPath = './public';
const defaultEnv = 'development';

function writeFile(file, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

const getOptions = pluginOptions => {
  const options = {...pluginOptions};

  delete options.plugins;

  const {env = {}, resolveEnv = () => process.env.SITE_ENV || process.env.NODE_ENV} = options;

  const envOptions = env[resolveEnv()] || env[defaultEnv] || {};

  delete options.env;
  delete options.resolveEnv;

  return {...options, ...envOptions};
};

function RobotsPlugin(api, options) {
  api.afterBuild(async ({queue, config}) => {
    console.log('options', options);
    console.log('config', config);
    console.log('queue', queue);

    const userOptions = getOptions(options);

    if (
      !Object.prototype.hasOwnProperty.call(userOptions, 'host') ||
      !Object.prototype.hasOwnProperty.call(userOptions, 'sitemap')
    ) {
      userOptions.host = config.siteUrl || config.url;
      userOptions.sitemap = url.resolve(config.siteUrl, 'sitemap.xml');
    }

    const {policy, sitemap, host, output, configFile} = userOptions;

    const content = await robotsTxt({
      policy,
      sitemap,
      host,
      configFile,
    });
    const filename = path.join(publicPath, output);

    return writeFile(path.resolve(filename), content);
  });
}

RobotsPlugin.defaultOptions = {
  output: '/robots.txt',
};

module.exports = RobotsPlugin;
