// components/layout/SectionContainer.jsx
export default function SectionContainer({
  children,
  className = "",
  background = "bg-white",
  containerWidth = "max-w-7xl",
  padding = "px-4 sm:px-6 lg:px-8 py-16 md:py-24",
}) {
  return (
    <section className={`${background} ${className}`}>
      <div className={`${containerWidth} mx-auto ${padding}`}>{children}</div>
    </section>
  );
}
