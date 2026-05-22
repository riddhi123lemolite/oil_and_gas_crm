import { useMemo } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Target,
  Building2,
  FileText,
  Package,
  CornerDownLeft,
} from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import { useDataStore } from '@/stores/dataStore';
import { ALL_NAV_ITEMS } from '@/lib/nav';
import { formatINRCompact } from '@/lib/format';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

const GROUP_HEADING =
  '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-content-muted';

export function CommandPalette() {
  const navigate = useNavigate();
  const { commandOpen, setCommandOpen } = useUiStore();
  const { leads, customers, proposals, items } = useDataStore();

  const go = (path: string) => {
    setCommandOpen(false);
    navigate(path);
  };

  const records = useMemo(
    () => ({
      leads: leads.slice(0, 60),
      customers: customers.slice(0, 60),
      proposals: proposals.slice(0, 50),
      items: items.slice(0, 50),
    }),
    [leads, customers, proposals, items],
  );

  return (
    <Dialog open={commandOpen} onOpenChange={setCommandOpen}>
      <DialogContent
        hideClose
        className="top-[12vh] max-w-xl translate-y-0 p-0"
      >
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <Command label="Command palette" className="flex flex-col">
          <div className="flex items-center gap-2.5 border-b border-line px-4">
            <Search className="size-4 text-content-muted" />
            <Command.Input
              placeholder="Search leads, customers, proposals, items, pages…"
              className="h-12 flex-1 bg-transparent text-base text-content outline-none placeholder:text-content-muted"
            />
            <kbd className="rounded border border-line bg-base px-1.5 py-0.5 font-mono text-[10px] text-content-muted">
              ESC
            </kbd>
          </div>
          <Command.List className="max-h-[60vh] overflow-y-auto p-2">
            <Command.Empty className="py-10 text-center text-sm text-content-muted">
              No results found.
            </Command.Empty>

            <Command.Group heading="Pages" className={GROUP_HEADING}>
              {ALL_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Command.Item
                    key={item.path}
                    value={`page ${item.label}`}
                    onSelect={() => go(item.path)}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm text-content-secondary data-[selected=true]:bg-muted data-[selected=true]:text-content"
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Command.Item>
                );
              })}
            </Command.Group>

            <PaletteGroup
              heading="Leads"
              icon={Target}
              rows={records.leads.map((l) => ({
                id: l.id,
                value: `lead ${l.name} ${l.companyName ?? ''} ${l.code}`,
                primary: l.companyName ?? l.name,
                secondary: l.code,
                path: `/leads/${l.id}`,
              }))}
              go={go}
            />
            <PaletteGroup
              heading="Customers"
              icon={Building2}
              rows={records.customers.map((c) => ({
                id: c.id,
                value: `customer ${c.companyName} ${c.code}`,
                primary: c.companyName,
                secondary: c.code,
                path: `/customers/${c.id}`,
              }))}
              go={go}
            />
            <PaletteGroup
              heading="Proposals"
              icon={FileText}
              rows={records.proposals.map((p) => ({
                id: p.id,
                value: `proposal ${p.number} ${p.subject}`,
                primary: p.number,
                secondary: formatINRCompact(p.total),
                path: `/proposals/${p.id}`,
              }))}
              go={go}
            />
            <PaletteGroup
              heading="Items"
              icon={Package}
              rows={records.items.map((it) => ({
                id: it.id,
                value: `item ${it.name} ${it.code}`,
                primary: it.name,
                secondary: it.code,
                path: `/items/${it.id}`,
              }))}
              go={go}
            />
          </Command.List>
          <div className="flex items-center gap-3 border-t border-line px-4 py-2 text-[10px] text-content-muted">
            <span className="flex items-center gap-1">
              <CornerDownLeft className="size-3" /> to open
            </span>
            <span>↑↓ to navigate</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

interface PaletteRow {
  id: string;
  value: string;
  primary: string;
  secondary: string;
  path: string;
}

function PaletteGroup({
  heading,
  icon: Icon,
  rows,
  go,
}: {
  heading: string;
  icon: typeof Target;
  rows: PaletteRow[];
  go: (path: string) => void;
}) {
  return (
    <Command.Group heading={heading} className={GROUP_HEADING}>
      {rows.map((row) => (
        <Command.Item
          key={row.id}
          value={row.value}
          onSelect={() => go(row.path)}
          className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-sm text-content-secondary data-[selected=true]:bg-muted data-[selected=true]:text-content"
        >
          <Icon className="size-4 shrink-0 text-content-muted" />
          <span className="truncate">{row.primary}</span>
          <span className="num ml-auto shrink-0 text-xs text-content-muted">
            {row.secondary}
          </span>
        </Command.Item>
      ))}
    </Command.Group>
  );
}
