import { fetchAccountsInfo } from "@/redux/AsyncThunk/fetchAccountsInfo";
import { fetchCurrentUser } from "@/redux/AsyncThunk/fetchCurrentUser";
import { setSiteConfig } from "@/redux/user/userSlice";
import { backendApi } from "@/utils/apiClients";
import { useEffect } from "react";
import { useDispatch } from "react-redux";











const useSiteConfig = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchSiteConfigData = async () => {
      try {
        
        const res = await backendApi.get(`/site-config`);
        dispatch(setSiteConfig(res.data.data));


                   setInterval(() => {
  dispatch(fetchAccountsInfo());
  // dispatch(fetchIbAccountsInfo());
}, 10000);

        await dispatch(fetchCurrentUser());
      } catch (err) {
        console.error("Error fetching site config:", err);
      }
    };

    fetchSiteConfigData();
  }, [dispatch]);
};

export default useSiteConfig;
