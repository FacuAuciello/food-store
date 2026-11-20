//#bloque gris animado que se muestra mientras cargan los datos
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />
}
