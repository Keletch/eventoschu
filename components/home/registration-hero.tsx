"use client";

interface RegistrationHeroProps {
  title: string;
  description: string;
}

export function RegistrationHero({ title, description }: RegistrationHeroProps) {
  return (
    <div className="max-w-[1372px] mx-auto text-center space-y-10">
      <h2 className="text-4xl sm:text-6xl lg:text-[88px] font-extrabold tracking-tighter leading-[0.95] text-black whitespace-pre-line">
        {title}
      </h2>
      <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 font-medium leading-relaxed px-4">
        {description}
      </p>
    </div>
  );
}
