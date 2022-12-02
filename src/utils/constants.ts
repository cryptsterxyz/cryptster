import { chain } from "wagmi";

import packageJson from "../../package.json";

export const APP_VERSION = packageJson.version;

import getEnvConfig from "./getEnvConfig";
export const API_URL = "https://api-mumbai.lens.dev";

// const API_URL = getEnvConfig().apiEndpoint;
// Environments
export const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Lens Network
export const LENS_NETWORK = "testnet";
export const MAINNET_API_URL = "https://api.lens.dev";
export const TESTNET_API_URL = "https://api-mumbai.lens.dev";

export const IS_MAINNET = false;

export const SERVERLESS_URL = "http://localhost:3002/api/";

export const RELAY_ON = "true";
export const LENS_PERIPHERY = "0xD5037d72877808cdE7F669563e9389930AF404E8";
export const TESTNET_LENSHUB_PROXY =
  "0x60Ae865ee4C725cd04353b5AAb364553f56ceF82";

// Errors
export const ERRORS = {
  notMined:
    "A previous transaction may not been mined yet or you have passed in a invalid nonce. You must wait for that to be mined before doing another action, please try again in a few moments. Nonce out of sync.",
};

// Messages
export const ERROR_MESSAGE = "Something went wrong!";
export const SIGN_WALLET = "Please sign in your wallet.";
export const WRONG_NETWORK = IS_MAINNET
  ? "Please change network to Polygon mainnet."
  : "Please change network to Polygon Mumbai testnet.";
export const SIGN_ERROR = "Failed to sign data";

// URLs
export const POLYGONSCAN_URL = "https://mumbai.polygonscan.com";
// Web3
export const RPC_URL = "https://rpc.ankr.com/polygon_mumbai";

export const POLYGON_MAINNET = {
  ...chain.polygon,
  name: "Polygon Mainnet",
  rpcUrls: { default: "https://polygon-rpc.com" },
};
export const POLYGON_MUMBAI = {
  ...chain.polygonMumbai,
  name: "Polygon Mumbai",
  rpcUrls: { default: "https://rpc-mumbai.maticvigil.com" },
};
export const CHAIN_ID = POLYGON_MUMBAI.id;

// Localstorage keys
export const LS_KEYS = {
  CRYPTSTER_STORE: "cryptster.store",
  TRANSACTION_STORE: "transaction.store",
  TIMELINE_STORE: "timeline.store",
  MESSAGE_STORE: "message.store",
};

// Bundlr
export const BUNDLR_CURRENCY = "matic";
export const BUNDLR_NODE_URL = "https://node2.bundlr.network";
