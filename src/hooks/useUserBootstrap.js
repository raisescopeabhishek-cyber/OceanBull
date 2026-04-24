import { fetchAccountsInfo } from "@/redux/AsyncThunk/fetchAccountsInfo";
import { fetchCurrentUser } from "@/redux/AsyncThunk/fetchCurrentUser";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useUserBootstrap = (shouldFetch) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!shouldFetch) return;

    let intervalId;

    const init = async () => {
      try {
        // await dispatch(fetchCurrentUser());
        // await dispatch(fetchAccountsInfo());

        // intervalId = setInterval(() => {
        //   dispatch(fetchAccountsInfo());
        // }, 10000);
      } catch (err) {
        console.error("Error in user bootstrap:", err);
      }
    };

    init();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [dispatch, shouldFetch]);
};

export default useUserBootstrap;