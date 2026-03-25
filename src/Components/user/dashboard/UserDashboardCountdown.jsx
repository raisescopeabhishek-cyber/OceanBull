import React, { useState, useEffect } from "react";

// Get dynamic timer end time from environment variable
const timerEndEnv = import.meta.env.VITE_TIMER_END || "23:59:00"; // Default to 23:59:00 if not set

const UserDashboardCountdown = () => {
  // Parse time strings to hours, minutes, and seconds
  const parseTime = (timeString) => {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return { hours, minutes, seconds };
  };

  const timerEnd = parseTime(timerEndEnv);

  const calculateTimeLeft = () => {
    const now = new Date();
    const endTime = new Date();

    // Set end time based on environment variable
    endTime.setHours(timerEnd.hours, timerEnd.minutes, timerEnd.seconds, 0);

    // If the end time is before the current time, set it to the next day
    if (now > endTime) {
      endTime.setDate(endTime.getDate() + 1); // Move to next day
    }

    // Calculate the time remaining
    const timeRemaining = endTime - now;

    const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeRemaining / (1000 * 60)) % 60);
    const seconds = Math.floor((timeRemaining / 1000) % 60);

    return { hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className=" flex flex-col justify-center bg-gradient-to-br from-secondary-800/40 to-secondary-800/90 mt-5 shadow-lg rounded-xl p-6 sm:p-3 max-w-full lg:max-w-lg w-full sm:max-w-md mx-auto">
      <h2 className="text-lg sm:text-xl font-semibold mb-6 text-center text-white">
        Daily loss will reset in
      </h2>
      <div className="flex justify-center items-center space-x-4 sm:space-x-6 mb-2">
        {["hours", "minutes", "seconds"].map((unit) => (
          <div key={unit} className="text-center">
            <div className="bg-gradient-to-b from-secondary-800/10 to-secondary-500/40 text-white text-4xl sm:text-5xl font-bold rounded-lg p-3 sm:p-4 w-24 sm:w-28 h-24 sm:h-28 flex items-center justify-center shadow-md">
              {String(timeLeft[unit]).padStart(2, "0")}
            </div>
            <p className="text-xs sm:text-sm mt-2 text-secondary-300">{unit}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDashboardCountdown;
