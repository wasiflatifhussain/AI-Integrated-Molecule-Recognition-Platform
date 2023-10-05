const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: path.resolve(__dirname, './src/index.js'),
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js'
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
  experiments: {
    asyncWebAssembly: true,
    syncWebAssembly: true
  },
  devServer: {
    contentBase: path.resolve(__dirname, './dist'),
    hot: true
  }
};

// const webpack = require('webpack');

// module.exports = {
//     webpack: {
//         configure: (webpackConfig) => {
//             const wasmExtensionRegExp = /\.wasm$/;
//             webpackConfig.resolve.extensions.push('.wasm');
//             webpackConfig.experiments = {
//                 asyncWebAssembly: false,
//                 lazyCompilation: true,
//                 syncWebAssembly: true,
//                 topLevelAwait: true,
//             };
//             webpackConfig.resolve.fallback = {
//                 buffer: require.resolve('buffer/')
//             }
//             webpackConfig.module.rules.forEach((rule) => {
//                 (rule.oneOf || []).forEach((oneOf) => {
//                     if (oneOf.type === "asset/resource") {
//                         oneOf.exclude.push(wasmExtensionRegExp);
//                     }
//                 });
//             });
//             webpackConfig.plugins.push(new webpack.ProvidePlugin({
//                 Buffer: ['buffer', 'Buffer'],
//             }));

//             return webpackConfig;
//         }
//     }
// }
