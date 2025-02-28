'use client';

import { motion } from "framer-motion";

interface LogoProps {
  className?: string;
  size?: number;
  animated?: boolean;
}

export function Logo({ className = "", size = 40, animated = true }: LogoProps) {
  return (
    <svg
      width={size * 5}
      height={size}
      viewBox="0 0 140 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Circle with S */}
      <motion.circle
        cx="20"
        cy="20"
        r="16"
        fill="url(#gradient)"
        initial={animated ? { opacity: 0 } : { opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      />
      
      <motion.path
        d="M26 16C26 12.6863 23.3137 10 20 10C16.6863 10 14 12.6863 14 16C14 19.3137 16.6863 22 20 22C23.3137 22 26 24.6863 26 28"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        initial={animated ? { pathLength: 0 } : { pathLength: 1 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />

      {/* Text */}
      <motion.text
        x="45"
        y="25"
        className="text-xl"
        style={{ fontFamily: 'system-ui' }}
        letterSpacing="0.02em"
        initial={animated ? { opacity: 0 } : { opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <tspan className="font-semibold" fill="#6366F1">smart</tspan>
        <tspan className="font-semibold italic" fill="#4F46E5">hr</tspan>
        <tspan className="font-semibold italic" fill="#7C3AED">flow</tspan>
      </motion.text>

      {/* Gradient Definition */}
      <defs>
        <linearGradient
          id="gradient"
          x1="4"
          y1="4"
          x2="36"
          y2="36"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
    </svg>
  );
} 