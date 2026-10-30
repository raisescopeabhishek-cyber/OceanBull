import { cn } from "../lib/utils";
import Card from "./Card";

/** Shown in place of a table or list when there is no data. */
export const EmptyState = ({
  icon,
  title = "Nothing here yet",
  description,
  action,
  className,
}) => (
  <Card className={cn("px-5 py-9 text-center", className)}>
    {icon ? (
      <div className="mx-auto mb-2.5 grid h-10 w-10 place-items-center rounded-full bg-surface-2 text-subtle">
        {icon}
      </div>
    ) : null}

    <p className="font-medium text-text">{title}</p>

    {description ? (
      <p className="mx-auto mt-1 max-w-[44ch] text-[12.5px] text-subtle">
        {description}
      </p>
    ) : null}

    {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
  </Card>
);

export default EmptyState;
