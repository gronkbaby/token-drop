import {
  useActiveClaimConditionForWallet,
  useAddress,
  useClaimConditions,
  useClaimerProofs,
  useClaimIneligibilityReasons,
  useContract,
  useContractMetadata,
  useTokenSupply,
  Web3Button,
} from "@thirdweb-dev/react";
import { BigNumber, utils } from "ethers";
import Image from "next/image";
import { useMemo, useState } from "react";
import styles from "../styles/Home.module.css";
import { parseIneligibility } from "../utils/parseIneligibility";

const Home = () => {
  const tokenAddress = "0x8494E2E992a0669B86174d79B98750F7827bA4F3";
  const { contract } = useContract(tokenAddress, "token-drop");
  const address = useAddress();
  const [quantity, setQuantity] = useState(1);
  const { data: contractMetadata } = useContractMetadata(contract);

  const claimConditions = useClaimConditions(contract);
  const activeClaimCondition = useActiveClaimConditionForWallet(
    contract,
    address
  );
  const claimerProofs = useClaimerProofs(contract, address || "");
  const claimIneligibilityReasons = useClaimIneligibilityReasons(contract, {
    quantity,
    walletAddress: address || "",
  });

  const claimedSupply = useTokenSupply(contract);

  const totalAvailableSupply = useMemo(() => {
    try {
      return BigNumber.from(activeClaimCondition.data?.availableSupply || 0);
    } catch {
      return BigNumber.from(1_000_000_000);
    }
  }, [activeClaimCondition.data?.availableSupply]);

  const numberClaimed = useMemo(() => {
    return BigNumber.from(claimedSupply.data?.value || 0).toString();
  }, [claimedSupply]);

  const numberTotal = useMemo(() => {
    const n = totalAvailableSupply.add(
      BigNumber.from(claimedSupply.data?.value || 0)
    );
    if (n.gte(1_000_000_000)) {
      return "";
    }
    return n.toString();
  }, [totalAvailableSupply, claimedSupply]);

  const priceToMint = useMemo(() => {
    if (quantity) {
      const bnPrice = BigNumber.from(
        activeClaimCondition.data?.currencyMetadata.value || 0
      );
      return `${utils.formatUnits(
        bnPrice.mul(quantity).toString(),
        activeClaimCondition.data?.currencyMetadata.decimals || 18
      )} ${activeClaimCondition.data?.currencyMetadata.symbol}`;
    }
  }, [
    activeClaimCondition.data?.currencyMetadata.decimals,
    activeClaimCondition.data?.currencyMetadata.symbol,
    activeClaimCondition.data?.currencyMetadata.value,
    quantity,
  ]);

  const maxClaimable = useMemo(() => {
    let bnMaxClaimable;
    try {
      bnMaxClaimable = BigNumber.from(
        activeClaimCondition.data?.maxClaimableSupply || 0
      );
    } catch (e) {
      bnMaxClaimable = BigNumber.from(1_000_000_000);
    }

    let perTransactionClaimable;
    try {
      perTransactionClaimable = BigNumber.from(
        activeClaimCondition.data?.maxClaimablePerWallet || 0
      );
    } catch (e) {
      perTransactionClaimable = BigNumber.from(1_000_000_000);
    }

    if (perTransactionClaimable.lte(bnMaxClaimable)) {
      bnMaxClaimable = perTransactionClaimable;
    }

    const snapshotClaimable = claimConditions
      .map((cc) => cc.snapshot)
      .reduce((a, b) => (a >= b ? a : b), 0);

    if (snapshotClaimable) {
      bnMaxClaimable = bnMaxClaimable.sub(snapshotClaimable);
    }

    return bnMaxClaimable;
  }, [
    activeClaimCondition.data?.maxClaimablePerWallet,
    activeClaimCondition.data?.maxClaimableSupply,
    claimConditions,
  ]);

  const isClaimEligible =
    claimIneligibilityReasons.length === 0 &&
    quantity <= maxClaimable.toNumber();

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>{contractMetadata?.name}</h1>
        <p className={styles.description}>
          {contractMetadata?.description}
        </p>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Claimable Supply</h3>
            <p>
              {numberClaimed}/{numberTotal}
            </p>
          </div>
          <div className={styles.card}>
            <h3>Claim Conditions</h3>
            <ul>
              {claimConditions.map((claimCondition) => (
                <li key={claimCondition.name}>{claimCondition.name}</li>
              ))}
            </ul>
          </div>
          <div className={styles.card}>
            <h3>Claim Ineligibility Reasons</h3>
            <ul>
              {claimIneligibilityReasons.map((reason) => (
                <li key={reason}>{parseIneligibility(reason)}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className={styles.controls}>
          <label htmlFor="quantity">Quantity:</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            min="1"
            max={maxClaimable.toString()}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
          />
          <p>
            Price to mint: <strong>{priceToMint}</strong>
          </p>
          <Web3Button
            contract={contract}
            method="claim"
            args={[quantity]}
            disabled={!isClaimEligible}
          >
            Claim
          </Web3Button>
        </div>
        <div className={styles.footer}>
          <Image
            src="/thirdweb-logo.svg"
            alt="Thirdweb Logo"
            width={100}
            height={32}
          />
        </div>
      </main>
    </div>
  );
};

export default Home;
