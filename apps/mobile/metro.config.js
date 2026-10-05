const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// === MUHIM: RAM tejash ===
config.maxWorkers = 2;
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;

// `.js` import'ni `.ts` faylga bog'lash
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName.endsWith('.js') &&
    (moduleName.startsWith('./') || moduleName.startsWith('../'))
  ) {
    const withoutExtension = moduleName.slice(0, -3);
    return context.resolveRequest(context, withoutExtension, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });