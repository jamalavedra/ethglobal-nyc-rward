import DashboardShell from "@/components/DashboardShell";
import { Web3Context } from "@/contexts/Web3Context";
import { useContext, useState } from "react";
import Cookies from "js-cookie";

const Dashboard = () => {
  const { signerAddress, prettyName } = useContext(Web3Context);
  const cookies = Cookies.withAttributes({
    path: "/",
  });
  const [apikeyData, setApikeyData] = useState({});
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    fetcher(`/api/apikey`, "POST", {
      token: cookies.get("RWARD_SESSION"),
      signerAddress,
    }).then((data) => {
      if (data?.success === true) {
        setApikeyData(data);
      } else {
        alert({
          title: "Whoops!",
          description: data?.error,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
      setLoading(false);
    });
  }

  return (
    <DashboardShell>
      <p>{signerAddress}</p>
      <p>{prettyName}</p>
      <p>{apikeyData?.activeKey}</p>
      <button className="p-2 bg-blue-200 text-white" onClick={generate}>
        Generate
      </button>
    </DashboardShell>
  );
};
export default Dashboard;
