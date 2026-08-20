type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  light = false,
}: Props) {
  const isCenter = align === "center";
  return (
    <div className={isCenter ? "text-center mx-auto max-w-2xl" : "max-w-2xl"}>
      {eyebrow && (
        <p className="text-xs tracking-widest-plus text-gold-600 mb-3">
          {eyebrow.toUpperCase()}
        </p>
      )}
      <h2
        className={`font-serif text-3xl md:text-4xl leading-tight ${
          light ? "text-ivory-50" : "text-charcoal-900"
        }`}
      >
        {title}
      </h2>
      <div
        className={`gold-divider mt-5 mb-5 ${isCenter ? "mx-auto" : ""}`}
      />
      {description && (
        <p
          className={`text-base leading-relaxed ${
            light ? "text-ivory-200/80" : "text-charcoal-700"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
