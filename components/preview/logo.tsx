'use client';

import { motion } from "framer-motion";

interface LogoProps {
  className?: string;
  size?: number;
  animated?: boolean;
}

export function Logo({ className = "", size = 40, animated = true }: LogoProps) {
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { 
        duration: 1.5,
        ease: "easeInOut"
      }
    }
  };

  if (!animated) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Main Spiral Flow */}
        <path
          d="M32 20C32 13.3726 26.6274 8 20 8C13.3726 8 8 13.3726 8 20C8 26.6274 13.3726 32 20 32C24.4183 32 28.4183 29.3137 30.4183 25.3137C31.4183 23.3137 32 21.3137 32 20Z"
          stroke="url(#gradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Inner Dynamic Flow */}
        <path
          d="M26 20C26 16.6863 23.3137 14 20 14C16.6863 14 14 16.6863 14 20C14 23.3137 16.6863 26 20 26"
          stroke="url(#gradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Outer Ring */}
        <circle
          cx="20"
          cy="20"
          r="15"
          stroke="url(#gradient)"
          strokeWidth="1"
          strokeDasharray="2 4"
          opacity="0.4"
        />

        {/* Static Particles */}
        {[
          { cx: 32, cy: 20, r: 2 },
          { cx: 28, cy: 28, r: 1.8 },
          { cx: 20, cy: 32, r: 1.6 },
          { cx: 12, cy: 28, r: 1.4 }
        ].map((particle, index) => (
          <circle
            key={index}
            cx={particle.cx}
            cy={particle.cy}
            r={particle.r}
            fill="url(#gradient)"
            opacity="0.8"
          />
        ))}

        {/* Energy Lines */}
        {[15, 45, 75].map((rotation, index) => (
          <path
            key={index}
            d={`M20 20L${20 + 12 * Math.cos(rotation * Math.PI / 180)} ${20 + 12 * Math.sin(rotation * Math.PI / 180)}`}
            stroke="url(#gradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.6"
          />
        ))}

        {/* Gradient */}
        <defs>
          <linearGradient 
            id="gradient" 
            x1="8" 
            y1="8" 
            x2="32" 
            y2="32" 
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  const Component = motion.path;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Main Spiral Flow */}
      <Component
        d="M32 20C32 13.3726 26.6274 8 20 8C13.3726 8 8 13.3726 8 20C8 26.6274 13.3726 32 20 32C24.4183 32 28.4183 29.3137 30.4183 25.3137C31.4183 23.3137 32 21.3137 32 20Z"
        stroke="url(#gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        variants={pathVariants}
        initial="hidden"
        animate="visible"
      />

      {/* Inner Dynamic Flow */}
      <Component
        d="M26 20C26 16.6863 23.3137 14 20 14C16.6863 14 14 16.6863 14 20C14 23.3137 16.6863 26 20 26"
        stroke="url(#gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { 
            pathLength: 1, 
            opacity: 1,
            transition: { duration: 1.5, delay: 0.3 }
          }
        }}
        initial="hidden"
        animate="visible"
      />

      {/* Outer Energy Ring */}
      <motion.circle
        cx="20"
        cy="20"
        r="15"
        stroke="url(#gradient)"
        strokeWidth="1"
        strokeDasharray="2 4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 1, delay: 0.6 }}
      />

      {/* Dynamic Particles */}
      {[
        { cx: 32, cy: 20, r: 2, delay: 0, duration: 3, yOffset: 3 },
        { cx: 28, cy: 28, r: 1.8, delay: 0.5, duration: 2.5, yOffset: 2.5 },
        { cx: 20, cy: 32, r: 1.6, delay: 1, duration: 2.8, yOffset: 2 },
        { cx: 12, cy: 28, r: 1.4, delay: 1.5, duration: 3.2, yOffset: 2.2 }
      ].map((particle, index) => (
        <motion.circle
          key={index}
          cx={particle.cx}
          cy={particle.cy}
          r={particle.r}
          fill="url(#gradient)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7],
            rotate: [0, 360],
            x: [-particle.yOffset, particle.yOffset, -particle.yOffset],
            y: [particle.yOffset, -particle.yOffset, particle.yOffset]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.delay
          }}
        />
      ))}

      {/* Energy Lines */}
      {[15, 45, 75].map((rotation, index) => (
        <motion.path
          key={index}
          d={`M20 20L${20 + 12 * Math.cos(rotation * Math.PI / 180)} ${20 + 12 * Math.sin(rotation * Math.PI / 180)}`}
          stroke="url(#gradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
        />
      ))}

      {/* Enhanced Gradient */}
      <defs>
        <linearGradient 
          id="gradient" 
          x1="8" 
          y1="8" 
          x2="32" 
          y2="32" 
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
    </svg>
  );
} 