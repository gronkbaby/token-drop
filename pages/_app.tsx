import { AppProps } from "next/app";
import { Web3Provider } from "ethers";
import { ChainId } from "@uniswap/sdk";

const activeChainId = ChainId.MAINNET; // Set the Ethereum chain ID here

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Web3Provider
      library={new ethers.providers.Web3Provider(window.ethereum)}
      chainId={activeChainId}
    >
      <Component {...pageProps} />
    </Web3Provider>
  );
}

export default MyApp;

