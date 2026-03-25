import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  ChevronDown,
  ChevronUp,
  Home,
  Users,
  ChevronsRight,
  LogOut,
  CreditCard,
  LucideBadgeDollarSign,
  Banknote,
  HandCoins,
  LucideBookText,
  Mails,
  SquareStackIcon,
  SubtitlesIcon,
  HardDrive,
  CopyPlusIcon,
} from "lucide-react";
import { RiFileUserFill, RiProfileFill } from "react-icons/ri";

const sidebarVariants = {
  open: {
    width: "256px",
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  closed: {
    width: "0px",
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      when: "afterChildren",
    },
  },
};

const contentVariants = {
  open: {
    opacity: 1,
    x: 0,
    transition: { delay: 0.2, duration: 0.2 },
  },
  closed: {
    opacity: 0,
    x: -10,
    transition: { duration: 0.2 },
  },
};

const Sidebar = () => {
  const dispatch = useDispatch();
  const adminToggle = useSelector((store) => store.admin.adminToggle);
  const [isOpen, setIsOpen] = useState(!adminToggle);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
  const sidebarRef = useRef(null);
  const [openSections, setOpenSections] = useState(new Set());
  const siteConfig = useSelector((state) => state.user.siteConfig); // Get from Redux
  const baseHeight = siteConfig?.logoSize || 4;

  const menuItems = [
    { label: "Dashboard", icon: <Home />, route: "/admin/dashboard" },
    {
      label: "Login Logs",
      icon: <ChevronsRight />,
      route: "/admin/login-logs",
    },
    // {
    //   label: "Rules",
    //   icon: <LucideBookText />,
    //   route: "/admin/rules",
    // },
    {
      label: "Manage Users",
      icon: <Users />,
      nested: [
        {
          label: "KYC Updates",
          route: "/admin/kyc-users",
        },
        {
          label: "IB Users",
          route: "/admin/ib-users",
        },
        {
          label: "Email Verified",
          route: "/admin/manage-users/email-verified",
        },
        {
          label: "Email Unverified",
          route: "/admin/manage-users/email-unverified",
        },
        { label: "KYC Verified", route: "/admin/manage-users/kyc-verified" },
        {
          label: "KYC Unverified",
          route: "/admin/manage-users/kyc-unverified",
        },
        { label: "All Users", route: "/admin/manage-users/all-users" },
      ],
    },
    {
      label: "Deposits",
      icon: <LucideBadgeDollarSign />,
      nested: [
        { label: "Pending Deposits", route: "/admin/deposit/pending" },
        { label: "Approved Deposits", route: "/admin/deposit/approved" },
        { label: "Rejected Deposits", route: "/admin/deposit/rejected" },
        { label: "All Deposits", route: "/admin/deposit/all" },
      ],
    },
    {
      label: "Withdrawals",
      icon: <Banknote />,
      nested: [
        { label: "Pending Withdrawals", route: "/admin/withdrawal/pending" },
        { label: "Approved Withdrawals", route: "/admin/withdrawal/approved" },
        { label: "Rejected Withdrawals", route: "/admin/withdrawal/rejected" },
        { label: "All Withdrawals", route: "/admin/withdrawal/all" },
      ],
    },
    {
      label: "IB Withdrawals",
      icon: <HandCoins />,
      nested: [
        {
          label: "Pending IB Withdrawals",
          route: "/admin/ib-withdrawal/pending",
        },
        {
          label: "Approved IB Withdrawals",
          route: "/admin/ib-withdrawal/approved",
        },
        {
          label: "Rejected IB Withdrawals",
          route: "/admin/ib-withdrawal/rejected",
        },
        { label: "All IB Withdrawals", route: "/admin/ib-withdrawal/all" },
      ],
    },
    // {
    //   label: "Copy Requests",
    //   icon: <CopyPlusIcon />,
    //   route: "/admin/copy-requests",
    // },
    {
      label: "Payment Getaways",
      icon: <CreditCard />,
      route: "/admin/getway/manual",
    },
    {
      label: "Site Configuration",
      icon: <SubtitlesIcon />,
      route: "/admin/site-configuration",
    },
    {
      label: "Custom Mail",
      icon: <Mails />,
      route: "/admin/custom-email",
    },
    {
      label: "IB Zone",
      icon: <SquareStackIcon />,
      route: "/admin/ib-zone",
    },
    { label: "Logout", icon: <LogOut />, route: "/admin/login" },
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setIsOpen(!adminToggle || isLargeScreen);
  }, [adminToggle, isLargeScreen]);

  const closeSidebar = () => {
    if (!isLargeScreen) {
      setIsOpen(false);
      dispatch({ type: "TOGGLE_ADMIN_SIDEBAR", payload: true });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        isOpen &&
        !isLargeScreen
      ) {
        closeSidebar();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isLargeScreen]);

  const toggleSection = (section) => {
    setOpenSections((prev) => {
      const newOpenSections = new Set(prev);
      if (newOpenSections.has(section)) {
        newOpenSections.delete(section);
      } else {
        newOpenSections.add(section);
      }
      return newOpenSections;
    });
  };

  return (
    <>
      {isOpen && !isLargeScreen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}
      <motion.div
        ref={sidebarRef}
        className={`fixed left-0 h-screen top-0 bg-primary-800 text-white overflow-hidden z-50 ${
          isLargeScreen ? "lg:relative lg:top-0 lg:h-screen" : ""
        }`}
        initial={false}
        animate={isOpen || isLargeScreen ? "open" : "closed"}
        variants={sidebarVariants}
      >
        <motion.div
          className="h-full overflow-y-auto custom-scrollbar"
          varian
          ts={contentVariants}
        >
          <a
            href="/user/dashboard"
            className=" flex  lg:hidden my-4 justify-center"
          >
            <img
              src={siteConfig?.logo}
              alt="Forex Logo"
              className="block  object-contain w-auto dynamic-logo"
            />

            <style jsx>{`
              .dynamic-logo {
                height: ${baseHeight * 0.8}rem;
              }
              @media (min-width: 640px) {
                .dynamic-logo {
                  height: ${baseHeight * 0.9}rem;
                }
              }
              @media (min-width: 768px) {
                .dynamic-logo {
                  height: ${baseHeight}rem;
                }
              }
              @media (min-width: 1024px) {
                .dynamic-logo {
                  height: ${baseHeight * 1.2}rem;
                }
              }
            `}</style>
          </a>
          <ul className="space-y-2 text-sm px-4 py-3">
            {menuItems.map((item, index) => (
              <li key={index} className="relative">
                {item.route ? (
                  <NavLink
                    to={item.route}
                    className={({ isActive }) =>
                      `flex items-center w-full p-2 text-left rounded transition-colors duration-200 ${
                        isActive ? "bg-primary-600" : "hover:bg-primary-600"
                      }`
                    }
                  >
                    {item.icon}
                    <span className="ml-3 text-sm">{item.label}</span>
                  </NavLink>
                ) : (
                  <button
                    onClick={() => item.nested && toggleSection(item.label)}
                    className="flex items-center w-full p-2 text-left hover:bg-primary-600 rounded transition-colors duration-200"
                  >
                    {item.icon}
                    <span className="ml-3 text-sm">{item.label}</span>
                    {item.nested && (
                      <span className="ml-auto">
                        {openSections.has(item.label) ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </span>
                    )}
                  </button>
                )}
                <AnimatePresence>
                  {item.nested && openSections.has(item.label) && (
                    <motion.ul
                      className="ml-6 mt-1 space-y-1 bg-primary-700 rounded-lg shadow-md overflow-hidden"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {item.nested.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <NavLink
                            to={subItem.route}
                            onClick={closeSidebar}
                            className={({ isActive }) =>
                              `flex items-center p-2 text-left text-gray-300 hover:bg-primary-600 rounded-lg transition-colors duration-200 ${
                                isActive ? "bg-primary-600" : ""
                              }`
                            }
                          >
                            <span className="ml-2 text-sm">
                              {subItem.label}
                            </span>
                          </NavLink>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </>
  );
};

export default Sidebar;
