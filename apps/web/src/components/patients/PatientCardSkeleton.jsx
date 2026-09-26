import Skeleton from '../ui/Skeleton'

/** Placeholder con la misma forma y tamaño que PatientCard. */
function PatientCardSkeleton() {
  return (
    <div aria-hidden className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-ink/5">
      <div className="flex items-start gap-4">
        <Skeleton className="size-16 shrink-0 rounded-full" />
        <div className="flex-1">
          <Skeleton className="mt-0.5 h-3 w-16" />
          <Skeleton className="mt-2 h-4 w-36" />
          <Skeleton className="mt-3 h-7 w-32 rounded-full" />
        </div>
        <Skeleton className="size-6 rounded-lg" />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Skeleton className="h-[62px] rounded-2xl" />
        <Skeleton className="h-[62px] rounded-2xl" />
      </div>
      <Skeleton className="mt-4 h-5 w-28 rounded-full" />
    </div>
  )
}

export default PatientCardSkeleton
