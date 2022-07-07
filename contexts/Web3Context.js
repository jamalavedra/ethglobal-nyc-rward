import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { SafeAppWeb3Modal as Web3Modal } from "@gnosis.pm/safe-apps-web3modal";
import Cookies from "js-cookie";
import PropTypes from "prop-types";
import fetcher from "@/utils/fetcher";
import { Convo } from "@rward.xyz/sdk";

export const Web3Context = React.createContext(undefined);

export const Web3ContextProvider = ({ children }) => {
  const cookies = Cookies.withAttributes({
    path: "/",
  });
  const [web3Modal, setWeb3Modal] = useState(undefined);
  const [provider, setProvider] = useState(undefined);
  const [connectedChain, setConnectedChain] = useState("");
  const [connectedWallet, setConnectedWallet] = useState("");
  const [signerAddress, setSignerAddress] = useState("");
  const [prettyName, setPrettyName] = useState("");
  const rwardInstance = new Convo("CS2v5qdHaGTmuMZ1Mg9uWHHi6Nz0ZqayGBflnst8");

  async function updatePrettyName(address) {
    let tp = new ethers.providers.AlchemyProvider(
      "mainnet",
      "aCCNMibQ1zmvthnsyWUWFkm_UAvGtZdv"
    );
    let ensReq = tp.lookupAddress(address);

    let promiseArray = [ensReq];

    let resp = await Promise.allSettled(promiseArray);

    if (Boolean(resp[0]?.value) === true) {
      setPrettyName(resp[0]?.value);
    } else if (Boolean(resp[1]?.value) === true) {
      setPrettyName(resp[1]?.value);
    }
  }

  useEffect(() => {
    async function setupWeb3Modal() {
      // dynamically import lib to fix NextJS's window not found error.
      // const UAuthSPA = (await import('@uauth/js')).default;
      const providerOptions = {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            infuraId: "1e7969225b2f4eefb3ae792aabf1cc17",
          },
        },
      };

      let w3m = new Web3Modal({
        network: "mainnet",
        cacheProvider: true,
        theme: "dark",
        providerOptions,
      });
      // UAuthWeb3Modal.registerWeb3Modal(w3m);

      setWeb3Modal(w3m);
    }
    setupWeb3Modal();
  }, []);

  async function connectWallet(choice = "") {
    console.log("choice", choice);

    if (
      choice === "" ||
      choice === "injected" ||
      choice === "walletconnect" ||
      choice === "custom-uauth"
    ) {
      try {
        let modalProvider;
        let isSafeApp = await web3Modal.isSafeApp();
        console.log("safe detected", isSafeApp);
        if (isSafeApp === true) {
          modalProvider = await web3Modal.getProvider();
          let resp = await modalProvider.connect();
          console.log("using safe", resp);
        } else {
          if (choice !== "") {
            modalProvider = await web3Modal.connectTo(choice);
          } else {
            modalProvider = await web3Modal.connect();
          }

          if (modalProvider.on) {
            modalProvider.on("accountsChanged", () => {
              window.location.reload();
            });
            modalProvider.on("chainChanged", () => {
              window.location.reload();
            });
          }
        }

        const ethersProvider = new ethers.providers.Web3Provider(modalProvider);

        setProvider(ethersProvider);
        let tempsigner = ethersProvider.getSigner();
        let tempaddress = await tempsigner.getAddress();

        // if there was a previous session, try and validate that first.
        if (Boolean(cookies.get("RWARD_SESSION")) === true) {
          let tokenRes = await fetcher(
            "/api/validateAuth?apikey=CS2v5qdHaGTmuMZ1Mg9uWHHi6Nz0ZqayGBflnst8",
            "POST",
            {
              signerAddress: tempaddress,
              token: cookies.get("RWARD_SESSION"),
            }
          );
          // if previous session is invalid then request a new auth token.
          if (tokenRes["success"] === false) {
            let token = await updateAuthToken(
              tempaddress,
              "ethereum",
              ethersProvider
            );
            if (token !== false) {
              setProvider(ethersProvider);
              setConnectedChain("ethereum");
              updatePrettyName(tempaddress);
              setSignerAddress(tempaddress);
              setConnectedWallet(choice);
            }
          } else {
            setProvider(ethersProvider);
            setConnectedChain("ethereum");
            updatePrettyName(tempaddress);
            setSignerAddress(tempaddress);
            setConnectedWallet(choice);
          }
        } else {
          let token = await updateAuthToken(
            tempaddress,
            "ethereum",
            ethersProvider
          );
          if (token !== false) {
            setProvider(ethersProvider);
            setConnectedChain("ethereum");
            updatePrettyName(tempaddress);
            setSignerAddress(tempaddress);
            setConnectedWallet(choice);
          }
        }
      } catch (e) {
        disconnectWallet();
        console.log("NO_WALLET_CONNECTED", e);
      }
    } else {
      alert("Invalid choice:", choice);
    }
  }

  function disconnectWallet() {
    cookies.remove("RWARD_SESSION");
    web3Modal?.clearCachedProvider();
    setProvider(undefined);
    setConnectedChain("");
    setConnectedWallet("");
    setSignerAddress("");
    setPrettyName("");
  }

  async function getAuthToken(manualAddress = undefined) {
    let authAdd =
      Boolean(manualAddress) === true ? manualAddress : signerAddress;
    let tokenRes = await fetcher(
      "/api/validateAuth?apikey=CS2v5qdHaGTmuMZ1Mg9uWHHi6Nz0ZqayGBflnst8",
      "POST",
      {
        signerAddress: authAdd,
        token: cookies.get("RWARD_SESSION"),
      }
    );

    if (tokenRes["success"] === true) {
      return cookies.get("RWARD_SESSION");
    } else {
      try {
        let tokenUpdateRes = await updateAuthToken(
          authAdd,
          connectedChain,
          provider
        );
        if (tokenUpdateRes) {
          return tokenUpdateRes;
        }
      } catch (e) {
        alert("Dynamic Auth Token update Error.");
        console.log(e);
      }
    }
  }

  async function updateAuthToken(signerAddress, chainName, tempProvider) {
    let timestamp = Date.now();

    let dataV2 = rwardInstance.auth.getSignatureDataV2(
      "https://rward.xyz",
      signerAddress,
      1
    );
    let res;

    if (chainName === "ethereum") {
      let signature = "";

      signature = await tempProvider.send("personal_sign", [
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes(dataV2)),
        signerAddress.toLowerCase(),
      ]);
      res = await fetcher(
        `/api/authV2?apikey=CS2v5qdHaGTmuMZ1Mg9uWHHi6Nz0ZqayGBflnst8`,
        "POST",
        {
          message: dataV2,
          signature,
          timestamp,
          chain: "ethereum",
        }
      );
    }
    if (res.success === true) {
      cookies.set("RWARD_SESSION", res["message"], {
        expires: 1,
        secure: true,
      });
      console.log("valid session setup.");
      return res["message"];
    } else {
      alert(`Auth Error, ${res["message"]}`);
      disconnectWallet();
      return false;
    }
  }

  return (
    <Web3Context.Provider
      value={{
        connectWallet,
        disconnectWallet,
        provider,
        connectedChain,
        signerAddress,
        prettyName,
        getAuthToken,
        web3Modal,
        rwardInstance,
        connectedWallet,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

Web3ContextProvider.propTypes = {
  children: PropTypes.element,
};
