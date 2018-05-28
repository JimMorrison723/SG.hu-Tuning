# SG.hu Tuning

Ha szeretnél segíteni, csak küldj egy pull-requestet a módosításaiddal. Legyen szó bugfix-ról, apróbb módosításról, esetleg teljesen új funkció bevezetéséről. 

## Dokumentumok

A kiegészítő a webextension-toolbox-ot használja. 
* [webextension-toolbox](https://github.com/HaNdTriX/webextension-toolbox)

## Install

	$ yarn install

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

