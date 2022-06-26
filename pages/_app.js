import "../styles/globals.css";
import { Web3ContextProvider } from "@/contexts/Web3Context";
import PropTypes from "prop-types";
import { SessionProvider } from "next-auth/react";

function MyApp({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session} refetchInterval={0}>
      <Web3ContextProvider>
        <Component {...pageProps} />
      </Web3ContextProvider>
    </SessionProvider>
  );
}

MyApp.propTypes = {
  Component: PropTypes.func,
  pageProps: PropTypes.object,
};

export default MyApp;
