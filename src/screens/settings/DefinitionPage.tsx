import { useState } from 'react';
import { ListChecks, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useDataStore } from '@/stores/dataStore';
import { generateId } from '@/lib/utils';
import type { Definitions, DefinitionItem } from '@/types';

type DefKey = keyof Definitions;

const SECTIONS: { key: DefKey; title: string; desc: string }[] = [
  { key: 'leadStatuses', title: 'Lead Status Types', desc: 'Hot, Warm, Cold, Follow-up…' },
  { key: 'lostReasons', title: 'Lost Reasons', desc: 'Why deals are marked lost' },
  { key: 'industries', title: 'Industries', desc: 'Customer industry categories' },
  { key: 'leadSources', title: 'Lead Sources', desc: 'Where leads come from' },
];

export default function DefinitionPage() {
  const definitions = useDataStore((s) => s.definitions);
  const setDefinitions = useDataStore((s) => s.setDefinitions);
  const [draft, setDraft] = useState<Definitions>(() =>
    structuredClone(definitions),
  );
  const [newValues, setNewValues] = useState<Record<string, string>>({});

  const update = (key: DefKey, items: DefinitionItem[]) =>
    setDraft((d) => ({ ...d, [key]: items }));

  const addItem = (key: DefKey) => {
    const label = (newValues[key] ?? '').trim();
    if (!label) return;
    update(key, [
      ...draft[key],
      { id: generateId('def'), label, active: true },
    ]);
    setNewValues((v) => ({ ...v, [key]: '' }));
  };

  const save = () => {
    setDefinitions(draft);
    toast.success('Definitions saved');
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Definitions"
        description="Customise the dropdown values used across the CRM"
        icon={<ListChecks />}
        actions={<Button onClick={save}>Save All</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {SECTIONS.map((section) => (
          <Card key={section.key}>
            <CardHeader>
              <div>
                <CardTitle>{section.title}</CardTitle>
                <p className="text-xs text-content-muted">{section.desc}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {draft[section.key].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-md border border-line p-2"
                >
                  <span className="flex-1 text-sm text-content">
                    {item.label}
                  </span>
                  <Switch
                    checked={item.active}
                    onCheckedChange={(v) =>
                      update(
                        section.key,
                        draft[section.key].map((i) =>
                          i.id === item.id ? { ...i, active: v } : i,
                        ),
                      )
                    }
                  />
                  <button
                    onClick={() =>
                      update(
                        section.key,
                        draft[section.key].filter((i) => i.id !== item.id),
                      )
                    }
                    className="text-content-muted hover:text-danger"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newValues[section.key] ?? ''}
                  onChange={(e) =>
                    setNewValues((v) => ({
                      ...v,
                      [section.key]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => e.key === 'Enter' && addItem(section.key)}
                  placeholder={`Add new ${section.title.toLowerCase()}…`}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => addItem(section.key)}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
