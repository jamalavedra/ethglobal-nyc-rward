import { PrivyClient } from "@privy-io/privy-node";
import withCors from "@/middlewares/withCors";
import validateAuth from "@/lib/validateAuth";

const privyClient = new PrivyClient(
  process.env.PRIVY_API_KEY,
  process.env.PRIVY_API_SECRET
);

const handler = async (req, res) => {
  try {
    if (req.method === "GET") {
      let valAuthResp = await validateAuth(
        req.query?.token,
        req.query?.signerAddress
      );

      if (valAuthResp === true) {
        const fields = await privyClient.getBatch(["email"], {
          limit: 50,
        });

        return res.status(200).json(fields);
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
export default withCors(handler);
