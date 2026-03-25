import {
  setAdminUser,
  setDbUsers,
  setDeposits,
  setWithdrawals,
} from "@/redux/adminSlice";
import axios from "axios";
import { useDispatch } from "react-redux";

export default function UseAdminHook() {
  const dispatch = useDispatch();

  // get users----------
  const getUsers = async () => {
    try {
      // const res = await axios.get(
      //   `${import.meta.env.VITE_BECKEND_END_POINT}/api/auth/get-users`
      // );
      // //   console.log("get users---", res.data);
      // dispatch(setDbUsers(res.data.data));
    } catch (error) {
      console.log(error);
    }
  };

  // get deposits----------
  const getDeposits = async () => {
    try {
      // const res = await axios.get(
      //   `${import.meta.env.VITE_BECKEND_END_POINT}/api/auth/deposits`
      // );
      // //   console.log("get deposits---", res.data);
      // dispatch(setDeposits(res.data.data));
    } catch (error) {
      console.log(error);
    }
  };

  // get withdrwals----------
  const getWithdrawals = async () => {
    try {
      // const res = await axios.get(
      //   `${import.meta.env.VITE_BECKEND_END_POINT}/api/auth/withdrawals`
      // );
      // //   console.log("get withdrawals---", res.data);
      // dispatch(setWithdrawals(res.data.data));
    } catch (error) {
      console.log(error);
    }
  };
  const getResetAdmin = () => {
    dispatch(setAdminUser(""));
    dispatch(setDbUsers([]));
    dispatch(setDeposits([]));
    dispatch(setWithdrawals([]));
  };

  return { getUsers, getDeposits, getWithdrawals, getResetAdmin };
}
