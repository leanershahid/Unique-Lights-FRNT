import { ChevronLeft, ImagePlus, Pencil, Plus, Star, Trash2, Upload } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/api/adminApi'
import { getErrorMessage } from '@/api/axios'
import { Table, td, th } from '@/components/admin/AdminKit'
import { Badge } from '@/components/ui/Badge'
import { Button, IconButton } from '@/components/ui/Button'
import { Checkbox, Switch } from '@/components/ui/Choice'
import { Input, Select, Textarea } from '@/components/ui/Field'
import { Card } from '@/components/ui/Misc'
import { ConfirmDialog, Modal } from '@/components/ui/Overlay'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import {
  useAdminCategories,
  useAdminProduct,
  useDeleteProductImage,
  useDeleteVariant,
  useSaveProduct,
  useSaveVariant,
  useUpdateProductImage,
  useUploadProductImage,
} from '@/features/admin/hooks'
import { useToast } from '@/hooks/useToast'
import { AdminPageHeader } from '@/layouts/AdminLayout'
import type { AdminProductDetailDto, AdminVariantDto, UpsertProductRequest, UpsertVariantRequest } from '@/types/api'
import { cn } from '@/utils/cn'
import { formatPrice } from '@/utils/format'
import { hasErrors, serverErrors, type Errors } from '@/utils/validation'

const SPEC_SUGGESTIONS = ['Wattage', 'Lumens', 'Colour temperature', 'CRI', 'Material', 'Finish', 'Dimensions', 'Bulb base', 'Dimmable', 'Warranty']

type ProductForm = Omit<UpsertProductRequest, 'basePrice' | 'compareAtPrice' | 'specifications'> & {
  basePrice: string
  compareAtPrice: string
  specs: { key: string; value: string }[]
}

const blank: ProductForm = { name: '', slug: '', sku: '', shortDescription: '', description: '', brand: '', basePrice: '', compareAtPrice: '', categoryId: '', isActive: true, isFeatured: false, isNew: true, specs: [{ key: 'Wattage', value: '' }] }

function toForm(p: AdminProductDetailDto): ProductForm {
  return {
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    shortDescription: p.shortDescription ?? '',
    description: p.description ?? '',
    brand: p.brand ?? '',
    basePrice: String(p.basePrice),
    compareAtPrice: p.compareAtPrice != null ? String(p.compareAtPrice) : '',
    categoryId: p.categoryId,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    isNew: p.isNew,
    specs: Object.entries(p.specifications).map(([key, value]) => ({ key, value })),
  }
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024

/** Photos chosen before the product exists. They upload right after "Create product" succeeds. */
function NewImagesPicker({ files, onChange, progress }: { files: File[]; onChange: (f: File[]) => void; progress: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)
  const [previews, setPreviews] = useState<string[]>([])

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [files])

  const add = (list: FileList | null) => {
    if (!list?.length) return
    const picked = Array.from(list)
    const ok = picked.filter((f) => ACCEPTED.includes(f.type) && f.size <= MAX_BYTES)
    setProblem(ok.length < picked.length ? 'Some files were skipped: use JPG, PNG or WebP images up to 5 MB.' : null)
    onChange([...files, ...ok])
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[1.3rem]">Images</h2>
          <p className="text-[0.82rem] text-subtle">JPG, PNG or WebP up to 5 MB. The first image is the main one. They upload when you create the product.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          <Upload size={15} /> Choose images
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        multiple
        className="hidden"
        onChange={(e) => {
          add(e.target.files)
          e.target.value = ''
        }}
      />
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          add(e.dataTransfer.files)
        }}
        className={cn('rounded-xl border-2 border-dashed p-3 transition-colors', dragOver ? 'border-brass bg-brass/5' : 'border-line')}
      >
        {files.length === 0 ? (
          <button type="button" onClick={() => inputRef.current?.click()} className="flex w-full flex-col items-center gap-2 rounded-xl py-10 text-muted hover:text-brass">
            <ImagePlus size={28} /> Drop product photos here or click to choose
          </button>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className="relative overflow-hidden rounded-lg border border-line bg-surface-2">
                {previews[i] && <img src={previews[i]} alt="" className="aspect-square w-full object-cover" />}
                {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-brass px-2 py-0.5 text-[0.68rem] font-semibold text-on-brass">Main</span>}
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black/80 to-transparent p-2">
                  <button type="button" disabled={i === 0} onClick={() => onChange([f, ...files.filter((_, j) => j !== i)])} className="rounded p-1.5 text-white hover:bg-white/15 disabled:opacity-0" aria-label="Make main image">
                    <Star size={15} />
                  </button>
                  <button type="button" onClick={() => onChange(files.filter((_, j) => j !== i))} className="rounded p-1.5 text-white hover:bg-white/15" aria-label={`Remove ${f.name}`}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {problem && <p className="mt-2 text-[0.82rem] text-warning">{problem}</p>}
      {progress && <p className="mt-2 text-[0.85rem] text-brass">{progress}</p>}
    </Card>
  )
}

function ProductDetailsForm({ product }: { product?: AdminProductDetailDto }) {
  const navigate = useNavigate()
  const categories = useAdminCategories()
  const save = useSaveProduct()
  const qc = useQueryClient()
  const toast = useToast()
  const [pendingImages, setPendingImages] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [values, setValues] = useState<ProductForm>(product ? toForm(product) : blank)
  const [errors, setErrors] = useState<Errors<ProductForm>>({})
  const set = <K extends keyof ProductForm>(k: K, v: ProductForm[K]) => {
    setValues((s) => ({ ...s, [k]: v }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const price = Number(values.basePrice)
    const compare = values.compareAtPrice === '' ? null : Number(values.compareAtPrice)
    const found: Errors<ProductForm> = {
      name: values.name.trim().length < 2 ? 'Enter a product name.' : undefined,
      sku: !values.sku.trim() ? 'Enter a SKU.' : undefined,
      basePrice: !(price > 0) ? 'Enter a price above zero.' : undefined,
      compareAtPrice: compare !== null && !(compare > price) ? 'The original price must be higher than the selling price.' : undefined,
      categoryId: !values.categoryId ? 'Choose a category.' : undefined,
    }
    setErrors(found)
    if (hasErrors(found)) return
    const specifications = Object.fromEntries(values.specs.filter((s) => s.key.trim() && s.value.trim()).map((s) => [s.key.trim(), s.value.trim()]))
    const body: UpsertProductRequest = {
      name: values.name.trim(),
      slug: values.slug?.trim() || null,
      sku: values.sku.trim().toUpperCase(),
      shortDescription: values.shortDescription?.trim() || null,
      description: values.description?.trim() || null,
      brand: values.brand?.trim() || null,
      basePrice: price,
      compareAtPrice: compare,
      categoryId: values.categoryId,
      isActive: values.isActive,
      isFeatured: values.isFeatured,
      isNew: values.isNew,
      specifications,
    }
    save.mutate(
      { id: product?.id, body },
      {
        onSuccess: async (p) => {
          if (product) return
          // Upload the photos chosen on the New product page, then open the product for variants and stock.
          let failed = 0
          for (const [i, file] of pendingImages.entries()) {
            setUploadProgress(`Uploading image ${i + 1} of ${pendingImages.length}…`)
            try {
              await adminApi.products.uploadImage(p.id, file, p.name, i === 0)
            } catch (err) {
              failed += 1
              toast.fromError(err, `Could not upload ${file.name}`)
            }
          }
          setUploadProgress(null)
          if (pendingImages.length && failed === 0) toast.success({ title: `${pendingImages.length} image${pendingImages.length === 1 ? '' : 's'} uploaded` })
          await qc.invalidateQueries({ queryKey: ['admin', 'product', p.id] })
          void qc.invalidateQueries({ queryKey: ['admin', 'products'] })
          navigate(`/admin/products/${p.id}`, { replace: true })
        },
        onError: (err) => setErrors(serverErrors<ProductForm>(err)),
      },
    )
  }

  return (
    <form onSubmit={submit} noValidate className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid gap-6">
        <Card className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
          <Input containerClassName="sm:col-span-2" label="Name" value={values.name} onChange={(e) => set('name', e.target.value)} error={errors.name} />
          <Input label="SKU" value={values.sku} onChange={(e) => set('sku', e.target.value)} error={errors.sku} className="font-mono uppercase" />
          <Input label="URL slug" optional value={values.slug ?? ''} onChange={(e) => set('slug', e.target.value)} hint="Generated from the name when empty." error={errors.slug} />
          <Input label="Brand" optional value={values.brand ?? ''} onChange={(e) => set('brand', e.target.value)} />
          <Select label="Category" value={values.categoryId} onChange={(e) => set('categoryId', e.target.value)} error={errors.categoryId}>
            <option value="">Choose category</option>
            {categories.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.parentId ? '— ' : ''}
                {c.name}
              </option>
            ))}
          </Select>
          <Textarea containerClassName="sm:col-span-2" label="Short description" optional maxLength={300} value={values.shortDescription ?? ''} onChange={(e) => set('shortDescription', e.target.value)} className="min-h-20" />
          <div className="sm:col-span-2">
            <Textarea label="Full description" optional value={values.description ?? ''} onChange={(e) => set('description', e.target.value)} className="min-h-40" />
          </div>
        </Card>

        {!product && <NewImagesPicker files={pendingImages} onChange={setPendingImages} progress={uploadProgress} />}

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[1.3rem]">Specifications</h2>
            <Button variant="ghost" size="sm" onClick={() => set('specs', [...values.specs, { key: SPEC_SUGGESTIONS.find((s) => !values.specs.some((x) => x.key === s)) ?? '', value: '' }])}>
              <Plus size={15} /> Add row
            </Button>
          </div>
          <datalist id="spec-keys">
            {SPEC_SUGGESTIONS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
          <ul className="grid gap-2">
            <AnimatePresence initial={false}>
              {values.specs.map((row, i) => (
                <motion.li key={i} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] gap-2">
                  <input list="spec-keys" aria-label="Specification name" value={row.key} onChange={(e) => set('specs', values.specs.map((s, j) => (j === i ? { ...s, key: e.target.value } : s)))} className="h-10 rounded-lg border border-line bg-bg px-3 text-[0.88rem] outline-none focus:border-brass" placeholder="Name" />
                  <input aria-label="Specification value" value={row.value} onChange={(e) => set('specs', values.specs.map((s, j) => (j === i ? { ...s, value: e.target.value } : s)))} className="h-10 rounded-lg border border-line bg-bg px-3 text-[0.88rem] outline-none focus:border-brass" placeholder="Value, e.g. 12 W" />
                  <IconButton label="Remove row" size="sm" onClick={() => set('specs', values.specs.filter((_, j) => j !== i))}>
                    <Trash2 size={15} />
                  </IconButton>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </Card>
      </div>

      <div className="grid h-fit gap-6 xl:sticky xl:top-6">
        <Card className="grid gap-4 p-6">
          <h2 className="text-[1.3rem]">Pricing</h2>
          <Input label="Selling price (₹)" type="number" inputMode="decimal" min={0} step="0.01" value={values.basePrice} onChange={(e) => set('basePrice', e.target.value)} error={errors.basePrice} hint="Used when a variant has no price of its own." />
          <Input label="Original price (₹)" optional type="number" inputMode="decimal" min={0} step="0.01" value={values.compareAtPrice} onChange={(e) => set('compareAtPrice', e.target.value)} error={errors.compareAtPrice} hint="Shown struck through to display a discount." />
        </Card>
        <Card className="grid gap-2 p-6">
          <h2 className="mb-1 text-[1.3rem]">Visibility</h2>
          <Switch checked={values.isActive} onChange={(v) => set('isActive', v)} label="Visible in store" />
          <Switch checked={values.isFeatured} onChange={(v) => set('isFeatured', v)} label="Featured (bestsellers)" />
          <Switch checked={values.isNew} onChange={(v) => set('isNew', v)} label="Mark as new" />
        </Card>
        {save.isError && !hasErrors(serverErrors(save.error)) && <p className="text-[0.85rem] text-danger">{getErrorMessage(save.error)}</p>}
        <Button type="submit" variant="accent" size="lg" fullWidth loading={save.isPending || uploadProgress !== null}>
          {product ? 'Save changes' : pendingImages.length ? `Create product and upload ${pendingImages.length} image${pendingImages.length === 1 ? '' : 's'}` : 'Create product'}
        </Button>
      </div>
    </form>
  )
}

type VariantForm = { sku: string; name: string; color: string; finish: string; colorTemperature: string; wattage: string; price: string; compareAtPrice: string; isDefault: boolean; isActive: boolean; initialStock: string; lowStockThreshold: string }

function VariantModal({ productId, variant, open, onClose, isFirst }: { productId: string; variant: AdminVariantDto | null; open: boolean; onClose: () => void; isFirst: boolean }) {
  const save = useSaveVariant(productId)
  const init = (): VariantForm =>
    variant
      ? { sku: variant.sku, name: variant.name, color: variant.color ?? '', finish: variant.finish ?? '', colorTemperature: variant.colorTemperature ?? '', wattage: variant.wattage?.toString() ?? '', price: String(variant.price), compareAtPrice: variant.compareAtPrice?.toString() ?? '', isDefault: variant.isDefault, isActive: variant.isActive, initialStock: '', lowStockThreshold: String(variant.lowStockThreshold) }
      : { sku: '', name: '', color: '', finish: '', colorTemperature: '', wattage: '', price: '', compareAtPrice: '', isDefault: isFirst, isActive: true, initialStock: '0', lowStockThreshold: '5' }
  const [v, setV] = useState<VariantForm>(init)
  const [errors, setErrors] = useState<Errors<VariantForm>>({})
  useEffect(() => {
    if (open) {
      setV(init())
      setErrors({})
    }
  }, [open, variant])
  const set = (k: keyof VariantForm, value: string | boolean) => setV((s) => ({ ...s, [k]: value }))

  const submit = () => {
    const price = Number(v.price)
    const found: Errors<VariantForm> = {
      sku: !v.sku.trim() ? 'Enter a SKU.' : undefined,
      name: !v.name.trim() ? 'Enter a name customers will see, e.g. Brass.' : undefined,
      price: !(price > 0) ? 'Enter a price above zero.' : undefined,
      compareAtPrice: v.compareAtPrice && !(Number(v.compareAtPrice) > price) ? 'Must be higher than the price.' : undefined,
    }
    setErrors(found)
    if (hasErrors(found)) return
    const body: UpsertVariantRequest = {
      sku: v.sku.trim().toUpperCase(),
      name: v.name.trim(),
      color: v.color.trim() || null,
      finish: v.finish.trim() || null,
      colorTemperature: v.colorTemperature.trim() || null,
      wattage: v.wattage ? Number(v.wattage) : null,
      price,
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
      isDefault: v.isDefault,
      isActive: v.isActive,
      initialStock: variant ? null : Number(v.initialStock || 0),
      lowStockThreshold: v.lowStockThreshold ? Number(v.lowStockThreshold) : null,
    }
    save.mutate({ variantId: variant?.id, body }, { onSuccess: onClose, onError: (err) => setErrors(serverErrors<VariantForm>(err)) })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={variant ? `Edit ${variant.name}` : 'New variant'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="accent" onClick={submit} loading={save.isPending}>
            {variant ? 'Save variant' : 'Add variant'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Name shown to customers" value={v.name} onChange={(e) => set('name', e.target.value)} error={errors.name} placeholder="Brass / 3000 K" data-autofocus />
        <Input label="SKU" value={v.sku} onChange={(e) => set('sku', e.target.value)} error={errors.sku} className="font-mono uppercase" />
        <Input label="Price (₹)" type="number" min={0} step="0.01" value={v.price} onChange={(e) => set('price', e.target.value)} error={errors.price} />
        <Input label="Original price (₹)" optional type="number" min={0} step="0.01" value={v.compareAtPrice} onChange={(e) => set('compareAtPrice', e.target.value)} error={errors.compareAtPrice} />
        <Input label="Finish" optional value={v.finish} onChange={(e) => set('finish', e.target.value)} placeholder="Brushed brass" />
        <Input label="Colour" optional value={v.color} onChange={(e) => set('color', e.target.value)} placeholder="Gold" />
        <Input label="Colour temperature" optional value={v.colorTemperature} onChange={(e) => set('colorTemperature', e.target.value)} placeholder="2700K" />
        <Input label="Wattage (W)" optional type="number" min={0} value={v.wattage} onChange={(e) => set('wattage', e.target.value)} />
        {!variant && <Input label="Opening stock" type="number" min={0} value={v.initialStock} onChange={(e) => set('initialStock', e.target.value)} hint="Adjust later on the Inventory page." />}
        <Input label="Low-stock alert at" type="number" min={0} value={v.lowStockThreshold} onChange={(e) => set('lowStockThreshold', e.target.value)} />
        <div className="grid gap-1 sm:col-span-2">
          <Checkbox checked={v.isDefault} onChange={(c) => set('isDefault', c)} label="Default variant" description="Shown first and used for the product's listed price." />
          <Checkbox checked={v.isActive} onChange={(c) => set('isActive', c)} label="Available for sale" />
        </div>
      </div>
    </Modal>
  )
}

function VariantsCard({ product }: { product: AdminProductDetailDto }) {
  const [editing, setEditing] = useState<AdminVariantDto | 'new' | null>(null)
  const [deleting, setDeleting] = useState<AdminVariantDto | null>(null)
  const remove = useDeleteVariant(product.id)
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-[1.3rem]">Variants</h2>
          <p className="text-[0.82rem] text-subtle">Finishes, sizes or colour temperatures, each with its own SKU, price and stock.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditing('new')}>
          <Plus size={15} /> Add variant
        </Button>
      </div>
      <Table
        head={
          <tr>
            <th className={th}>Variant</th>
            <th className={th}>SKU</th>
            <th className={cn(th, 'text-right')}>Price</th>
            <th className={cn(th, 'text-right')}>Available</th>
            <th className={th}>Status</th>
            <th className={th}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        }
      >
        {product.variants.map((v) => (
          <tr key={v.id}>
            <td className={td}>
              <span className="font-medium">{v.name}</span> {v.isDefault && <Badge tone="brass">Default</Badge>}
              <p className="text-[0.75rem] text-subtle">{[v.finish, v.colorTemperature, v.wattage ? `${v.wattage} W` : null].filter(Boolean).join(' · ')}</p>
            </td>
            <td className={cn(td, 'font-mono text-[0.8rem]')}>{v.sku}</td>
            <td className={cn(td, 'text-right font-mono tabular')}>{formatPrice(v.price)}</td>
            <td className={cn(td, 'text-right font-mono tabular', v.stock === 0 ? 'text-danger' : v.stock <= v.lowStockThreshold ? 'text-warning' : '')}>{v.stock}</td>
            <td className={td}>
              <Badge tone={v.isActive ? 'success' : 'neutral'}>{v.isActive ? 'On sale' : 'Off'}</Badge>
            </td>
            <td className={cn(td, 'text-right')}>
              <div className="flex justify-end">
                <IconButton label={`Edit ${v.name}`} size="sm" onClick={() => setEditing(v)}>
                  <Pencil size={15} />
                </IconButton>
                <IconButton label={`Delete ${v.name}`} size="sm" disabled={product.variants.length <= 1} className="hover:!text-danger" onClick={() => setDeleting(v)}>
                  <Trash2 size={15} />
                </IconButton>
              </div>
            </td>
          </tr>
        ))}
      </Table>
      <VariantModal productId={product.id} variant={editing === 'new' ? null : editing} open={editing !== null} onClose={() => setEditing(null)} isFirst={product.variants.length === 0} />
      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSettled: () => setDeleting(null) })}
        loading={remove.isPending}
        danger
        title={`Delete ${deleting?.name ?? 'variant'}?`}
        message="Customers will no longer be able to buy this option."
        confirmLabel="Delete variant"
      />
    </Card>
  )
}

function ImagesCard({ product }: { product: AdminProductDetailDto }) {
  const upload = useUploadProductImage(product.id)
  const update = useUpdateProductImage(product.id)
  const remove = useDeleteProductImage(product.id)
  const fileRef = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return
    for (const file of Array.from(files)) {
      setProgress(0)
      try {
        await upload.mutateAsync({ file, altText: product.name, isPrimary: product.images.length === 0, onProgress: setProgress })
      } catch {
        break
      }
    }
    setProgress(null)
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[1.3rem]">Images</h2>
          <p className="text-[0.82rem] text-subtle">JPG, PNG or WebP up to 5 MB. Drag photos in or click Upload. The starred image is shown first.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} loading={upload.isPending}>
            <Upload size={15} /> Upload
          </Button>
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => void uploadFiles(e.target.files).then(() => (e.target.value = ''))} />

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          void uploadFiles(e.dataTransfer.files)
        }}
        className={cn('rounded-xl border-2 border-dashed p-3 transition-colors', dragOver ? 'border-brass bg-brass/5' : 'border-transparent')}
      >
        {progress !== null && (
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-line">
            <motion.div className="h-full bg-brass" animate={{ width: `${progress}%` }} />
          </div>
        )}
        {product.images.length === 0 ? (
          <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full flex-col items-center gap-2 rounded-xl py-12 text-muted hover:text-brass">
            <ImagePlus size={28} /> Drop images here or click to upload
          </button>
        ) : (
          <motion.ul layout className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <AnimatePresence initial={false}>
              {product.images.map((img, i) => (
                <motion.li layout key={img.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="group relative overflow-hidden rounded-lg border border-line bg-surface-2">
                  <img src={img.url} alt={img.altText ?? ''} className="aspect-square w-full object-cover" />
                  {img.isPrimary && <span className="absolute left-2 top-2 rounded-full bg-brass px-2 py-0.5 text-[0.68rem] font-semibold text-on-brass">Primary</span>}
                  <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-black/80 to-transparent p-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                    <div className="flex">
                      <button type="button" disabled={i === 0} onClick={() => update.mutate({ imageId: img.id, body: { altText: img.altText, sortOrder: Math.max(0, img.sortOrder - 1), isPrimary: img.isPrimary } })} className="rounded p-1.5 text-white hover:bg-white/15 disabled:opacity-30" aria-label="Move earlier">
                        ←
                      </button>
                      <button type="button" disabled={i === product.images.length - 1} onClick={() => update.mutate({ imageId: img.id, body: { altText: img.altText, sortOrder: img.sortOrder + 1, isPrimary: img.isPrimary } })} className="rounded p-1.5 text-white hover:bg-white/15 disabled:opacity-30" aria-label="Move later">
                        →
                      </button>
                    </div>
                    <div className="flex">
                      {!img.isPrimary && (
                        <button type="button" onClick={() => update.mutate({ imageId: img.id, body: { altText: img.altText, sortOrder: img.sortOrder, isPrimary: true } })} className="rounded p-1.5 text-white hover:bg-white/15" aria-label="Make primary image">
                          <Star size={15} />
                        </button>
                      )}
                      <button type="button" onClick={() => remove.mutate(img.id)} className="rounded p-1.5 text-white hover:bg-white/15" aria-label="Delete image">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>

    </Card>
  )
}

export default function ProductEditPage() {
  const { id } = useParams()
  const isNew = !id
  const { data: product, isPending, isError, error, refetch } = useAdminProduct(id)
  useEffect(() => {
    document.title = `${isNew ? 'New product' : (product?.name ?? 'Product')} · Unique Lights Admin`
  }, [isNew, product?.name])

  return (
    <div>
      <Link to="/admin/products" className="mb-4 inline-flex items-center gap-1 text-[0.88rem] text-muted hover:text-ink">
        <ChevronLeft size={16} /> Products
      </Link>
      <AdminPageHeader
        title={isNew ? 'New product' : (product?.name ?? 'Product')}
        description={isNew ? 'Add details and photos. Variants and stock can be set right after creating it.' : undefined}
        action={
          product && (
            <Link to={`/products/${product.slug}`} target="_blank" rel="noreferrer" className="text-[0.88rem] font-semibold text-brass hover:underline">
              View in store ↗
            </Link>
          )
        }
      />
      {isNew ? (
        <ProductDetailsForm />
      ) : isPending ? (
        <Skeleton className="h-96" />
      ) : isError || !product ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <div className="grid gap-6">
          <ProductDetailsForm key={product.id} product={product} />
          <ImagesCard product={product} />
          <VariantsCard product={product} />
        </div>
      )}
    </div>
  )
}
