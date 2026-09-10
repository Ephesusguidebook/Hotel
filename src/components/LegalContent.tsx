import RichText from "@/components/RichText";

export default function LegalContent({
  updated,
  content,
}: {
  updated: string;
  content: string;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="eyebrow text-gold-600 mb-12">Last updated: {updated}</p>
      <RichText html={content} />
    </div>
  );
}
