// format date MONGODB ---------------------

export function CFformatDate(isoDateString) {
  const date = new Date(isoDateString);

  const formattedDate = date.toLocaleDateString("en-GB", {
    year: "numeric",
    day: "2-digit",
    month: "2-digit",
  });

  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true, // 12-hour format with AM/PM
  });

  return `${formattedDate}, ${formattedTime}`;
}
// since joined MONGODB ---------------

export function CFcalculateTimeSinceJoined(isoDateString) {
  const joinDate = new Date(isoDateString);
  const today = new Date();

  // Calculate the difference in time (in milliseconds)
  const timeDifference = today - joinDate;

  // Calculate different time units
  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

  // Build the time string
  let timeString = [];

  if (days > 0) {
    timeString.push(`${days} day${days !== 1 ? "s" : ""}`);
  }
  if (hours > 0) {
    timeString.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
  }
  if (minutes > 0) {
    timeString.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
  }

  // Handle case when less than a minute
  if (timeString.length === 0) {
    return "less than a minute ago";
  }

  return timeString.join(", ") + " ago";
}

// current date and time ----------------------

export const CFformattedDateTime =
  new Date().toLocaleDateString("en-GB") +
  ", " +
  new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // 12-hour format with AM/PM
  });

// random number ----------------------

export function CFgenerateRandomNumber(digits) {
  if (digits <= 0) throw new Error("Digits must be a positive number");
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// unix timestamp --------------

export function ConvertUnixTimestamp(timestamp) {
  const date = new Date(timestamp * 1000); // Convert to milliseconds

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-based
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12; // hour '0' should be '12'
  hours = String(hours).padStart(2, "0");

  const formatted = `${day}/${month}/${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
  return formatted;
}
