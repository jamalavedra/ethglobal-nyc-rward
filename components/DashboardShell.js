import React, { useContext } from "react";
import PropTypes from "prop-types";

import { Web3Context } from "@/contexts/Web3Context";
import { isBlockchainAddress } from "@/utils/stringUtils";
import SignedInMenu from "./SignedInMenu";

const DashboardShell = ({ title, active, children }) => {
  const { connectWallet, signerAddress } = useContext(Web3Context);

  // Not logged in
  if (signerAddress === "") {
    return (
      <div className="w-full flex justify-center h-full items-center">
        <div>
          <h3 className="font-bold text-center text-4xl">{"Connect Wallet"}</h3>

          <div className="flex justify-center w-full items-center flex-col">
            <div className="flex-wrap justify-center items-center flex mt-10 w-full">
              <WalletItem
                onClick={() => {
                  connectWallet("injected");
                }}
                backgroundImage="linear-gradient(229.83deg, rgb(205 131 59) -258.34%, rgb(205 189 178 / 18%) 100.95%)"
                title="MetaMask"
              />

              <WalletItem
                onClick={() => {
                  connectWallet("walletconnect");
                }}
                backgroundImage="linear-gradient(229.83deg, rgb(59 153 252) -258.34%, rgb(82 153 231 / 18%) 100.95%)"
                title="WalletConnect"
              />
            </div>
          </div>
        </div>
      </div>
    );
  } else if (isBlockchainAddress(signerAddress)) {
    //Logged in
    return (
      <>
        <header className="bg-gray-50">
          <div className="max-w-screen-xl px-4 py-8 mx-auto sm:py-12 sm:px-6 lg:px-8">
            <div className="sm:justify-between sm:items-center sm:flex">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-medium text-gray-900 sm:text-3xl">
                  Welcome to{" "}
                  <span className="italic font-extrabold">rward</span>
                </h1>

                <p className="mt-1.5 text-sm text-gray-500">
                  Let's reward your users!
                </p>
              </div>
              <div className="flex flex-col gap-4 mt-4 sm:flex-row sm:mt-0 sm:items-center">
                <SignedInMenu />
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-screen-xl px-4 py-8 mx-auto sm:py-12 sm:px-6 lg:px-8">
          <div className="mt-16 flex-col">{children}</div>
        </div>
      </>
    );
  } else {
    return (
      <div>
        <div className="flex items-center justify-center max-w-7xl">
          Whoops! Try Reloading the page.
        </div>
      </div>
    );
  }
};
DashboardShell.propTypes = {
  title: PropTypes.string,
  active: PropTypes.string,
  f: PropTypes.element,
  children: PropTypes.element,
};

export default DashboardShell;

const WalletItem = (props) => {
  return (
    <div className="flex-wrap">
      <div className="flex-col items-center">
        <button
          className="h-20 w-20 mx-2 p-2 rounded cursor-pointer justify-center items-center"
          style={{
            backgroundImage:
              Boolean(props?.backgroundImage) === true
                ? props.backgroundImage
                : "",
          }}
          onClick={props.onClick}
        />

        <p className="text-md text-center font-medium mt-2">{props?.title}</p>
      </div>
    </div>
  );
};
WalletItem.propTypes = {
  title: PropTypes.string,
  disabled: PropTypes.bool,
  display: PropTypes.string,
  backgroundImage: PropTypes.string,
  border: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};
