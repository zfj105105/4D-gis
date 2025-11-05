const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
    return context.resolveRequest(context, moduleName, platform);
};

config.resolver.assetExts = config.resolver.assetExts.concat(['mbtiles']);

module.exports = config;
