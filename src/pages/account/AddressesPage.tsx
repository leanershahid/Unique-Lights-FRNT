import { MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { AddressForm } from '@/components/account/AddressForm'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog, Modal } from '@/components/ui/Overlay'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { useAddresses, useDeleteAddress, useSetDefaultAddress } from '@/features/account/hooks'
import type { AddressDto } from '@/types/api'
import { cn } from '@/utils/cn'

export default function AddressesPage() {
  const { data, isPending, isError, error, refetch } = useAddresses()
  const setDefault = useSetDefaultAddress()
  const remove = useDeleteAddress()
  const [editing, setEditing] = useState<AddressDto | 'new' | null>(null)
  const [deleting, setDeleting] = useState<AddressDto | null>(null)
  useEffect(() => {
    document.title = 'Addresses · Unique Lights'
  }, [])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[1.5rem]">Saved addresses</h2>
        <Button variant="outline" size="sm" onClick={() => setEditing('new')}>
          <Plus size={16} /> Add address
        </Button>
      </div>

      {isPending ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : data.length === 0 ? (
        <EmptyState icon={<MapPin size={30} />} title="No saved addresses" description="Add one now and checkout will be quicker next time." action={<Button variant="accent" onClick={() => setEditing('new')}>Add address</Button>} />
      ) : (
        <motion.ul layout className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AnimatePresence initial={false}>
            {data.map((a) => (
              <motion.li
                layout
                key={a.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className={cn('flex flex-col rounded-[var(--radius-card)] border bg-surface p-5', a.isDefault ? 'border-brass' : 'border-line')}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{a.fullName}</p>
                  {a.isDefault ? (
                    <span className="rounded-full bg-brass/15 px-2.5 py-0.5 text-[0.72rem] font-semibold text-brass">Default</span>
                  ) : a.label ? (
                    <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-[0.72rem] text-muted">{a.label}</span>
                  ) : null}
                </div>
                <p className="mt-2 flex-1 text-[0.9rem] text-muted">
                  {a.line1}
                  {a.line2 && `, ${a.line2}`}
                  <br />
                  {a.city}, {a.state} {a.postalCode}
                  <br />
                  {a.phone}
                </p>
                <div className="mt-4 flex flex-wrap gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(a)}>
                    <Pencil size={14} /> Edit
                  </Button>
                  {!a.isDefault && (
                    <Button variant="ghost" size="sm" onClick={() => setDefault.mutate(a.id)} loading={setDefault.isPending && setDefault.variables === a.id}>
                      <Star size={14} /> Make default
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="ml-auto hover:!text-danger" onClick={() => setDeleting(a)}>
                    <Trash2 size={14} /> Delete
                  </Button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'New address' : 'Edit address'} size="lg">
        {editing !== null && <AddressForm address={editing === 'new' ? undefined : editing} defaultChecked={!data?.length} onCancel={() => setEditing(null)} onSaved={() => setEditing(null)} />}
      </Modal>
      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSettled: () => setDeleting(null) })}
        loading={remove.isPending}
        danger
        title="Delete this address?"
        message={deleting ? `${deleting.line1}, ${deleting.city} will be removed from your account.` : ''}
        confirmLabel="Delete"
      />
    </div>
  )
}
