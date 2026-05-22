import * as React from 'react';
import { useState, useRef } from 'react';
import { IndianRupee, Upload, FileText, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/format';

/** Rupee amount input with an inline ₹ glyph and Indian grouping on blur. */
export function CurrencyInput({
  value,
  onChange,
  placeholder,
  className,
  id,
}: {
  value: number | string | undefined;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}) {
  const [focused, setFocused] = useState(false);
  const numeric = Number(value) || 0;
  const display = focused
    ? value === undefined || value === ''
      ? ''
      : String(value)
    : numeric
      ? formatNumber(numeric, 0)
      : '';

  return (
    <div className="relative">
      <IndianRupee className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-content-muted" />
      <Input
        id={id}
        inputMode="numeric"
        value={display}
        placeholder={placeholder ?? '0'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9.]/g, '');
          onChange(raw === '' ? 0 : Number(raw));
        }}
        className={cn('num pl-7 text-right', className)}
      />
    </div>
  );
}

/** GSTIN input — uppercases and caps at 15 characters. */
export const GstinInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, onChange, ...props }, ref) => (
  <Input
    ref={ref}
    maxLength={15}
    placeholder="24AABCS1234L1Z5"
    className={cn('num uppercase tracking-wide', className)}
    onChange={(e) => {
      e.target.value = e.target.value.toUpperCase();
      onChange?.(e);
    }}
    {...props}
  />
));
GstinInput.displayName = 'GstinInput';

/** PAN input — uppercases and caps at 10 characters. */
export const PanInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, onChange, ...props }, ref) => (
  <Input
    ref={ref}
    maxLength={10}
    placeholder="AABCS1234L"
    className={cn('num uppercase tracking-wide', className)}
    onChange={(e) => {
      e.target.value = e.target.value.toUpperCase();
      onChange?.(e);
    }}
    {...props}
  />
));
PanInput.displayName = 'PanInput';

/** Indian mobile input with a fixed +91 prefix. */
export const PhoneInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <div className="flex">
    <span className="flex h-9 items-center rounded-l-md border border-r-0 border-line bg-muted px-2.5 text-sm text-content-muted">
      +91
    </span>
    <Input
      ref={ref}
      inputMode="tel"
      maxLength={14}
      placeholder="98250 12345"
      className={cn('num rounded-l-none', className)}
      {...props}
    />
  </div>
));
PhoneInput.displayName = 'PhoneInput';

export interface UploadedFile {
  name: string;
  sizeKb: number;
  dataUrl: string;
}

/** Drag-and-drop file upload — stores files as base64 in memory. */
export function FileUpload({
  onFiles,
  accept,
  multiple = true,
  hint = 'Drag & drop files here, or click to browse',
}: {
  onFiles: (files: UploadedFile[]) => void;
  accept?: string;
  multiple?: boolean;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const handleFiles = async (list: FileList | null) => {
    if (!list) return;
    const parsed: UploadedFile[] = [];
    for (const file of Array.from(list)) {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.readAsDataURL(file);
      });
      parsed.push({
        name: file.name,
        sizeKb: Math.round(file.size / 1024),
        dataUrl,
      });
    }
    const next = multiple ? [...files, ...parsed] : parsed;
    setFiles(next);
    onFiles(next);
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-7 text-center transition-colors',
          dragging
            ? 'border-brand-secondary bg-brand-secondary/5'
            : 'border-line hover:border-brand-secondary/50',
        )}
      >
        <Upload className="size-6 text-content-muted" strokeWidth={1.5} />
        <p className="text-sm text-content-secondary">{hint}</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>
      {files.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-md border border-line bg-base px-2.5 py-1.5 text-sm"
            >
              <FileText className="size-4 text-content-muted" />
              <span className="truncate text-content-secondary">
                {f.name}
              </span>
              <span className="num ml-auto text-xs text-content-muted">
                {f.sizeKb} KB
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const next = files.filter((_, idx) => idx !== i);
                  setFiles(next);
                  onFiles(next);
                }}
                className="text-content-muted hover:text-danger"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
