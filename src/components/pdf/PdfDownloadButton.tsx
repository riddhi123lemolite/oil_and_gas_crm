import { useState } from 'react';
import { FileDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { downloadBlob } from '@/lib/utils';
import type { BusinessDocData } from './BusinessDocPdf';

interface PdfDownloadButtonProps {
  data: BusinessDocData;
  filename: string;
  label?: string;
  variant?: 'primary' | 'outline' | 'secondary';
}

/** Generates a PDF on click — the heavy renderer is loaded lazily. */
export function PdfDownloadButton({
  data,
  filename,
  label = 'Download PDF',
  variant = 'outline',
}: PdfDownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try {
      const { renderBusinessDoc } = await import('./renderPdf');
      const blob = await renderBusinessDoc(data);
      downloadBlob(blob, filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
      toast.success('PDF downloaded');
    } catch {
      toast.error('Could not generate the PDF.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant={variant} onClick={handle} loading={loading}>
      {!loading && <FileDown className="size-4" />}
      {label}
    </Button>
  );
}
