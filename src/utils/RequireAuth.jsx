import LoadingModal from "@/LoadingModal";
import React, { useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { backendApi } from "./apiClients";
import { fetchCurrentUser } from "@/redux/AsyncThunk/fetchCurrentUser";
import { useDispatch } from "react-redux";
import { mt5AccountsStore } from "../services/mt5Accounts";

const RequireAuth = ({ children }) => {
  const location = useLocation();
  const [state, setState] = useState({ loading: true, ok: false });
  const lastToastKeyRef = useRef("");
  const dispatch = useDispatch();

  const checkWithRefresh = async (meUrl, refreshUrl) => {
    try {
      await backendApi.get(meUrl);
      return true;
    } catch (err) {
      const st = err?.status;
      if ((st === 401 || st === 403) && refreshUrl) {
        await backendApi.post(refreshUrl);
        await backendApi.get(meUrl);
        return true;
      }
      throw err;
    }
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        let ok = false;

        if (location.pathname.startsWith("/admin")) {
          ok = await checkWithRefresh("/auth/admin-me", "/auth/admin/refresh");
        } else if (location.pathname.startsWith("/s-admin")) {
          await backendApi.get("/auth/s-admin-me");
          ok = true;
        } else if (location.pathname.startsWith("/user")) {
          ok = await checkWithRefresh("/auth/user-me", "/auth/refresh");

          // sirf user side par
          await dispatch(fetchCurrentUser());
        }

        if (!cancelled) {
          setState({ loading: false, ok });
        }
      } catch (err) {
        if (cancelled) return;
        mt5AccountsStore.reset();
        if (!cancelled) setState({ loading: false, ok: false });

        const msg = "Unauthorized";
        const toastKey = `${location.pathname}|${msg}`;
        if (lastToastKeyRef.current !== toastKey) {
          lastToastKeyRef.current = toastKey;
          toast.error(msg);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, dispatch]);

  if (state.loading) return <LoadingModal />;

  if (location.pathname.startsWith("/admin")) {
    return state.ok ? (
      children
    ) : (
      <Navigate
        to="/auth/admin/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  if (location.pathname.startsWith("/s-admin")) {
    return state.ok ? (
      children
    ) : (
      <Navigate
        to="/auth/s-admin/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  if (location.pathname.startsWith("/user")) {
    return state.ok ? (
      children
    ) : (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return <Navigate to="/auth/login" replace />;
};

export default RequireAuth;
