## Spartacus and Composable Storefront

This project serves as a local npm-like registry for the newest Spartacus packages.

More information at https://github.com/SAP/spartacus/blob/2211.24.0-1/docs/self-publishing-spartacus-libraries.md

## Prerequisites

- [ts-node](https://typestrong.org/ts-node/docs/) Latest Version
- [Verdaccio](https://verdaccio.org/) Version 4
- [Angular CLI](https://angular.dev/) Version 17.0.0 is the minimum required. The most recent 17.x version is strongly recommended.
- [Node.js](https://nodejs.org/en) Version 20.9.0 is the minimum required. The most recent 20.x version is strongly recommended.
- [npm](https://www.npmjs.com/) Version 10.2.4 or newer.

## Serve the packages
1. Run the following command to install packages and then build the libraries
```
npm install && npm run build:libs
```
2. Run the following schematics testing script provided by the Spartacus project. 
```
ts-node ./tools/schematics/testing
```
IMPORTANT: In a separate terminal tab, execute the following command
```
npm adduser --registry http://localhost:4873
```
3. In the terminal window running your proxy registry (such as Verdaccio), select the `Publish` option and press `Enter`

You can see the published libraries by browsing to http://localhost:4873/ while Verdaccio is running.
