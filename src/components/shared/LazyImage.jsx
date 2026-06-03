import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Music } from 'lucide-react';

export default function LazyImage({ src, alt, wrapperClassName, imageClassName }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const placeholderRef = useRef(null);

  useEffect(() => {
    // Fallback for SSR or old browsers that don't support IntersectionObserver
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
        setIsInView(true);
        return;
    }
      
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            if (placeholderRef.current) {
                observer.unobserve(placeholderRef.current);
            }
          }
        });
      },
      { rootMargin: '200px' } // Load images 200px before they enter the viewport
    );

    if (placeholderRef.current) {
      observer.observe(placeholderRef.current);
    }

    return () => {
      if (placeholderRef.current) {
         
        observer.unobserve(placeholderRef.current);
      }
    };
  }, []);

  return (
    <div ref={placeholderRef} className={`relative overflow-hidden ${wrapperClassName}`}>
      {/* Placeholder */}
      <motion.div
        animate={{ opacity: isLoaded ? 0 : 1 }}
        style={{ zIndex: 1, pointerEvents: 'none' }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 w-full h-full bg-neutral-800 flex items-center justify-center"
      >
        <Music className="w-12 h-12 text-neutral-700" />
      </motion.div>

      {/* Actual Image */}
      {isInView && (
        <motion.img
          src={src}
          alt={alt}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.7 }}
          onLoad={() => setIsLoaded(true)}
          className={`absolute inset-0 ${imageClassName}`}
          style={{ zIndex: 2 }}
        />
      )}
    </div>
  );
}