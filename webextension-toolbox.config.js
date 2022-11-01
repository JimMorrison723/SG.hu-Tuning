const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  // plugins: [
  //   new webpack.ProvidePlugin({
  //     $: 'jquery',
  //     jQuery: 'jquery'
  //   }),
  //   new CopyWebpackPlugin({
  //     patterns: [
  //       {
  //         from: 'node_modules/webextension-polyfill/dist/browser-polyfill.js',
  //         to: 'dist/chrome/scripts/browser-polyfill.js'
  //       },
  //       {
  //         from: 'README.md', to: 'dist'
  //       }
  //     ],
  //   })
  // ],
  webpack: (config, {dev, vendor}) => {
    // Perform customizations to webpack config
    config.plugins.push(
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery'
      })
    )
    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [{
          from: '../node_modules/webextension-polyfill/dist/browser-polyfill.js',
          to: 'scripts/'
        }],
      })
    )
    // Important: return the modified config
    return config
  }
}
