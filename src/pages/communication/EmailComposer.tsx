import { useState, type ReactNode } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Mail,
  Bold,
  Italic,
  List,
  ListOrdered,
  Send,
  Inbox,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/FormField';
import { SelectField } from '@/components/forms/SelectField';
import { useDataStore } from '@/stores/dataStore';
import { formatDateTime } from '@/lib/format';
import { generateId } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { EmailRecord } from '@/types';

const TEMPLATES: Record<string, { subject: string; body: string }> = {
  quotation: {
    subject: 'Quotation for petroleum products — {{customer_name}}',
    body: '<p>Dear {{customer_name}},</p><p>Thank you for your enquiry. Please find our best quotation for the requested products. The proposal amount is {{proposal_amount}}.</p><p>Rates are valid for 30 days and inclusive of applicable GST.</p><p>Regards,<br/>OilGas CRM Sales Team</p>',
  },
  reminder: {
    subject: 'Payment reminder — {{customer_name}}',
    body: '<p>Dear {{customer_name}},</p><p>This is a gentle reminder that your invoice is now due. We request you to arrange the payment at the earliest.</p><p>Regards,<br/>Accounts Team</p>',
  },
  thankyou: {
    subject: 'Thank you for your order',
    body: '<p>Dear {{customer_name}},</p><p>Thank you for placing your order with us. Our dispatch team will coordinate the tanker schedule and keep you updated.</p><p>Regards,<br/>OilGas CRM</p>',
  },
};

function ToolbarButton({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex size-7 items-center justify-center rounded transition-colors',
        active
          ? 'bg-brand-primary text-white'
          : 'text-content-muted hover:bg-muted',
      )}
    >
      {children}
    </button>
  );
}

export default function EmailComposer() {
  const emails = useDataStore((s) => s.emails);
  const addEmail = useDataStore((s) => s.add);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');

  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Compose your message…</p>',
    editorProps: {
      attributes: {
        class:
          'prose-sm min-h-[180px] max-w-none rounded-md border border-line bg-surface p-3 text-sm text-content focus:outline-none',
      },
    },
  });

  const applyTemplate = (key: string) => {
    const tpl = TEMPLATES[key];
    if (!tpl || !editor) return;
    setSubject(tpl.subject);
    editor.commands.setContent(tpl.body);
  };

  const send = () => {
    if (!to.trim()) {
      toast.error('Add a recipient first.');
      return;
    }
    const email: EmailRecord = {
      id: generateId('email'),
      to,
      subject: subject || '(no subject)',
      body: editor?.getText() ?? '',
      sentAt: new Date().toISOString(),
      folder: 'SENT',
    };
    addEmail('emails', email);
    setTo('');
    setSubject('');
    editor?.commands.setContent('<p></p>');
    toast.success('Email sent (demo — saved to Sent folder)');
  };

  const sent = emails.filter((e) => e.folder === 'SENT');

  return (
    <div className="space-y-5">
      <PageHeader
        title="Email"
        description="Compose emails with reusable templates"
        icon={<Mail />}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Compose</CardTitle>
            <div className="w-44">
              <SelectField
                value=""
                onChange={applyTemplate}
                placeholder="Use a template"
                options={[
                  { value: 'quotation', label: 'Quotation' },
                  { value: 'reminder', label: 'Payment Reminder' },
                  { value: 'thankyou', label: 'Thank You' },
                ]}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <FormField label="To">
              <Input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="customer@company.in"
              />
            </FormField>
            <FormField label="Subject">
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
              />
            </FormField>
            <FormField label="Message">
              <div>
                {editor && (
                  <div className="mb-1.5 flex gap-0.5 rounded-md border border-line bg-muted p-1">
                    <ToolbarButton
                      active={editor.isActive('bold')}
                      onClick={() => editor.chain().focus().toggleBold().run()}
                    >
                      <Bold className="size-3.5" />
                    </ToolbarButton>
                    <ToolbarButton
                      active={editor.isActive('italic')}
                      onClick={() => editor.chain().focus().toggleItalic().run()}
                    >
                      <Italic className="size-3.5" />
                    </ToolbarButton>
                    <ToolbarButton
                      active={editor.isActive('bulletList')}
                      onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                      }
                    >
                      <List className="size-3.5" />
                    </ToolbarButton>
                    <ToolbarButton
                      active={editor.isActive('orderedList')}
                      onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                      }
                    >
                      <ListOrdered className="size-3.5" />
                    </ToolbarButton>
                  </div>
                )}
                <EditorContent editor={editor} />
              </div>
            </FormField>
            <p className="text-xs text-content-muted">
              Template variables like{' '}
              <code className="num">{'{{customer_name}}'}</code> are replaced
              when sending to a real customer.
            </p>
            <Button onClick={send}>
              <Send className="size-4" /> Send Email
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Inbox className="size-4" /> Sent ({sent.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[480px] space-y-2 overflow-y-auto">
            {sent
              .slice()
              .reverse()
              .map((e) => (
                <div
                  key={e.id}
                  className="rounded-md border border-line p-2.5"
                >
                  <div className="truncate text-sm font-medium text-content">
                    {e.subject}
                  </div>
                  <div className="num truncate text-xs text-content-muted">
                    To: {e.to}
                  </div>
                  <div className="mt-0.5 text-[10px] text-content-muted">
                    {formatDateTime(e.sentAt)}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
