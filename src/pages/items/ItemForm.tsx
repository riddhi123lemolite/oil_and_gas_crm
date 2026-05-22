import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { FormField, FormGrid, FormSection } from '@/components/forms/FormField';
import { SelectField, optionsFromStrings } from '@/components/forms/SelectField';
import { CurrencyInput } from '@/components/forms/inputs';
import { useDataStore } from '@/stores/dataStore';
import { itemFormSchema, type ItemFormValues } from '@/lib/validation';
import { ITEM_CATEGORY, UNITS, GST_RATES } from '@/lib/constants';
import { generateId } from '@/lib/utils';
import type { Item, ItemCategory, Unit } from '@/types';

export default function ItemForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const items = useDataStore((s) => s.items);
  const addItem = useDataStore((s) => s.add);
  const updateItem = useDataStore((s) => s.update);
  const existing = items.find((i) => i.id === id);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: existing
      ? {
          name: existing.name,
          description: existing.description ?? '',
          hsnCode: existing.hsnCode,
          category: existing.category,
          group: existing.group ?? '',
          unit: existing.unit,
          rate: existing.rate,
          costRate: existing.costRate ?? 0,
          gstPercent: existing.gstPercent,
          specifications: existing.specifications ?? '',
          stockTotal: existing.stockTotal,
          warehouse: existing.warehouse,
        }
      : {
          name: '',
          hsnCode: '',
          category: 'OIL_FUEL',
          unit: 'KL',
          rate: 0,
          costRate: 0,
          gstPercent: 18,
          stockTotal: 0,
          warehouse: 'Hazira Terminal, Surat',
        },
  });

  const onSubmit = (v: ItemFormValues) => {
    if (isEdit && existing) {
      updateItem('items', existing.id, {
        ...v,
        category: v.category as ItemCategory,
        unit: v.unit as Unit,
        description: v.description || undefined,
        group: v.group || undefined,
        specifications: v.specifications || undefined,
      });
      toast.success('Item updated');
      navigate(`/items/${existing.id}`);
    } else {
      const seq = String(items.length + 1).padStart(5, '0');
      const item: Item = {
        id: generateId('itm'),
        code: `ITM-${seq}`,
        name: v.name,
        description: v.description || undefined,
        hsnCode: v.hsnCode,
        category: v.category as ItemCategory,
        group: v.group || undefined,
        unit: v.unit as Unit,
        rate: v.rate,
        costRate: v.costRate,
        gstPercent: v.gstPercent,
        specifications: v.specifications || undefined,
        stockTotal: v.stockTotal,
        warehouse: v.warehouse,
        priceHistory: [
          { date: new Date().toISOString(), rate: v.rate },
        ],
        active: true,
        createdAt: new Date().toISOString(),
      };
      addItem('items', item);
      toast.success('Item created');
      navigate(`/items/${item.id}`);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        title={isEdit ? 'Edit Item' : 'Add New Item'}
        description={isEdit ? `Updating ${existing?.code}` : 'Add a product to your catalogue'}
        icon={<Package />}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="space-y-6">
            <FormSection title="Product Details">
              <FormGrid>
                <FormField label="Item Name" required error={errors.name?.message}>
                  <Input {...register('name')} placeholder="e.g. HSD BS-VI" />
                </FormField>
                <FormField label="HSN Code" required error={errors.hsnCode?.message}>
                  <Input {...register('hsnCode')} placeholder="27101931" className="num" />
                </FormField>
                <FormField label="Category" required>
                  <Controller
                    control={control}
                    name="category"
                    render={({ field }) => (
                      <SelectField
                        value={field.value}
                        onChange={field.onChange}
                        options={(Object.keys(ITEM_CATEGORY) as ItemCategory[]).map(
                          (c) => ({ value: c, label: ITEM_CATEGORY[c].label }),
                        )}
                      />
                    )}
                  />
                </FormField>
                <FormField label="Group">
                  <Input {...register('group')} placeholder="e.g. Diesel" />
                </FormField>
                <FormField label="Description" className="sm:col-span-2">
                  <Input {...register('description')} placeholder="Short description" />
                </FormField>
              </FormGrid>
            </FormSection>

            <FormSection title="Pricing & Tax">
              <FormGrid cols={3}>
                <FormField label="Unit" required>
                  <Controller
                    control={control}
                    name="unit"
                    render={({ field }) => (
                      <SelectField
                        value={field.value}
                        onChange={field.onChange}
                        options={optionsFromStrings(UNITS)}
                      />
                    )}
                  />
                </FormField>
                <FormField label="Selling Rate" required error={errors.rate?.message}>
                  <Controller
                    control={control}
                    name="rate"
                    render={({ field }) => (
                      <CurrencyInput value={field.value} onChange={field.onChange} />
                    )}
                  />
                </FormField>
                <FormField label="Cost Rate" hint="Visible to Admin / Manager only">
                  <Controller
                    control={control}
                    name="costRate"
                    render={({ field }) => (
                      <CurrencyInput value={field.value ?? 0} onChange={field.onChange} />
                    )}
                  />
                </FormField>
                <FormField label="GST %" required>
                  <Controller
                    control={control}
                    name="gstPercent"
                    render={({ field }) => (
                      <SelectField
                        value={String(field.value)}
                        onChange={(v) => field.onChange(Number(v))}
                        options={GST_RATES.map((g) => ({
                          value: String(g),
                          label: `${g}%`,
                        }))}
                      />
                    )}
                  />
                </FormField>
              </FormGrid>
            </FormSection>

            <FormSection title="Inventory">
              <FormGrid>
                <FormField label="Stock Quantity" error={errors.stockTotal?.message}>
                  <Input type="number" {...register('stockTotal')} className="num" />
                </FormField>
                <FormField label="Warehouse" required>
                  <Controller
                    control={control}
                    name="warehouse"
                    render={({ field }) => (
                      <SelectField
                        value={field.value}
                        onChange={field.onChange}
                        options={optionsFromStrings([
                          'Hazira Terminal, Surat',
                          'Kandla Depot, Gujarat',
                          'JNPT Warehouse, Navi Mumbai',
                          'Ennore Terminal, Chennai',
                          'Vizag Storage, Andhra Pradesh',
                        ])}
                      />
                    )}
                  />
                </FormField>
                <FormField label="Specifications" className="sm:col-span-2">
                  <Textarea
                    {...register('specifications')}
                    placeholder="e.g. Purity ≥ 99.8%, IS 12346 compliant"
                    rows={2}
                  />
                </FormField>
              </FormGrid>
            </FormSection>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit">{isEdit ? 'Save Changes' : 'Create Item'}</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
