import { AppProps } from "next/app";
import { Web3Provider } from "@ethersproject/providers";
import { ChainId } from "@uniswap/sdk";

const activeChainId = ChainId.MAINNET; // Set the Ethereum chain ID here
const tokenAddress = "0x8494E2E992a0669B86174d79B98750F7827bA4F3";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Web3Provider chainId={activeChainId}>
      <Component {...pageProps} tokenAddress={tokenAddress} />
    </Web3Provider>
  );
}

export default MyApp;
