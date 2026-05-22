import { useState } from 'react';
import { Settings2, Save, BarChart3, PieChart, Table2, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/FormField';
import { SelectField } from '@/components/forms/SelectField';
import { EmptyState } from '@/components/shared/EmptyState';
import { STORAGE_KEYS, readStorage, writeStorage } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface SavedReport {
  id: string;
  name: string;
  source: string;
  groupBy: string;
  metric: string;
  viz: string;
}

const FIELDS = ['Customer', 'Lead', 'Proposal', 'Invoice', 'Dispatch', 'Item'];
const GROUP_OPTIONS = [
  { value: 'state', label: 'State' },
  { value: 'month', label: 'Month' },
  { value: 'status', label: 'Status' },
  { value: 'owner', label: 'Owner' },
  { value: 'category', label: 'Category' },
];

export default function ReportBuilder() {
  const [name, setName] = useState('');
  const [source, setSource] = useState('Invoice');
  const [groupBy, setGroupBy] = useState('state');
  const [metric, setMetric] = useState('sum');
  const [viz, setViz] = useState('bar');
  const [saved, setSaved] = useState<SavedReport[]>(() =>
    readStorage(STORAGE_KEYS.reportConfigs, []),
  );

  const save = () => {
    if (!name.trim()) {
      toast.error('Give your report a name.');
      return;
    }
    const report: SavedReport = {
      id: `rpt_${Date.now()}`,
      name,
      source,
      groupBy,
      metric,
      viz,
    };
    const next = [report, ...saved];
    setSaved(next);
    writeStorage(STORAGE_KEYS.reportConfigs, next);
    setName('');
    toast.success('Report configuration saved');
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Custom Report Builder"
        description="Compose your own reports — pick fields, group-by and a chart"
        icon={<Settings2 />}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Configure Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Report Name">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. State-wise Q1 Revenue"
              />
            </FormField>

            <div>
              <span className="label-base">Data Source</span>
              <div className="flex flex-wrap gap-1.5">
                {FIELDS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setSource(f)}
                    className={cn(
                      'rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                      source === f
                        ? 'border-brand-secondary bg-brand-secondary/10 text-brand-secondary'
                        : 'border-line text-content-muted hover:bg-muted',
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Group By">
                <SelectField
                  value={groupBy}
                  onChange={setGroupBy}
                  options={GROUP_OPTIONS}
                />
              </FormField>
              <FormField label="Metric">
                <SelectField
                  value={metric}
                  onChange={setMetric}
                  options={[
                    { value: 'sum', label: 'Sum of Value' },
                    { value: 'count', label: 'Record Count' },
                    { value: 'avg', label: 'Average Value' },
                  ]}
                />
              </FormField>
            </div>

            <div>
              <span className="label-base">Visualisation</span>
              <div className="flex gap-2">
                {[
                  { key: 'bar', icon: BarChart3, label: 'Bar' },
                  { key: 'pie', icon: PieChart, label: 'Donut' },
                  { key: 'table', icon: Table2, label: 'Table' },
                ].map((v) => {
                  const Icon = v.icon;
                  return (
                    <button
                      key={v.key}
                      onClick={() => setViz(v.key)}
                      className={cn(
                        'flex flex-1 flex-col items-center gap-1 rounded-md border py-3 text-xs font-medium transition-colors',
                        viz === v.key
                          ? 'border-brand-secondary bg-brand-secondary/10 text-brand-secondary'
                          : 'border-line text-content-muted hover:bg-muted',
                      )}
                    >
                      <Icon className="size-5" />
                      {v.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => toast.success('Report generated (demo preview)')}
              >
                <Play className="size-4" /> Run Report
              </Button>
              <Button onClick={save}>
                <Save className="size-4" /> Save Configuration
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saved Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {saved.length === 0 ? (
              <EmptyState
                compact
                icon={Settings2}
                title="No saved reports"
                description="Configure and save a report to reuse it later."
              />
            ) : (
              <div className="space-y-2">
                {saved.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-md border border-line p-2.5"
                  >
                    <div className="text-sm font-medium text-content">
                      {r.name}
                    </div>
                    <div className="text-xs text-content-muted">
                      {r.source} · grouped by {r.groupBy} · {r.viz}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
