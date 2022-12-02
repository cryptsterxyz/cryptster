import { LENS_NETWORK, MAINNET_API_URL, TESTNET_API_URL } from "./constants";

const getEnvConfig = () => {
  switch (LENS_NETWORK) {
    // case "mainnet":
    //   return {
    //     apiEndpoint: MAINNET_API_URL,
    //   };
    case "testnet":
      return {
        apiEndpoint: TESTNET_API_URL,
      };
    default:
      return {
        apiEndpoint: MAINNET_API_URL,
      };
  }
};

export default getEnvConfig;
