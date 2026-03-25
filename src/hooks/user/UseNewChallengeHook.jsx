import { setPaymentMethods, setPlatforms } from "@/redux/user/userSlice";
import { userApi } from "@/utils/apiClients";
import axios from "axios";
import { useDispatch } from "react-redux";

export default function UserNewChallengeHook() {
  const dispatch = useDispatch();

  const getPlatforms = async () => {
    try {
      const res = await userApi.get(`/get-platforms`);
      dispatch(setPlatforms(res.data.data));
    } catch (error) {
      console.log("error in get platforms", error);
    }
  };

  const getPaymentMethod = async () => {
    try {
      const res = await userApi.get(`/get-payment-methods`);
      console.log(res);
      
      dispatch(setPaymentMethods(res.data.data));
    } catch (error) {
      console.log("error in get payment methods", error);
    }
  };
  return { getPlatforms, getPaymentMethod };
}
