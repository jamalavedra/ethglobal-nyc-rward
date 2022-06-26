import withCors from "@/middlewares/withCors";
import withApikey from "@/middlewares/withApikey";
import validateAuth from "@/lib/validateAuth";
import { TatumPolygonSDK } from "@tatumio/polygon";

const polygonSDK = TatumPolygonSDK({ apiKey: process.env.TATUM_API });

const handler = async (req, res) => {
  try {
    if (req.method === "POST") {
      let valAuthResp = true;
      // await validateAuth(
      //   req.body.token,
      //   req.body.signerAddress
      // );
      if (valAuthResp === true) {
        if (
          Object.keys(req.body).includes("address") === true &&
          req.body?.address.trim() !== "" &&
          Object.keys(req.body).includes("amount") === true &&
          req.body?.amount <= 0
        ) {
          const sentTransferNativeTransaction = await polygonSDK.transaction.send.transferSignedTransaction(
            {
              to: req.body?.address,
              amount: req.body?.amount,
              signatureId: "cac88687-33ed-4ca1-b1fc-b02986a90975",
              nonce: 3252345722143,
              fee: {
                gasLimit: "53632",
                gasPrice: "20",
              },
            }
          );

          return res.status(200).json({
            amount: req.body?.amount,
            email: req.body?.email,
            transaction: sentTransferNativeTransaction,
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
