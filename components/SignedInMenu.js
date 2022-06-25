import { useContext } from "react";
import { Web3Context } from "@/contexts/Web3Context";

const SignedInMenu = () => {
  const { connectedWallet, signerAddress, disconnectWallet } =
    useContext(Web3Context);

  return (
    <button
      className="block px-5 py-3 text-sm font-medium text-white transition bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring"
      type="button"
      onClick={disconnectWallet}
    >
      Disconnect
    </button>
  );
};

export default SignedInMenu;
