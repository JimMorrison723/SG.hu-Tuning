const webpack = require('webpack')

module.exports = {
  webpack: (config, {dev, vendor}) => {
    // Perform customizations to webpack config
    config.plugins.push(
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery'
      })
    )
    // Important: return the modified config
    return config
  }
}