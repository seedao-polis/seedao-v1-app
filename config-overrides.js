const { override } = require('customize-cra');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

/**
 * CRA 的 ModuleScopePlugin 禁止 src 外导入；pnpm / 部分环境下
 * react-refresh 会注入绝对路径，导致 255 个 "falls outside of src" 报错。
 */
const allowReactRefreshOutsideSrc = () => (config) => {
  config.resolve.plugins = config.resolve.plugins.filter(
    (plugin) => !(plugin instanceof ModuleScopePlugin),
  );
  return config;
};

const handleFallback = () => (config) => {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    assert: require.resolve('assert'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    path: require.resolve('path-browserify'),
    url: require.resolve('url'),
    os: ['./node_modules/os-browserify'],
    fs: require.resolve('browserify-fs'),
  });
  config.resolve.fallback = fallback;
  return config;
};

/** 依赖包内 source map 指向未发布的 .ts/.map，source-map-loader 会刷屏；不影响运行 */
const ignoreBrokenSourceMaps = () => (config) => {
  config.ignoreWarnings = [...(config.ignoreWarnings || []), /Failed to parse source map/];
  return config;
};

module.exports = override(allowReactRefreshOutsideSrc(), handleFallback(), ignoreBrokenSourceMaps());
