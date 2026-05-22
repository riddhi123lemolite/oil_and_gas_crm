import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileSpreadsheet, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SelectField } from '@/components/forms/SelectField';
import { parseExcelFile, type ParsedSheet } from '@/lib/excel';
import { useDataStore } from '@/stores/dataStore';
import { useAuthStore } from '@/stores/authStore';
import { generateId } from '@/lib/utils';
import type { Lead } from '@/types';

const TARGET_FIELDS = [
  { key: 'name', label: 'Contact Name', required: true },
  { key: 'companyName', label: 'Company Name', required: false },
  { key: 'phone', label: 'Mobile Number', required: true },
  { key: 'email', label: 'Email', required: false },
  { key: 'city', label: 'City', required: false },
  { key: 'state', label: 'State', required: false },
];

export default function LeadImport() {
  const navigate = useNavigate();
  const leads = useDataStore((s) => s.leads);
  const addLead = useDataStore((s) => s.add);
  const currentUser = useAuthStore((s) => s.currentUser);

  const [sheet, setSheet] = useState<ParsedSheet | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [done, setDone] = useState(0);

  const handleFile = async (file: File) => {
    const parsed = await parseExcelFile(file);
    if (parsed.headers.length === 0) {
      toast.error('Could not read that file. Try a .xlsx or .csv file.');
      return;
    }
    setSheet(parsed);
    // Auto-map columns by fuzzy header match.
    const auto: Record<string, string> = {};
    for (const field of TARGET_FIELDS) {
      const match = parsed.headers.find((h) =>
        h.toLowerCase().replace(/\s/g, '').includes(
          field.key.toLowerCase().replace('name', ''),
        ),
      );
      if (match) auto[field.key] = match;
    }
    setMapping(auto);
  };

  const commit = () => {
    if (!sheet) return;
    const now = new Date().toISOString();
    let count = 0;
    sheet.rows.forEach((row, i) => {
      const name = mapping.name ? row[mapping.name] : '';
      const phone = mapping.phone ? row[mapping.phone] : '';
      if (!name || !phone) return;
      const seq = String(leads.length + count + 1).padStart(5, '0');
      const lead: Lead = {
        id: generateId('lead'),
        code: `LD-2026-${seq}`,
        name,
        companyName: mapping.companyName ? row[mapping.companyName] : undefined,
        phone,
        email: mapping.email ? row[mapping.email] : undefined,
        city: (mapping.city && row[mapping.city]) || 'Surat',
        state: (mapping.state && row[mapping.state]) || 'Gujarat',
        source: 'OTHER',
        status: 'NEW',
        temperature: 'WARM',
        productInterest: [],
        assignedToId: currentUser?.id ?? 'user_03',
        createdById: currentUser?.id ?? 'user_03',
        lastActivityAt: now,
        createdAt: now,
        updatedAt: now,
      };
      addLead('leads', lead);
      count += 1;
      void i;
    });
    setDone(count);
    toast.success(`${count} leads imported`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        title="Import Leads"
        description="Bulk-import leads from an Excel or CSV file"
        icon={<Upload />}
      />

      {done > 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <CheckCircle2 className="size-12 text-success" strokeWidth={1.5} />
            <h3 className="mt-3 font-display text-lg font-semibold text-content">
              {done} leads imported successfully
            </h3>
            <p className="mt-1 text-sm text-content-muted">
              The new leads are now in your pipeline.
            </p>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => setDone(0)}>
                Import More
              </Button>
              <Button onClick={() => navigate('/leads')}>View Leads</Button>
            </div>
          </CardContent>
        </Card>
      ) : !sheet ? (
        <Card>
          <CardContent>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-line py-14 transition-colors hover:border-brand-secondary/50">
              <FileSpreadsheet
                className="size-10 text-content-muted"
                strokeWidth={1.5}
              />
              <div className="text-center">
                <p className="text-sm font-medium text-content">
                  Click to upload a spreadsheet
                </p>
                <p className="text-xs text-content-muted">
                  Supports .xlsx, .xls and .csv files
                </p>
              </div>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
                }}
              />
            </label>
            <p className="mt-3 text-center text-xs text-content-muted">
              Your file is read entirely in the browser — nothing is uploaded
              to a server.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Map Columns</CardTitle>
              <span className="text-xs text-content-muted">
                {sheet.rows.length} rows detected
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              {TARGET_FIELDS.map((field) => (
                <div key={field.key} className="flex items-center gap-3">
                  <div className="w-40 text-sm">
                    <span className="font-medium text-content">
                      {field.label}
                    </span>
                    {field.required && (
                      <span className="ml-0.5 text-danger">*</span>
                    )}
                  </div>
                  <ArrowRight className="size-4 text-content-muted" />
                  <div className="flex-1">
                    <SelectField
                      value={mapping[field.key] ?? ''}
                      onChange={(v) =>
                        setMapping((m) => ({ ...m, [field.key]: v }))
                      }
                      placeholder="— Not mapped —"
                      options={sheet.headers.map((h) => ({
                        value: h,
                        label: h,
                      }))}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase text-content-muted">
                    {TARGET_FIELDS.map((f) => (
                      <th key={f.key} className="px-2 py-1.5">
                        {f.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sheet.rows.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-b border-line last:border-0">
                      {TARGET_FIELDS.map((f) => (
                        <td key={f.key} className="px-2 py-1.5 text-content-secondary">
                          {(mapping[f.key] && row[mapping[f.key] ?? '']) || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSheet(null)}>
              Choose Different File
            </Button>
            <Button
              onClick={commit}
              disabled={!mapping.name || !mapping.phone}
            >
              Import {sheet.rows.length} Leads
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
