import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  SegmentTabs,
  SegmentList,
  SegmentTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { useDataStore } from '@/stores/dataStore';
import {
  PERM_MODULES,
  PERM_ACTIONS,
  type PermAction,
} from '@/lib/permissions';
import { ROLE_LABELS } from '@/lib/constants';
import type { Role } from '@/types';

export default function RolesPermissions() {
  const permissions = useDataStore((s) => s.permissions);
  const setPermissions = useDataStore((s) => s.setPermissions);

  const [draft, setDraft] = useState(() =>
    structuredClone(permissions),
  );
  const [activeRole, setActiveRole] = useState<Role>('SALES_MANAGER');

  const toggle = (
    role: Role,
    moduleKey: string,
    action: PermAction,
  ) => {
    setDraft((prev) => {
      const next = structuredClone(prev);
      const list = next[role][moduleKey as keyof (typeof next)[Role]];
      const has = list.includes(action);
      next[role][moduleKey as keyof (typeof next)[Role]] = has
        ? list.filter((a) => a !== action)
        : [...list, action];
      return next;
    });
  };

  const save = () => {
    setPermissions(draft);
    toast.success('Permissions updated');
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Roles & Permissions"
        description="Control what each role can see and do"
        icon={<ShieldCheck />}
      />

      <SegmentTabs
        value={activeRole}
        onValueChange={(v) => setActiveRole(v as Role)}
      >
        <SegmentList>
          {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
            <SegmentTrigger key={r} value={r}>
              {ROLE_LABELS[r]}
            </SegmentTrigger>
          ))}
        </SegmentList>

        {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
          <TabsContent key={role} value={role} className="mt-4">
            <Card>
              <CardContent className="overflow-x-auto p-0">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr className="text-left text-[11px] uppercase text-content-muted">
                      <th className="px-4 py-2.5">Module</th>
                      {PERM_ACTIONS.map((a) => (
                        <th key={a} className="px-3 py-2.5 text-center capitalize">
                          {a}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PERM_MODULES.map((mod) => (
                      <tr
                        key={mod.key}
                        className="border-b border-line last:border-0"
                      >
                        <td className="px-4 py-2.5 font-medium text-content">
                          {mod.label}
                        </td>
                        {PERM_ACTIONS.map((action) => {
                          const checked = draft[role][mod.key].includes(action);
                          return (
                            <td key={action} className="px-3 py-2.5 text-center">
                              <div className="flex justify-center">
                                <Checkbox
                                  checked={checked}
                                  disabled={role === 'ADMIN'}
                                  onCheckedChange={() =>
                                    toggle(role, mod.key, action)
                                  }
                                />
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
              <CardFooter className="justify-between">
                <span className="text-xs text-content-muted">
                  {role === 'ADMIN'
                    ? 'Admin always has full access.'
                    : 'Changes apply to the sidebar and page actions for this role.'}
                </span>
                <Button onClick={save}>Save Permissions</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        ))}
      </SegmentTabs>
    </div>
  );
}
