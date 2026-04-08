import Link from "next/link";

type BrandMarkProps = {
  href?: string;
  tagline: string;
  tone?: "light" | "dark";
};

export default function BrandMark({ href = "/", tagline, tone = "dark" }: BrandMarkProps) {
  const textColor = "text-[var(--color-primary)]";
  const taglineColor = tone === "light" ? "text-white" : "text-amber-700";
  return (
    <Link href={href} className="group inline-flex flex-col items-center gap-1 text-center">
      <span className={`font-[family-name:var(--font-playfair)] text-[1.5rem] font-bold italic tracking-[-0.02em] ${textColor}`}>
        Details by MIMA
      </span>
      <span className={`text-center text-[10px] uppercase tracking-[0.3em] ${taglineColor}`}>
        {tagline}
      </span>
    </Link>
  );
}
