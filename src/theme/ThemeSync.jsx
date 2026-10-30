import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { setUserTheme } from "@/redux/userThemeSlice";
import { setAdminTheme } from "@/redux/adminThemeSlice";
import { setSuperadminTheme } from "@/redux/superadminThemeSlice";
import { useTheme } from "./ThemeProvider";

/**
 * Keeps the three legacy redux theme slices in step with ThemeProvider.
 *
 * The app grew three independent `mode` slices (user, admin, superadmin), and
 * around 56 components still read them to decide inline styles and chart
 * colours. Rather than rewrite all of those at once, the provider stays the
 * single source of truth and pushes its resolved theme into each slice, so a
 * component reading `store.userTheme.mode` and one reading `useTheme()` can
 * never disagree.
 *
 * These slices are persisted by redux-persist, so this also corrects a stale
 * persisted value on boot.
 */
const ThemeSync = () => {
  const { resolved } = useTheme();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setUserTheme(resolved));
    dispatch(setAdminTheme(resolved));
    dispatch(setSuperadminTheme(resolved));
  }, [resolved, dispatch]);

  return null;
};

export default ThemeSync;
