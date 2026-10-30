import { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * Holds whether the mobile sidebar drawer is open.
 *
 * The sidebar and the header live in different branches of the layout, and
 * the menu button sits in the header, so the state belongs above both rather
 * than inside either one.
 */
const SidebarContext = createContext({
  open: false,
  openSidebar: () => {},
  closeSidebar: () => {},
});

export const SidebarProvider = ({ children }) => {
  const [open, setOpen] = useState(false);

  const openSidebar = useCallback(() => setOpen(true), []);
  const closeSidebar = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ open, openSidebar, closeSidebar }),
    [open, openSidebar, closeSidebar]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);

export default SidebarProvider;
