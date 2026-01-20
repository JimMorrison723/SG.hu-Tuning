import webpack from 'webpack'
import CopyWebpackPlugin from 'copy-webpack-plugin'

export default {
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
