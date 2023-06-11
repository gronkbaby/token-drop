import { AppProps } from "next/app";
import { Web3Provider } from "@ethersproject/providers";
import { ChainId } from "@uniswap/sdk";

const activeChainId = ChainId.MAINNET; // Set the Ethereum chain ID here

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Web3Provider>
      <Component {...pageProps} />
    </Web3Provider>
  );
}

export default MyApp;
