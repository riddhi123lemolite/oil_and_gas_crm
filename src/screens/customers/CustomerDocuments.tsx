import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FolderOpen, FileText, Download, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { FileUpload, type UploadedFile } from '@/components/forms/inputs';
import { useDataStore } from '@/stores/dataStore';
import { useAuthStore } from '@/stores/authStore';
import { formatDateLong } from '@/lib/format';
import { generateId } from '@/lib/utils';
import type { CrmDocument } from '@/types';

const CATEGORIES = ['PO', 'AGREEMENT', 'KYC', 'INVOICE', 'OTHER'] as const;

export default function CustomerDocuments() {
  const { id } = useParams();
  const navigate = useNavigate();
  const customers = useDataStore((s) => s.customers);
  const documents = useDataStore((s) => s.documents);
  const addDoc = useDataStore((s) => s.add);
  const removeDoc = useDataStore((s) => s.remove);
  const currentUser = useAuthStore((s) => s.currentUser);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('KYC');

  const customer = customers.find((c) => c.id === id);
  if (!customer) {
    return (
      <EmptyState
        title="Customer not found"
        actionLabel="Back"
        onAction={() => navigate('/customers')}
      />
    );
  }

  const docs = documents.filter(
    (d) => d.entityType === 'customer' && d.entityId === customer.id,
  );

  const handleUpload = (files: UploadedFile[]) => {
    const latest = files[files.length - 1];
    if (!latest) return;
    const doc: CrmDocument = {
      id: generateId('doc'),
      name: latest.name,
      category,
      entityType: 'customer',
      entityId: customer.id,
      sizeKb: latest.sizeKb,
      dataUrl: latest.dataUrl,
      uploadedById: currentUser?.id ?? 'user_01',
      uploadedAt: new Date().toISOString(),
    };
    addDoc('documents', doc);
    toast.success('Document uploaded');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        title="Customer Documents"
        description={customer.companyName}
        icon={<FolderOpen />}
      />

      <Card>
        <CardHeader>
          <CardTitle>Upload Document</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                  category === c
                    ? 'border-brand-secondary bg-brand-secondary/10 text-brand-secondary'
                    : 'border-line text-content-muted hover:bg-muted'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <FileUpload onFiles={handleUpload} multiple={false} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Documents ({docs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {docs.length === 0 ? (
            <EmptyState
              compact
              icon={FileText}
              title="No documents yet"
              description="Upload POs, agreements and KYC files above."
            />
          ) : (
            <div className="space-y-2">
              {docs.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-3 rounded-md border border-line p-2.5"
                >
                  <div className="flex size-9 items-center justify-center rounded-md bg-muted">
                    <FileText className="size-4 text-content-muted" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-content">
                      {d.name}
                    </div>
                    <div className="text-xs text-content-muted">
                      {d.sizeKb} KB · {formatDateLong(d.uploadedAt)}
                    </div>
                  </div>
                  <Badge tone="outline">{d.category}</Badge>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => toast.success('Download started (demo)')}
                  >
                    <Download />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      removeDoc('documents', d.id);
                      toast.success('Document removed');
                    }}
                  >
                    <Trash2 className="text-danger" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
