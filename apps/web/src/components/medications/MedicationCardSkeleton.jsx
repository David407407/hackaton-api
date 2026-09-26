import Skeleton from '../ui/Skeleton'

/** Placeholder con la misma forma y tamaño que MedicationCard. */
function MedicationCardSkeleton() {
  return (
    <div aria-hidden className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-ink/5">
      <div className="flex items-start gap-3">
        <Skeleton className="size-11 shrink-0 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-2 h-3 w-16" />
        </div>
      </div>
      <Skeleton className="mt-4 h-6 w-36 rounded-full" />
      <div className="mt-4 flex justify-between">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-4 w-14" />
      </div>
      <Skeleton className="mt-2 h-2 rounded-full" />
      <div className="mt-5 flex items-center justify-between border-t border-ink/8 pt-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
    </div>
  )
}

export default MedicationCardSkeleton
