// eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-unresolved
const pkg = require('../package.json');

export const getSDKVersion = () => pkg.version;
export const DEFAULT_DOMAIN = `https://jssdk.chargerwallet.com/${getSDKVersion()}/`;

export const whitelist = [
  // Electron local file
  { origin: 'file://' },
  // ChargerWallet App
  { origin: 'chargerwallet.com' },
  { origin: 'localhost.com' },
  { origin: 'chargerwallettest.com' },
  { origin: 'jssdk.chargerwallet.com' },
  { origin: 'localhost' },
];

export const whitelistExtension = [
  // Metamask
  'nkbihfbeogaeaoehlefnkodbefgpgknn',
  // Rabby
  'acmacodkjbdgmoleebolmdjonilkdbch',
  // OKX
  'mcohilncbfahbmgdjkbpemcciiolgcge',
];
