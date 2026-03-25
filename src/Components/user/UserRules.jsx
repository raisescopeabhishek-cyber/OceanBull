import Loader from "../../Components/Loader/Loader";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpenIcon, ChevronDown, ChevronUp, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const DefinitionAccordion = ({ title, content, isOpen, toggle }) => {
  return (
    <div className=" border-b border-secondary-500/20 rounded-md">
      <button
        className="w-full px-4 py-3 text-left focus:outline-none flex justify-between items-center"
        onClick={toggle}
      >
        <span className="font-medium">{title}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-secondary-500/50" />
        ) : (
          <ChevronDown className="h-5 w-5  text-secondary-500/50" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 bg-secondary-800/60">{content}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const UserRules = () => {
  const [expandedDefinition, setExpandedDefinition] = useState(
    "What is Forex Trading?"
  );
  const [visibleRules, setVisibleRules] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleDefinition = (definition) => {
    setExpandedDefinition(
      expandedDefinition === definition ? null : definition
    );
  };

  // Fetch rules ---------------
  const fetchRules = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BECKEND_END_POINT}/api/auth/get-rules`
      );
      const filterData = response.data.data.filter(
        (value) => value.status === true
      );
      setRules(filterData);
    } catch (err) {
      toast.error("Failed to fetch data");
      console.log(err);
      setRules([]);
    }
    setLoading(false);
  };

  function formatTextWithLinks(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    return text.split(urlRegex).map((part, index) => {
      // If part is a URL, wrap it in an anchor tag
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-400/80 underline"
          >
            {part}
          </a>
        );
      }
      // Otherwise, return the text part as is
      return part;
    });
  }

  // Reset visible rules when rules change
  useEffect(() => {
    setVisibleRules([]); // Reset visible rules
    if (rules.length > 0) {
      rules.forEach((_, index) => {
        setTimeout(() => {
          setVisibleRules((prev) => [...prev, index]);
        }, index * 200); // Reduced delay to 200ms for smoother animation
      });
    }
  }, [rules]); // Depend on rules instead of mounting

  useEffect(() => {
    fetchRules();
  }, []);

  return (
    <div className="mx-auto p-6 rounded-xl shadow-lg">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-8 text-center"
      >
        Roles & Definitions
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Rules Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-secondary-800/20 rounded-lg shadow-md p-6"
        >
          <h3 className="text-2xl font-semibold mb-4 flex items-center">
            <Shield className="mr-2 text-secondary-500" />
            Rules
          </h3>
          {loading ? (
            <Loader />
          ) : (
            <ul className="space-y-3">
              {rules?.map((rule, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={
                    visibleRules.includes(index)
                      ? { opacity: 1, x: 0 }
                      : { opacity: 0, x: -20 }
                  }
                  transition={{ duration: 0.3 }}
                  className="flex items-start"
                >
                  <div
                    className="flex-shrink-0 w-1.5 h-1.5 mt-1.5 rounded-full"
                    style={{ backgroundColor: rule?.color }}
                  ></div>
                  <p className="ml-2">{formatTextWithLinks(rule?.text)}</p>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* Forex Definitions Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-secondary-800/20 rounded-lg shadow-md p-6"
        >
          <h3 className="text-2xl font-semibold mb-4 flex items-center">
            <BookOpenIcon className="mr-2 text-secondary-500 " />
            Forex Definitions
          </h3>
          <div className="space-y-4">
            <DefinitionAccordion
              title="What is Forex Trading?"
              content="Forex trading, also known as foreign exchange trading or currency trading, is the buying and selling of currencies on the foreign exchange market with the aim of making a profit."
              isOpen={expandedDefinition === "What is Forex Trading?"}
              toggle={() => toggleDefinition("What is Forex Trading?")}
            />
            <DefinitionAccordion
              title="What is a Pip?"
              content="A pip, short for 'percentage in point' or 'price interest point,' is the smallest price move that an exchange rate can make based on forex market convention. Most currency pairs are priced to four decimal places and the pip is the last (fourth) decimal point."
              isOpen={expandedDefinition === "What is a Pip?"}
              toggle={() => toggleDefinition("What is a Pip?")}
            />
            <DefinitionAccordion
              title="What is Leverage in Forex?"
              content="Leverage in Forex trading allows traders to control a larger position than their initial investment, amplifying both potential gains and potential losses. It is typically expressed as a ratio, such as 100:1, meaning the trader can control $100 for every $1 in their account."
              isOpen={expandedDefinition === "What is Leverage in Forex?"}
              toggle={() => toggleDefinition("What is Leverage in Forex?")}
            />
            <DefinitionAccordion
              title="What is a Currency Pair?"
              content="A currency pair in Forex is a quotation of two different currencies, where the value of one currency is quoted against the other. The first currency is the base currency, and the second is the quote currency. For example, in EUR/USD, EUR is the base currency, and USD is the quote currency."
              isOpen={expandedDefinition === "What is a Currency Pair?"}
              toggle={() => toggleDefinition("What is a Currency Pair?")}
            />

            <DefinitionAccordion
              title="What is a Stop-Loss Order?"
              content="A stop-loss order is a risk management tool that allows traders to set a predefined price level at which their position will automatically be closed to limit potential losses. It helps manage risk by preventing further loss if the market moves unfavorably."
              isOpen={expandedDefinition === "What is a Stop-Loss Order?"}
              toggle={() => toggleDefinition("What is a Stop-Loss Order?")}
            />
            <DefinitionAccordion
              title="What is Technical Analysis?"
              content="Technical analysis is a method of evaluating price movements and trends using historical market data, such as price charts and trading volume. Forex traders use technical analysis to identify trading opportunities and forecast future currency movements."
              isOpen={expandedDefinition === "What is Technical Analysis?"}
              toggle={() => toggleDefinition("What is Technical Analysis?")}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserRules;
