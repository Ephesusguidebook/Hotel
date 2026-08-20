import Image from "next/image";

type Props = {
  image: string;
  eyebrow: string;
  title: string;
  description?: string;
};

export default function PageHero({ image, eyebrow, title, description }: Props) {
  return (
    <section className="relative h-[46vh] min-h-[360px] flex items-end">
      <Image
        src={image}
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/50 to-charcoal-950/20" />
      <div className="relative mx-auto max-w-7xl w-full px-6 lg:px-10 pb-14">
        <p className="text-xs tracking-widest-plus text-gold-400 mb-4">
          {eyebrow.toUpperCase()}
        </p>
        <h1 className="font-serif text-4xl md:text-5xl text-ivory-50 max-w-2xl">
          {title}
        </h1>
        {description && (
          <p className="text-ivory-200/80 mt-4 max-w-xl">{description}</p>
        )}
      </div>
    </section>
  );
}
