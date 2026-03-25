import React from "react";
import { Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const UserDashboardBanner = () => {
  const loggedUser = useSelector((store) => store.user.loggedUser);

  return (
    <div className=" sm:max-h-[300px] sm:my-auto bg-gradient-to-br from-indigo-900 via-indigo-950 to-indigo-900  text-white p-6 sm:p-8 rounded-xl shadow-xl max-w-xl lg:max-w-2xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">
        Welcome{" "}
        <span className="text-secondary-500">
          {loggedUser?.firstName} {loggedUser?.lastName}
        </span>
      </h1>
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between mb-6 gap-4">
        <div className="text-center sm:text-left">
          <p className="text-sm sm:text-base text-secondary-300 font-semibold leading-relaxed">
            We’re excited to have you here! Visit our FAQ for helpful guidance.
          </p>
        </div>
        <div className="flex-shrink-0">
          <Trophy className="w-12 h-12 sm:w-14 sm:h-14 text-secondary-500 drop-shadow-md" />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to={"/user/new-challenge"}>
          <button className="w-full text-xs lg:text-sm sm:w-auto border-t-2 bg-secondary-500 border-secondary-500 text-white py-3 px-6 rounded-full font-semibold hover:bg-secondary-500-70 transition-all duration-300">
            Create An Account
          </button>
        </Link>
        <Link to={"/user/challenges"}>
          <button className="w-full text-xs lg:text-sm sm:w-auto border-secondary-500 border-b-2 text-white py-3 px-6 rounded-full font-semibold shadow hover:text-secondary-500 hover:shadow-lg transition-all duration-300">
            Account Details
          </button>
        </Link>
      </div>
    </div>
  );
};

export default UserDashboardBanner;
