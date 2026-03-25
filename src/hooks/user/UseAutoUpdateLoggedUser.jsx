import { setLoggedUser } from "@/redux/user/userSlice";
import { backendApi } from "@/utils/apiClients";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useAutoUpdateLoggedUser = () => {
  const dispatch = useDispatch();
  const loggedUser = useSelector((state) => state.user.loggedUser);

  useEffect(() => {
    if (!loggedUser?._id) return;

    const fetchUser = async () => {
      //   console.log("called user");
      try {
        const res = await backendApi.get(`/get-user?id=${loggedUser._id}`);
        dispatch(setLoggedUser(res.data.data));
      } catch (err) {
        console.error("Auto-update failed:", err.message);
      }
    };

    const interval = setInterval(fetchUser, 3000);
    fetchUser(); // initial call

    return () => clearInterval(interval); // cleanup
  }, [loggedUser?._id, dispatch]);
};

export default useAutoUpdateLoggedUser;
