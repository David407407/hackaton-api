/**
 * Manchas difusas decorativas del fondo. El contenedor padre debe ser
 * `relative overflow-hidden`.
 */
function BackgroundBlobs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute -left-40 -top-40 size-[520px] rounded-full bg-mist/60 blur-3xl" />
      <div className="absolute -bottom-48 -right-32 size-[560px] rounded-full bg-teal/15 blur-3xl" />
      <div className="absolute right-[18%] top-[14%] size-40 rounded-full bg-indigo/10 blur-2xl" />
    </div>
  )
}

export default BackgroundBlobs
