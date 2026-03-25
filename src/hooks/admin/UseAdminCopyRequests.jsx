import { backendApi } from "@/utils/apiClients";
import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";

export default function useAdminCopyRequest({
  page = 1,
  limit = 10,
  status = "",
} = {}) {
  const loggedUser = useSelector((store) => store.user.loggedUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({});

  const fetchData = useCallback(async () => {


    setIsLoading(true);
    setIsError(false);

    try {

    console.log(loggedUser);

      const res = await backendApi.get("/copy-requests", {
        params: {
          page,
          limit,
          status: status || undefined,
        },
      });

      console.log(res);
      
      setData(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [loggedUser?._id, loggedUser?.token, page, limit, status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, isError, pagination, refresh: fetchData };
}
