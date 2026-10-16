/**
 * Full-bleed placeholder behind the hero text when no hero banners have
 * been uploaded yet from /admin/slider.
 */
export function HeroFallback() {
  return (
    <div className="absolute inset-0 bg-dark">
      <div aria-hidden="true" className="fine-grid-bg absolute inset-0 opacity-[0.08]" />
      <div
        aria-hidden="true"
        className="brand-glow-red absolute -left-24 -top-24 h-96 w-96 rounded-full blur-3xl"
      />
    </div>
  );
}
