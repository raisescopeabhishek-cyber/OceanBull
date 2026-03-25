import { setSiteConfig, setThemeConfig } from "@/redux/user/userSlice";
import { backendApi } from "@/utils/apiClients";
import { useEffect } from "react";
import { useDispatch } from "react-redux";











const useThemeConfig = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchSiteConfigData = async () => {
      try {
        const res = await backendApi.get(`/active-theme`);
        console.log(res);
        
        dispatch(setThemeConfig(res.data.data));
      } catch (err) {
        console.error("Error fetching site config:", err);
      }
    };

    fetchSiteConfigData();
  }, [dispatch]);
};

export default useThemeConfig;
