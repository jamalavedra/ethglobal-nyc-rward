import React, { useContext, useState } from "react";
import PropTypes from "prop-types";

import { Web3Context } from "@/contexts/Web3Context";
import { isBlockchainAddress } from "@/utils/stringUtils";
import SignedInMenu from "./SignedInMenu";

const DashboardShell = ({ title, active, children, searchbox }) => {
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
      <div>
        <div className="flex-col min-w-full relative ">
          <div className="z-30 w-full bg-gray-100 fixed flex items-center justify-between">
            <p>{title}</p>
            {Boolean(searchbox) === true ? searchbox : <></>}
            <SignedInMenu />
          </div>
          <div className="mt-16 flex-col">{children}</div>
        </div>
      </div>
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
