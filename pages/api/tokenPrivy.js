import { PrivyClient } from "@privy-io/privy-node";
import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

const privyClient = new PrivyClient(
  process.env.PRIVY_API_KEY,
  process.env.PRIVY_API_SECRET
);

export default async function handler(req, res) {
  try {
    const session = await unstable_getServerSession(req, res, authOptions);

    if (session) {
      // const fields = await privyClient.getBatch(["email"], {
      //   limit: 50,
      // });
      // console.log(fields);
      const token = await privyClient.createAccessToken(
        "0xd3b154716151ec0da81ca193d8390b8c59aa6a9a"
      );
      res.status(200).json({ token });
    } else {
      res.send({
        error:
          "You must be signed in to view the protected content on this page.",
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.toString() });
  }
  // Assuming some middleware verified the logged in user
}
