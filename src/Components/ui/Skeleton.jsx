import { cn } from "../lib/utils";

/** Shimmer placeholder. Give it a width and height via className. */
export const Skeleton = ({ className, ...props }) => (
  <div
    aria-hidden="true"
    className={cn("animate-pulse rounded-lg bg-surface-3", className)}
    {...props}
  />
);

export default Skeleton;
