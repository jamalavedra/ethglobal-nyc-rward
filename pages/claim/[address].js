import { useRouter } from "next/router";
import { PrivyClient, CustomSession } from "@privy-io/privy-browser";
import { useSession, signOut } from "next-auth/react";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import fetcher from "@/utils/fetcher";

const Dashboard = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const [content, setContent] = useState();

  let [state, setState] = useState();
  // Fetch content from protected route
  useEffect(() => {
    if (session) {
      const fetchData = async () => {
        const session_privy = new CustomSession(async function authenticate() {
          const response = await fetcher(`/api/tokenPrivy`, "POST", {
            address: router.query.address,
          });
          // await axios.post(`/api/tokenPrivy`);
          return response.data.token;
        });
        console.log("session_privy", session_privy);
        setContent(session_privy);
      };
      fetchData();
    }
  }, [session]);

  const fetchDataFromPrivy = async () => {
    try {
      const client = new PrivyClient({
        session: content,
      });
      // If this is a refresh, we need to pull the address into state
      // Fetch user's name and favorite color from Privy
      const [email, mnemonic] = await client.get(router.query.address, [
        "email",
        "mnemonic",
      ]);
      console.log(email?.text(), mnemonic?.text());

      setState({
        ...state,
        userId: router.query.address,
        email: email?.text(),
        mnemonic: mnemonic?.text(),
      });
    } catch (error) {
      console.log(error);
    }
  };
  // When the page first loads, check if there is a connected wallet and get
  // user data associated with this wallet from Privy
  useEffect(() => {
    fetchDataFromPrivy();
  }, [content]);

  return (
    <>
      {!session ? (
        <div className="max-w-screen-xl px-4 py-16 mx-auto sm:px-6 lg:px-8">
          <div className="max-w-lg mx-auto text-center">
            <h1 className="text-2xl font-bold sm:text-3xl">
              Claim your rewards today!
            </h1>
            <p>
              <Link href="/api/auth/signin">
                <a
                  className="mt-10 block px-5 py-3 text-sm font-medium text-white transition bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring"
                  onClick={(e) => {
                    e.preventDefault();
                    signIn();
                  }}
                >
                  Sign in to claim rewards
                </a>
              </Link>
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-screen-xl px-4 py-16 mx-auto sm:px-6 lg:px-8">
          <div className="max-w-lg mx-auto text-center">
            <h1 className="text-2xl font-bold sm:text-3xl">
              Claim your rewards today!
            </h1>

            <p className="mt-4 text-gray-500">
              Here are the details of the wallet with rewards
            </p>
          </div>

          {state && (
            <div className="max-w-md mx-auto mt-8 mb-0 p-4 space-y-4 border-1 border-gray-400 rounded bg-gray-50">
              <p>
                <span className="font-bold">{"Address: "}</span>
                {state.userId}
              </p>
              <p>
                <span className="font-bold">{"Mnemonic: "}</span>
                {state.mnemonic}
              </p>

              <p>
                <span className="font-bold">{"Private Key: "}</span>
                {/* {state["private-key"]} */}
              </p>
            </div>
          )}
          <button
            className="text-sm underline text-gray-700"
            onClick={() => signOut()}
          >
            Sign out
          </button>
        </div>
      )}
    </>
  );
};
export default Dashboard;
