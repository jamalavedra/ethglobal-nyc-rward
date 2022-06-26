import DashboardShell from "@/components/DashboardShell";
import { Web3Context } from "@/contexts/Web3Context";
import { useContext, useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import fetcher from "@/utils/fetcher";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { prettifyNumber } from "@/utils/stringUtils";
import Link from "next/link";

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const Dashboard = () => {
  const { signerAddress, getAuthToken, prettyName } = useContext(Web3Context);
  const cookies = Cookies.withAttributes({
    path: "/",
  });
  const [apikeyData, setApikeyData] = useState({});
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [batchData, setBatchData] = useState([]);

  useEffect(() => {
    if (signerAddress != "") {
      getAuthToken().then((authToken) => {
        fetcher(
          `/api/apikey?token=${authToken}&signerAddress=${signerAddress}`
        ).then((data) => {
          setApikeyData(data);
          if (Boolean(data?.data) === true) {
            let keys = Object.keys(data.data);
            let usageDB = {};
            for (let index = 0; index < keys.length; index++) {
              let mmyy = keys[index].split("-")[2];
              if (Object.keys(usageDB).includes(mmyy) === true) {
                usageDB[mmyy] += parseInt(data.data[keys[index]]);
              } else {
                usageDB[mmyy] = parseInt(data.data[keys[index]]);
              }
            }

            let localChartData = [];
            let usageKeys = Object.keys(usageDB);
            for (let index = 0; index < usageKeys.length; index++) {
              localChartData.push({
                sortby: parseInt(
                  usageKeys[index].slice(2, 4) + usageKeys[index].slice(0, 2)
                ),
                name:
                  monthNames[parseInt(usageKeys[index].slice(0, 2)) - 1] +
                  " '" +
                  usageKeys[index].slice(2, 4),
                Usage: usageDB[usageKeys[index]],
              });
            }
            localChartData = localChartData.sort((l, r) => {
              return l.sortby - r.sortby;
            });
            console.log(localChartData);
            setChartData(localChartData);
          } else {
            setChartData([]);
          }
        });
        fetcher(
          `/api/batchPrivy?token=${authToken}&signerAddress=${signerAddress}`
        ).then((data) => {
          console.log(data);

          setBatchData(data.users);
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signerAddress]);

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
      {Boolean(apikeyData) === true ? (
        Boolean(apikeyData?.activeKey) === true ? (
          <>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-5">
                <div className="space-y-6">
                  <p className="text-gray-500">
                    <span className="text-black font-medium">API key</span>
                    <br />
                    {apikeyData?.activeKey}
                  </p>
                  <button
                    className="block px-5 py-3 text-md font-medium text-indigo-600 hover:text-white border-2 transition border-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring"
                    type="button"
                    onClick={generate}
                  >
                    Regenerate
                  </button>
                </div>
              </div>
              <div className="col-span-5">
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#8884d8"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8884d8"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#82ca9d"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#82ca9d"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" />
                    <YAxis
                      tickFormatter={(tick) => {
                        return prettifyNumber(tick);
                      }}
                    />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="Usage"
                      stroke="#8884d8"
                      fillOpacity={1}
                      fill="url(#colorUv)"
                    />
                    {/* <Area type="monotone" dataKey="usage" stroke="#82ca9d" fillOpacity={1} fill="url(#colorPv)" /> */}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <p className="font-bold text-3xl mt-3 mb-5">Customers</p>
            <div className="overflow-hidden overflow-x-auto border border-gray-100 rounded">
              <table className="min-w-full text-sm divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 font-medium text-left text-gray-900 whitespace-nowrap">
                      ID
                    </th>
                    <th className="px-4 py-2 font-medium text-left text-gray-900 whitespace-nowrap">
                      Email
                    </th>
                    <th className="px-4 py-2 font-medium text-left text-gray-900 whitespace-nowrap">
                      Claimed
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {batchData.map((user) => (
                    <tr key={user.user_id}>
                      <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">
                        <Link href={"/claim/" + user.user_id}>
                          <a className="underline">{user.user_id}</a>
                        </Link>
                      </td>

                      <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                        {user.data[0] !== null ? user.data.text() : "N/A"}
                      </td>
                      <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                        ❌
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div>
            <p className="font-medium mb-3">
              Click Generate to create a new API key:
            </p>
            <button
              className="block px-5 py-3 text-md font-medium text-indigo-600 hover:text-white border-2 transition border-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring"
              type="button"
              onClick={generate}
            >
              Generate
            </button>
          </div>
        )
      ) : (
        <p>Loading</p>
      )}
    </DashboardShell>
  );
};
export default Dashboard;
