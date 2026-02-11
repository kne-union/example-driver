const {CracoLibsExamplePlugin, env} = require('@kne/modules-dev');
const aliasConfig = require('./webstorm.webpack.config');
const packageJson = require('../package.json');

process.env.CI = false;

module.exports = {
    webpack: {
        alias: aliasConfig.resolve.alias, configure: (webpackConfig) => {
            const definePlugin = webpackConfig.plugins.find((plugin) => plugin.constructor.name === 'DefinePlugin');
            Object.assign(definePlugin.definitions['process.env'], {
                DEFAULT_VERSION: `"${packageJson.version}"`
            });
            return webpackConfig;
        }
    }, plugins: [{
        plugin: CracoLibsExamplePlugin, options: {
            middleware: (moduleFederationConfig) => {
                const shared = Object.assign({}, moduleFederationConfig.shared,{
                    '@kne/current-lib_example-driver': {
                        singleton: true, requiredVersion: false
                    }
                });
                return Object.assign({}, moduleFederationConfig, {
                    exposes: {
                        './components': env.manifestPath
                    }, shared
                })
            }
        }
    }]
};
