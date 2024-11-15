// eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-unresolved
const pkg = require('../package.json');

export const getSDKVersion = () => pkg.version;
export const DEFAULT_DOMAIN = `https://jssdk.chargerwallet.com/${getSDKVersion()}/`;

export const whitelist = [
  // Electron local file
  { origin: 'file://' },
  // ChargerWallet App
  { origin: '1key.so' },
  { origin: 'chargerwallet.com' },
  { origin: 'chargerwalletcn.com' },
  { origin: 'chargerwallettest.com' },
  { origin: 'localhost' },
];

export const whitelistExtension = [
  // ChargerWallet
  'jnmbobjmhlngoefaiojfljckilhhlhcj',
  // Rabby
  'acmacodkjbdgmoleebolmdjonilkdbch',
  // OKX
  'mcohilncbfahbmgdjkbpemcciiolgcge',
];
