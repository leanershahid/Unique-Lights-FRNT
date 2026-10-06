import { Pencil, Plus, Tags, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getErrorMessage } from '@/api/axios'
import { Table, td, th } from '@/components/admin/AdminKit'
import { Badge } from '@/components/ui/Badge'
import { Button, IconButton } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Choice'
import { Input, Select, Textarea } from '@/components/ui/Field'
import { ConfirmDialog, Modal } from '@/components/ui/Overlay'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { useAdminCategories, useDeleteCategory, useSaveCategory } from '@/features/admin/hooks'
import { AdminPageHeader } from '@/layouts/AdminLayout'
import type { AdminCategoryDto, UpsertCategoryRequest } from '@/types/api'
import { cn } from '@/utils/cn'
import { hasErrors, serverErrors, type Errors } from '@/utils/validation'

type Form = Omit<UpsertCategoryRequest, 'sortOrder'> & { sortOrder: string }

function CategoryModal({ category, all, open, onClose }: { category: AdminCategoryDto | null; all: AdminCategoryDto[]; open: boolean; onClose: () => void }) {
  const save = useSaveCategory()
  const init = (): Form =>
    category
      ? { name: category.name, slug: category.slug, description: category.description ?? '', imageUrl: category.imageUrl ?? '', parentId: category.parentId ?? '', sortOrder: String(category.sortOrder), isActive: category.isActive }
      : { name: '', slug: '', description: '', imageUrl: '', parentId: '', sortOrder: String(all.length + 1), isActive: true }
  const [v, setV] = useState<Form>(init)
  const [errors, setErrors] = useState<Errors<Form>>({})
  useEffect(() => {
    if (open) {
      setV(init())
      setErrors({})
    }
  }, [open, category])

  const submit = () => {
    const found: Errors<Form> = { name: v.name.trim().length < 2 ? 'Enter a category name.' : undefined }
    setErrors(found)
    if (hasErrors(found)) return
    save.mutate(
      {
        id: category?.id,
        body: { name: v.name.trim(), slug: v.slug?.trim() || null, description: v.description?.trim() || null, imageUrl: v.imageUrl?.trim() || null, parentId: v.parentId || null, sortOrder: Number(v.sortOrder) || 0, isActive: v.isActive },
      },
      { onSuccess: onClose, onError: (err) => setErrors(serverErrors<Form>(err)) },
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={category ? `Edit ${category.name}` : 'New category'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" onClick={submit} loading={save.isPending}>
            {category ? 'Save' : 'Create'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} error={errors.name} data-autofocus />
        <Input label="URL slug" optional value={v.slug ?? ''} onChange={(e) => setV({ ...v, slug: e.target.value })} error={errors.slug} />
        <Select label="Parent category" value={v.parentId ?? ''} onChange={(e) => setV({ ...v, parentId: e.target.value })}>
          <option value="">None (top level)</option>
          {all
            .filter((c) => c.id !== category?.id && !c.parentId)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </Select>
        <Input label="Sort order" type="number" value={v.sortOrder} onChange={(e) => setV({ ...v, sortOrder: e.target.value })} />
        <Input containerClassName="sm:col-span-2" label="Image URL" optional value={v.imageUrl ?? ''} onChange={(e) => setV({ ...v, imageUrl: e.target.value })} hint="Shown in the menu and category banner." />
        <Textarea containerClassName="sm:col-span-2" label="Description" optional value={v.description ?? ''} onChange={(e) => setV({ ...v, description: e.target.value })} className="min-h-20" />
        <div className="sm:col-span-2">
          <Switch checked={v.isActive} onChange={(c) => setV({ ...v, isActive: c })} label="Visible in store" />
        </div>
        {save.isError && !hasErrors(serverErrors(save.error)) && <p className="text-[0.85rem] text-danger sm:col-span-2">{getErrorMessage(save.error)}</p>}
      </div>
    </Modal>
  )
}

export default function CategoriesPage() {
  const { data, isPending, isError, error, refetch } = useAdminCategories()
  const remove = useDeleteCategory()
  const [editing, setEditing] = useState<AdminCategoryDto | 'new' | null>(null)
  const [deleting, setDeleting] = useState<AdminCategoryDto | null>(null)
  useEffect(() => {
    document.title = 'Categories · Unique Lights Admin'
  }, [])

  const ordered = data ? [...data.filter((c) => !c.parentId).sort((a, b) => a.sortOrder - b.sortOrder).flatMap((p) => [p, ...data.filter((c) => c.parentId === p.id).sort((a, b) => a.sortOrder - b.sortOrder)])] : []

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description="How the store is organised in menus and filters."
        action={
          <Button variant="accent" onClick={() => setEditing('new')}>
            <Plus size={17} /> New category
          </Button>
        }
      />
      {isPending ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : !data.length ? (
        <EmptyState icon={<Tags size={30} />} title="No categories yet" action={<Button onClick={() => setEditing('new')}>Create one</Button>} />
      ) : (
        <Table
          head={
            <tr>
              <th className={th}>Category</th>
              <th className={th}>Slug</th>
              <th className={cn(th, 'text-right')}>Products</th>
              <th className={th}>Status</th>
              <th className={th}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          }
        >
          {ordered.map((c) => (
            <tr key={c.id} className="hover:bg-surface-2/60">
              <td className={td}>
                <div className={cn('flex items-center gap-3', c.parentId && 'pl-8')}>
                  {c.imageUrl ? <img src={c.imageUrl} alt="" className="size-10 rounded-lg object-cover" /> : <span className="size-10 rounded-lg bg-surface-2" />}
                  <span className="font-medium">{c.name}</span>
                </div>
              </td>
              <td className={cn(td, 'font-mono text-[0.8rem] text-muted')}>{c.slug}</td>
              <td className={cn(td, 'text-right font-mono tabular')}>{c.productCount}</td>
              <td className={td}>
                <Badge tone={c.isActive ? 'success' : 'neutral'}>{c.isActive ? 'Visible' : 'Hidden'}</Badge>
              </td>
              <td className={cn(td, 'text-right')}>
                <div className="flex justify-end">
                  <IconButton label={`Edit ${c.name}`} size="sm" onClick={() => setEditing(c)}>
                    <Pencil size={15} />
                  </IconButton>
                  <IconButton label={`Delete ${c.name}`} size="sm" className="hover:!text-danger" onClick={() => setDeleting(c)}>
                    <Trash2 size={15} />
                  </IconButton>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}
      <CategoryModal category={editing === 'new' ? null : editing} all={data ?? []} open={editing !== null} onClose={() => setEditing(null)} />
      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSettled: () => setDeleting(null) })}
        loading={remove.isPending}
        danger
        title={`Delete ${deleting?.name ?? 'category'}?`}
        message="Categories that still contain products or subcategories cannot be deleted. Move or delete those first."
        confirmLabel="Delete"
      />
    </div>
  )
}
