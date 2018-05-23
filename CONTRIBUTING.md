# SG.hu Tuning

Ha szeretnél segíteni, csak küldj egy pull-requestet a módosításaiddal. Legyen szó bugfix-ról, apróbb módosításról, esetleg teljesen új funkció bevezetéséről. 

## Dokumentumok

A kiegészítő a webextension-toolbox-ot használja. 
* [webextension-toolbox](https://github.com/HaNdTriX/webextension-toolbox)

## Install

	$ yarn install

## jQuery

Add hozzá a következő kód részletet az alábbi helyen: `node_modules\webextension-toolbox\src\webpack-config.js`

    config.plugins.push(
      new webpack.ProvidePlugin({
          $: 'jquery',
          jQuery: 'jquery'
      })
    )

Amíg a webextension-toolbox miatt hibás a config fájl kiegészítése, vagy amíg még tartalmaz a forráskód jQueryt.

## Development

    yarn run dev chrome
    yarn run dev firefox
    yarn run dev opera
    yarn run dev edge

## Build

    yarn run build chrome
    yarn run build firefox
    yarn run build opera
    yarn run build edge

## Environment

The build tool also defines a variable named `process.env.NODE_ENV` in your scripts. 

