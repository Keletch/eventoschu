"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export function WordRotator() {
  const rotatorRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const words = ["Giras", "Eventos", "Talleres", "Reuniones"];
    let currentIndex = 0;
    const rotator = rotatorRef.current;

    if (rotator) {
      const rotate = () => {
        const nextIndex = (currentIndex + 1) % words.length;
        const nextWord = words[nextIndex];
        const tlRotator = gsap.timeline({
          onComplete: () => {
            currentIndex = nextIndex;
            setTimeout(rotate, 1200);
          }
        });

        tlRotator.to(rotator, {
          y: 120, opacity: 0, filter: "blur(10px)", duration: 0.25, ease: "power2.in",
          onComplete: () => {
            rotator.textContent = nextWord;
            gsap.set(rotator, { y: -120, filter: "blur(10px)" });
          }
        }).to(rotator, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.35, ease: "back.out(1.2)" });
      };
      setTimeout(rotate, 1500);
    }
  }, { scope: rotatorRef });

  return (
    <span 
      ref={rotatorRef} 
      className="word-rotator block text-5xl sm:text-7xl lg:text-[120px] text-foreground leading-none"
    >
      Giras
    </span>
  );
}
