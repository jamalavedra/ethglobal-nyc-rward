import "../styles/globals.css";
import { Web3ContextProvider } from "@/contexts/Web3Context";
import PropTypes from "prop-types";

function MyApp({ Component, pageProps }) {
  return (
    <Web3ContextProvider>
      <Component {...pageProps} />
    </Web3ContextProvider>
  );
}

MyApp.propTypes = {
  Component: PropTypes.func,
  pageProps: PropTypes.object,
};

export default MyApp;
