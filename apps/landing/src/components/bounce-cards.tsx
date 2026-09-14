import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';

import type { ReactNode } from 'react';
import './bounce-cards.css';

/* ─── BounceCards (React Bits) ───────────────────────────────────────
   Adaptado para el proyecto:
   - `renderItem` permite renderizar contenido propio (cards de etapas)
     en lugar de `<img>`; `count` define cuántas cards en ese modo.
   - `pushOffset` parametriza cuánto se empujan los hermanos al hover.
   - Respeta `prefers-reduced-motion` (sin animación de entrada). ── */

const DEFAULT_TRANSFORMS = [
  'rotate(10deg) translate(-170px)',
  'rotate(5deg) translate(-85px)',
  'rotate(-3deg)',
  'rotate(-10deg) translate(85px)',
  'rotate(2deg) translate(170px)',
];

type BounceCardsProps = {
  className?: string;
  images?: string[];
  count?: number;
  renderItem?: (index: number) => ReactNode;
  containerWidth?: number;
  containerHeight?: number;
  animationDelay?: number;
  animationDuration?: number;
  animationStagger?: number;
  easeType?: string;
  transformStyles?: string[];
  enableHover?: boolean;
  pushOffset?: number;
};

export default function BounceCards({
  className = '',
  images = [],
  count,
  renderItem,
  containerWidth = 400,
  containerHeight = 400,
  animationDelay = 0.5,
  animationDuration = 1,
  animationStagger = 0.06,
  easeType = 'elastic.out(1, 0.8)',
  transformStyles = DEFAULT_TRANSFORMS,
  enableHover = true,
  pushOffset = 160,
}: BounceCardsProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.card',
        { scale: 0 },
        {
          scale: 1,
          duration: animationDuration,
          stagger: animationStagger,
          ease: easeType,
          delay: animationDelay,
        },
      );
    }, containerRef);

    return (): void => {
      ctx.revert();
    };
  }, [animationDuration, animationStagger, easeType, animationDelay]);

  const total = renderItem ? (count ?? images.length) : images.length;

  const getNoRotationTransform = (transformStr: string): string => {
    const hasRotate = /rotate\([\s\S]*?\)/.test(transformStr);
    if (hasRotate) {
      return transformStr.replace(/rotate\([\s\S]*?\)/, 'rotate(0deg)');
    } else if (transformStr === 'none') {
      return 'rotate(0deg)';
    } else {
      return `${transformStr} rotate(0deg)`;
    }
  };

  const getPushedTransform = (baseTransform: string, offsetX: number): string => {
    const translateRegex = /translate\(([-0-9.]+)px\)/;
    const match = translateRegex.exec(baseTransform);
    if (match) {
      const currentX = parseFloat(match[1]);
      const newX = currentX + offsetX;
      return baseTransform.replace(translateRegex, `translate(${String(newX)}px)`);
    } else {
      return baseTransform === 'none'
        ? `translate(${String(offsetX)}px)`
        : `${baseTransform} translate(${String(offsetX)}px)`;
    }
  };

  const pushSiblings = (hoveredIdx: number): void => {
    if (!enableHover || !containerRef.current) return;

    const q = gsap.utils.selector(containerRef);

    for (let i = 0; i < total; i++) {
      const target = q(`.card-${String(i)}`);
      gsap.killTweensOf(target);

      const baseTransform = transformStyles[i] || 'none';

      if (i === hoveredIdx) {
        gsap.set(target, { zIndex: 20 });
        gsap.to(target, {
          transform: getNoRotationTransform(baseTransform),
          duration: 0.55,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      } else {
        const offsetX = i < hoveredIdx ? -pushOffset : pushOffset;
        const distance = Math.abs(hoveredIdx - i);
        const delay = distance * 0.035;

        gsap.to(target, {
          transform: getPushedTransform(baseTransform, offsetX),
          duration: 0.55,
          ease: 'power3.out',
          delay,
          overwrite: 'auto',
        });
      }
    }
  };

  const resetSiblings = (): void => {
    if (!enableHover || !containerRef.current) return;

    const q = gsap.utils.selector(containerRef);

    for (let i = 0; i < total; i++) {
      const target = q(`.card-${String(i)}`);
      gsap.killTweensOf(target);
      gsap.set(target, { zIndex: 'auto' });
      gsap.to(target, {
        transform: transformStyles[i] || 'none',
        duration: 0.55,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    }
  };

  return (
    <div
      className={`bounceCardsContainer ${className}`}
      ref={containerRef}
      style={{
        position: 'relative',
        width: containerWidth,
        height: containerHeight,
      }}
    >
      {Array.from({ length: total }).map((_, idx) => (
        <div
          key={idx}
          className={`card card-${String(idx)}`}
          style={{ transform: transformStyles[idx] ?? 'none' }}
          onMouseEnter={() => {
            pushSiblings(idx);
          }}
          onMouseLeave={resetSiblings}
        >
          {renderItem ? (
            renderItem(idx)
          ) : (
            <img className="image" src={images[idx]} alt={`card-${String(idx)}`} />
          )}
        </div>
      ))}
    </div>
  );
}
