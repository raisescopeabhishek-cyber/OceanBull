/** Barrel for the design system. Import from "@/Components/ui". */

/* --- primitives --- */
export { default as Button, IconButton } from "./Button";
export { default as Card, Panel, Well, CardHeader, CardBody, CardFooter } from "./Card";
export { default as Badge, StatusBadge, Delta, toneForStatus } from "./Badge";
export { default as Input, Field, Textarea, Select, SearchInput } from "./Input";
export { default as DataTable, TableSkeleton } from "./DataTable";
export { default as StatCard, StatGrid, Readout, ReadoutStrip } from "./StatCard";
export { default as Skeleton } from "./Skeleton";
export { default as EmptyState } from "./EmptyState";
export { default as Modal, Drawer } from "./Modal";
export { default as Tabs, SegmentedControl } from "./Tabs";
export { default as ThemeToggle, ThemeModeSelect } from "./ThemeToggle";
export { default as PageHeader } from "./PageHeader";
export { default as NavRail } from "./NavRail";
export { SidebarProvider, useSidebar } from "./SidebarContext";

/* --- parts --- */
export { default as FilterBar } from "./FilterBar";
export { default as BulkBar } from "./BulkBar";
export { default as Stepper, SectionStep } from "./Stepper";
export { EquityCurve, FlowBars, Meter } from "./Charts";

/* --- page shells: every screen is one of these four --- */
export { default as BlotterPage } from "./BlotterPage";
export { default as ReviewPage, ReviewSection, CompareTable } from "./ReviewPage";
export { default as DashboardPage, DashboardPanel } from "./DashboardPage";
export { default as FormPage } from "./FormPage";
