import { backendApi } from "@/utils/apiClients";
import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";

export default function useUserCopyRequest() {
  const loggedUser = useSelector((store) => store.user.loggedUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState([]);

  const fetchData = useCallback(async () => {
    if (!loggedUser?._id) return;

    setIsLoading(true);
    setIsError(false);

    try {
      const res = await backendApi.get(
        `/copy-requests?userId=${loggedUser?._id}`
      );
      const resData = res.data.data;
      setData(resData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [loggedUser?._id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, isError, refresh: fetchData };
}
