const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
    return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
