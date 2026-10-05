export function ColorSwatch({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      className="size-3 shrink-0 rounded-sm border border-border"
      style={{ backgroundColor: `#${color}` }}
    />
  )
}
