# SG.hu Tuning

Ha szeretnél segíteni, csak küldj egy pull-requestet a módosításaiddal. Legyen szó bugfix-ról, apróbb módosításról, esetleg teljesen új funkció bevezetéséről. 

## Dokumentumok

A kiegészítő a webextension-toolbox-ot használja. 
* [webextension-toolbox](https://github.com/HaNdTriX/webextension-toolbox)

## Install

	$ npm install

## Development

    npm run dev chrome
    npm run dev firefox
    npm run dev opera
    npm run dev edge

## Build

    npm run build chrome
    npm run build firefox
    npm run build opera
    npm run build edge

## Environment

The build tool also defines a variable named `process.env.NODE_ENV` in your scripts. 

