type Section = { heading: string; body: string[] };

export default function LegalContent({
  updated,
  sections,
}: {
  updated: string;
  sections: Section[];
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs tracking-widest-plus text-gold-600 mb-14">
        LAST UPDATED: {updated.toUpperCase()}
      </p>
      <div className="space-y-12">
        {sections.map((s) => (
          <div key={s.heading}>
            <h2 className="font-serif text-xl text-charcoal-900 mb-4">
              {s.heading}
            </h2>
            <div className="space-y-3">
              {s.body.map((p, i) => (
                <p key={i} className="text-sm text-charcoal-700 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
