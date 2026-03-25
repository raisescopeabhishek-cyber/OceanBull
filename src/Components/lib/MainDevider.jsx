export const MainDivider = ({
  variant = "modern",
  heading = "",
  className = "",
  orientation = "horizontal",
  headingStyle = "default", // default, pill, minimal, gradient
  color = "primary", // primary, success, warning, danger
}) => {
  const colors = {
    primary: "from-blue-600 to-indigo-600 text-blue-600 border-blue-200",
    success:
      "from-emerald-600 to-green-600 text-emerald-600 border-emerald-200",
    warning: "from-amber-600 to-yellow-600 text-amber-600 border-amber-200",
    danger: "from-red-600 to-rose-600 text-red-600 border-red-200",
  };

  const colorClass = colors[color];

  const headingStyles = {
    default: `relative px-4 bg-white font-semibold ${colorClass.split(" ")[2]}`,
    pill: `relative px-6 py-1 rounded-full bg-white font-semibold ${
      colorClass.split(" ")[2]
    } shadow-sm`,
    minimal: `relative px-4 bg-white font-medium text-gray-600`,
    gradient: `relative px-6 py-1 rounded-full font-semibold text-white bg-gradient-to-r ${
      colorClass.split(" ")[0]
    } ${colorClass.split(" ")[1]}`,
  };

  if (orientation === "vertical") {
    return (
      <div className="flex h-full items-center">
        <div
          className={`h-full w-0.5 bg-gradient-to-b from-transparent via-gray-200 to-transparent ${className}`}
        />
        {heading && (
          <span className="rotate-90 transform whitespace-nowrap px-4 text-sm text-gray-500">
            {heading}
          </span>
        )}
      </div>
    );
  }

  if (variant === "modern" && heading) {
    return (
      <div className="relative flex items-center w-full py-5">
        <div className="flex-grow">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <div
                className={`w-full border-t border-dashed ${
                  colorClass.split(" ")[3]
                }`}
              />
            </div>
            <div className="relative flex justify-center">
              <span className={headingStyles[headingStyle]}>{heading}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "geometric") {
    return (
      <div className="relative flex items-center w-full py-5">
        <div className="flex-grow">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        </div>
        {heading && (
          <div className="relative px-4">
            <div className="absolute -inset-2 transform rotate-3">
              <div
                className={`h-full w-full rounded bg-gradient-to-r ${
                  colorClass.split(" ")[0]
                } ${colorClass.split(" ")[1]} opacity-10`}
              />
            </div>
            <span className="relative font-medium text-gray-900">
              {heading}
            </span>
          </div>
        )}
        <div className="flex-grow">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        </div>
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className="relative flex items-center w-full py-5">
        <div className="flex-grow flex items-center justify-center space-x-2">
          <div className="h-px flex-grow bg-gradient-to-r from-transparent via-gray-200 to-gray-200" />
          <div
            className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${
              colorClass.split(" ")[0]
            } ${colorClass.split(" ")[1]}`}
          />
          {heading && (
            <span className={`px-4 font-medium ${colorClass.split(" ")[2]}`}>
              {heading}
            </span>
          )}
          <div
            className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${
              colorClass.split(" ")[0]
            } ${colorClass.split(" ")[1]}`}
          />
          <div className="h-px flex-grow bg-gradient-to-r from-gray-200 via-gray-200 to-transparent" />
        </div>
      </div>
    );
  }

  // Default simple gradient divider
  return (
    <div
      className={`h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent my-8 ${className}`}
    />
  );
};
