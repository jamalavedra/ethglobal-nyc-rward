import { useContext } from "react";
import { Web3Context } from "@/contexts/Web3Context";

const SignedInMenu = () => {
  const { connectedWallet, signerAddress, disconnectWallet } =
    useContext(Web3Context);

  return <button onClick={disconnectWallet}>Disconnect</button>;
};

export default SignedInMenu;
