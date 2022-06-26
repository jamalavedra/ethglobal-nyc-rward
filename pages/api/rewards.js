import { PrivyClient } from "@privy-io/privy-node";
import withCors from "@/middlewares/withCors";
import withApikey from "@/middlewares/withApikey";
import validateAuth from "@/lib/validateAuth";
import { TatumPolygonSDK } from "@tatumio/polygon";

const polygonSDK = TatumPolygonSDK({ apiKey: process.env.TATUM_API });

const privyClient = new PrivyClient(
  process.env.PRIVY_API_KEY,
  process.env.PRIVY_API_SECRET
);

const handler = async (req, res) => {
  try {
    if (req.method === "GET") {
      const fields = await privyClient.listFields();
      console.log(fields);
      return res.status(200).json({
        succcess: true,
      });
    } else if (req.method === "POST") {
      let valAuthResp = true;
      // await validateAuth(
      //   req.body.token,
      //   req.body.signerAddress
      // );
      if (valAuthResp === true) {
        console.log(req.body);
        if (
          Object.keys(req.body).includes("email") === true &&
          req.body?.email.trim() !== ""
        ) {
          const { mnemonic, xpub } = await polygonSDK.wallet.generateWallet();
          const addressFromXpub = polygonSDK.wallet.generateAddressFromXPub(
            xpub,
            0
          );

          const privateKey =
            await polygonSDK.wallet.generatePrivateKeyFromMnemonic(
              mnemonic,
              0,
              { testnet: true }
            );

          await privyClient.put(
            addressFromXpub,
            "email",
            req.body?.email,
            "privateKey",
            privateKey,
            "mnemonic",
            mnemonic
          );
          return res.status(200).json({
            _id: addressFromXpub,
            email: req.body?.email,
          });
        } else {
          return res.status(400).json({
            success: false,
            error: "Invalid/Incomplete params",
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          error: "Invalid Auth",
        });
      }
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.toString() });
  }
};
export default withCors(withApikey(handler));
