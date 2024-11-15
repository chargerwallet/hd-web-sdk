# `@chargerwallet/hd-web-sdk`

`@chargerwallet/hd-web-sdk` is a browser implementation of hardware-sdk that creates an iframe and communicates with transport through the iframe to avoid cross-domain issues.

## Installation

Install library as npm module:

```javascript
npm install @chargerwallet/hd-web-sdk
```

or

```javascript
yarn add @chargerwallet/hd-web-sdk
```

## Initialization

```javascript
import { HardwareSDK } from '@chargerwallet/hd-web-sdk';

function init() {
  HardwareSDK.init({
    debug: false,
    connectSrc: 'https://jssdk.chargerwallet.com/'
  });
}
```

## Docs

Documentation is available [hardware-js-sdk](https://developer.chargerwallet.com/connect-to-hardware/hardware-sdk/start)
