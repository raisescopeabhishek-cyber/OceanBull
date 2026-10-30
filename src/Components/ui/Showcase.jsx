import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  DataTable,
  Drawer,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  SegmentedControl,
  Select,
  Skeleton,
  StatCard,
  StatGrid,
  StatusBadge,
  Tabs,
  Textarea,
  ThemeModeSelect,
  ThemeToggle,
} from "./index";

/**
 * Design system showcase.
 *
 * Mount this at a dev-only route to review every primitive in both themes
 * and at every breakpoint. It is not part of the product surface.
 */

const SAMPLE_ROWS = [
  {
    _id: "1",
    login: "5102881",
    name: "A. Okafor",
    group: "real\\Standard",
    balance: 12480.5,
    equity: 12902.1,
    pnl: 421.6,
    status: "approved",
  },
  {
    _id: "2",
    login: "5102882",
    name: "M. Haddad",
    group: "real\\Raw",
    balance: 3200,
    equity: 3044.88,
    pnl: -155.12,
    status: "pending",
  },
  {
    _id: "3",
    login: "5102883",
    name: "J. Silveira",
    group: "real\\Standard",
    balance: 88010.22,
    equity: 90233.4,
    pnl: 2223.18,
    status: "approved",
  },
  {
    _id: "4",
    login: "5102884",
    name: "L. Nakamura",
    group: "demo\\Trial",
    balance: 500,
    equity: 500,
    pnl: 0,
    status: "rejected",
  },
];

const money = (n) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const Pnl = ({ value }) => (
  <span
    className={
      value > 0
        ? "font-semibold text-profit"
        : value < 0
        ? "font-semibold text-loss"
        : "text-muted"
    }
  >
    {value > 0 ? "+" : ""}
    {money(value)}
  </span>
);

const COLUMNS = [
  { key: "login", header: "Login", primary: true, numeric: true },
  { key: "name", header: "Client", secondary: true },
  { key: "group", header: "Group" },
  {
    key: "balance",
    header: "Balance",
    align: "right",
    numeric: true,
    cell: (r) => money(r.balance),
  },
  {
    key: "equity",
    header: "Equity",
    align: "right",
    numeric: true,
    cell: (r) => money(r.equity),
  },
  {
    key: "pnl",
    header: "P&L",
    align: "right",
    numeric: true,
    cell: (r) => <Pnl value={r.pnl} />,
  },
  {
    key: "status",
    header: "Status",
    cell: (r) => <StatusBadge status={r.status} />,
  },
];

const Section = ({ title, hint, children }) => (
  <section className="mt-8 first:mt-0">
    <div className="mb-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-subtle">
        {title}
      </h2>
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
    </div>
    {children}
  </section>
);

export default function Showcase() {
  const [tab, setTab] = useState("overview");
  const [range, setRange] = useState("30d");
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-dvh bg-canvas">
      {/* Sticky app bar: glass over the canvas, safe-area aware. */}
      <div className="glass sticky top-0 z-30 border-b border-line pad-safe-t">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <span className="text-gradient-brand font-bold tracking-tight">
            Ocean Bull UI
          </span>
          <div className="flex items-center gap-2">
            <ThemeModeSelect className="hidden sm:inline-flex" />
            <ThemeToggle className="sm:hidden" />
          </div>
        </div>
      </div>

      <div className="pad-safe-b mx-auto max-w-6xl px-4 py-6">
        <PageHeader
          breadcrumb="Design system / Components"
          title="Component library"
          description="Every primitive below is token-driven: it adapts to light and dark with no per-component overrides."
          actions={
            <>
              <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
                Filters
              </Button>
              <Button onClick={() => setModalOpen(true)}>New deposit</Button>
            </>
          }
        />

        <Section
          title="Metrics"
          hint="A snap-scrolling strip on phones, a 4-up grid on desktop."
        >
          <StatGrid scrollOnMobile>
            <StatCard
              label="Total deposits"
              value="$1.28M"
              delta="12.4%"
              trend="up"
              helper="vs. previous 30 days"
            />
            <StatCard
              label="Withdrawals"
              value="$412K"
              delta="3.1%"
              trend="down"
              helper="vs. previous 30 days"
            />
            <StatCard
              label="Active accounts"
              value="2,841"
              delta="86"
              trend="up"
            />
            <StatCard
              label="Pending KYC"
              value="37"
              delta="0"
              trend="flat"
              helper="Awaiting review"
            />
          </StatGrid>
        </Section>

        <Section title="Buttons">
          <Card>
            <CardBody className="flex flex-wrap gap-2">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="soft">Soft</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="success">Approve</Button>
              <Button variant="danger">Reject</Button>
              <Button variant="danger-soft">Danger soft</Button>
              <Button loading>Saving</Button>
              <Button disabled>Disabled</Button>
              <Button variant="link">Link style</Button>
            </CardBody>
            <CardFooter>
              <span className="text-sm text-muted">
                Sizes keep a 44px hit area on touch and tighten up from the
                small breakpoint.
              </span>
            </CardFooter>
          </Card>
        </Section>

        <Section title="Status">
          <Card>
            <CardBody className="flex flex-wrap gap-2">
              <StatusBadge status="approved" />
              <StatusBadge status="pending" />
              <StatusBadge status="rejected" />
              <StatusBadge status="processing" />
              <StatusBadge status="cancelled" />
              <Badge tone="primary">Primary</Badge>
              <Badge tone="info">Info</Badge>
              <Badge tone="profit">+2.4%</Badge>
              <Badge tone="loss">-1.1%</Badge>
            </CardBody>
          </Card>
        </Section>

        <Section title="Navigation">
          <Card>
            <Tabs
              value={tab}
              onChange={setTab}
              tabs={[
                { key: "overview", label: "Overview" },
                { key: "deposits", label: "Deposits", count: 12 },
                { key: "payouts", label: "Payouts", count: 3 },
                { key: "trades", label: "Trades", count: 248 },
                { key: "ledger", label: "Ledger" },
              ]}
            />
            <CardBody className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted">
                Active tab:{" "}
                <span className="font-semibold text-text">{tab}</span>
              </p>
              <SegmentedControl
                value={range}
                onChange={setRange}
                options={[
                  { value: "7d", label: "7D" },
                  { value: "30d", label: "30D" },
                  { value: "all", label: "All" },
                ]}
              />
            </CardBody>
          </Card>
        </Section>

        <Section
          title="Forms"
          hint="Fields are 16px on mobile, which stops iOS Safari zooming the viewport on focus."
        >
          <Card>
            <CardHeader
              title="Withdrawal request"
              subtitle="All fields are required."
            />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Account login"
                placeholder="5102881"
                required
                inputMode="numeric"
              />
              <Input
                label="Amount"
                placeholder="0.00"
                required
                inputMode="decimal"
                leftIcon={<span className="text-sm">$</span>}
              />
              <Field label="Method" htmlFor="method">
                <Select id="method" defaultValue="bank">
                  <option value="bank">Bank transfer</option>
                  <option value="crypto">USDT (TRC-20)</option>
                  <option value="card">Card refund</option>
                </Select>
              </Field>
              <Input
                label="Wallet address"
                placeholder="T..."
                error="This address failed checksum validation."
              />
              <Field
                label="Note to reviewer"
                className="sm:col-span-2"
                htmlFor="note"
              >
                <Textarea
                  id="note"
                  placeholder="Optional context for the approver"
                />
              </Field>
            </CardBody>
            <CardFooter className="sm:justify-end">
              <Button variant="ghost" fullWidth className="sm:w-auto">
                Cancel
              </Button>
              <Button fullWidth className="sm:w-auto">
                Submit request
              </Button>
            </CardFooter>
          </Card>
        </Section>

        <Section
          title="Data table"
          hint="One column definition renders a table on desktop and stacked cards below the large breakpoint, so phones never scroll sideways."
        >
          <div className="mb-3 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setLoading((v) => !v)}
            >
              {loading ? "Show data" : "Show loading state"}
            </Button>
          </div>

          <DataTable
            columns={COLUMNS}
            rows={loading ? [] : SAMPLE_ROWS}
            loading={loading}
            onRowClick={() => setModalOpen(true)}
            cardActions={(row) => <StatusBadge status={row.status} size="sm" />}
          />
        </Section>

        <Section title="Empty and loading states">
          <div className="grid gap-4 lg:grid-cols-2">
            <EmptyState
              title="No withdrawals yet"
              description="Approved withdrawal requests will be listed here."
              action={<Button variant="soft">Request withdrawal</Button>}
            />
            <Card>
              <CardBody className="space-y-3">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-24 w-full" />
              </CardBody>
            </Card>
          </div>
        </Section>

        <Section
          title="Overlays"
          hint="Modals become bottom sheets on phones so the primary action stays in thumb reach."
        >
          <Card>
            <CardBody className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setModalOpen(true)}>
                Open modal
              </Button>
              <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
                Open drawer
              </Button>
            </CardBody>
          </Card>
        </Section>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Approve deposit"
        description="This credits the trading account immediately."
        footer={
          <>
            <Button
              variant="ghost"
              fullWidth
              className="sm:w-auto"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              fullWidth
              className="sm:w-auto"
              onClick={() => setModalOpen(false)}
            >
              Approve $2,500
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-subtle">Client</dt>
              <dd className="font-medium text-text">A. Okafor</dd>
            </div>
            <div>
              <dt className="text-subtle">Login</dt>
              <dd className="numeric font-medium text-text">5102881</dd>
            </div>
            <div>
              <dt className="text-subtle">Method</dt>
              <dd className="font-medium text-text">USDT (TRC-20)</dd>
            </div>
            <div>
              <dt className="text-subtle">Amount</dt>
              <dd className="numeric font-medium text-text">$2,500.00</dd>
            </div>
          </dl>
          <Textarea placeholder="Internal note (optional)" rows={3} />
        </div>
      </Modal>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Filters"
      >
        <div className="space-y-4">
          <Field label="Status" htmlFor="f-status">
            <Select id="f-status">
              <option>All</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </Select>
          </Field>
          <Input label="From" type="date" />
          <Input label="To" type="date" />
          <Button fullWidth onClick={() => setDrawerOpen(false)}>
            Apply filters
          </Button>
        </div>
      </Drawer>
    </div>
  );
}
