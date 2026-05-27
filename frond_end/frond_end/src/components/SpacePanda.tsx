import React from 'react';
import { motion } from 'framer-motion';

interface SpacePandaProps {
  action: 'idle' | 'sleep' | 'hello' | 'left' | 'right' | 'jump' | 'hide';
}

export const SpacePanda: React.FC<SpacePandaProps> = ({ action }) => {
  const isSleeping = action === 'sleep';
  const isJumping = action === 'jump';
  const isHello = action === 'hello';

  const walkTransition = { repeat: Infinity, duration: 1.2, ease: "easeInOut" };

  const bodyVariant = {
    idle: { y: [0, -3, 0], transition: { repeat: Infinity, duration: 3, ease: "easeInOut" } },
    jump: { y: [0, -25, 0], transition: { repeat: Infinity, duration: 0.5, ease: "easeOut" } },
    sleep: { y: 2, scaleY: [1, 0.96, 1], transition: { repeat: Infinity, duration: 4, ease: "easeInOut" } },
    hello: { y: [0, -2, 0], transition: { repeat: Infinity, duration: 2, ease: "easeInOut" } },
    left: { y: [0, -4, 0, -4, 0], rotate: [2, 4, 2, 4, 2], transition: walkTransition },
    right: { y: [0, -4, 0, -4, 0], rotate: [2, 4, 2, 4, 2], transition: walkTransition },
  };

  const leftArmVariant = {
    idle: { rotate: [0, 5, 0], transition: { repeat: Infinity, duration: 4, ease: "easeInOut" } },
    jump: { rotate: -150, y: -5 },
    sleep: { rotate: 20 },
    hello: { rotate: [0, -120, -80, -120, -80, 0], transition: { duration: 1.5, repeat: isHello ? Infinity : 0, ease: "easeInOut" } },
    left: { rotate: [-25, 0, 25, 0, -25], transition: walkTransition },
    right: { rotate: [-25, 0, 25, 0, -25], transition: walkTransition },
  };

  const rightArmVariant = {
    idle: { rotate: [0, -5, 0], transition: { repeat: Infinity, duration: 4, ease: "easeInOut" } },
    jump: { rotate: 150, y: -5 },
    sleep: { rotate: -20 },
    hello: { rotate: [0, 20, 0], transition: { repeat: Infinity, duration: 2, ease: "easeInOut" } },
    left: { rotate: [25, 0, -25, 0, 25], transition: walkTransition },
    right: { rotate: [25, 0, -25, 0, 25], transition: walkTransition },
  };

  const leftLegVariant = {
    idle: { rotate: 0 },
    jump: { rotate: -20 },
    sleep: { rotate: 0 },
    hello: { rotate: 0 },
    hide: { rotate: 0 },
    left: { rotate: [25, 0, -25, 0, 25], y: [0, 0, 0, -6, 0], transition: walkTransition },
    right: { rotate: [25, 0, -25, 0, 25], y: [0, 0, 0, -6, 0], transition: walkTransition },
  };

  const rightLegVariant = {
    idle: { rotate: 0 },
    jump: { rotate: 20 },
    sleep: { rotate: 0 },
    hello: { rotate: 0 },
    hide: { rotate: 0 },
    left: { rotate: [-25, 0, 25, 0, -25], y: [0, -6, 0, 0, 0], transition: walkTransition },
    right: { rotate: [-25, 0, 25, 0, -25], y: [0, -6, 0, 0, 0], transition: walkTransition },
  };

  const headVariant = {
    idle: { rotate: [0, -2, 0, 2, 0], transition: { repeat: Infinity, duration: 6, ease: "easeInOut" } },
    jump: { rotate: 0 },
    sleep: { rotate: 15, y: 3 },
    hello: { rotate: -10, transition: { type: "spring" } },
    left: { rotate: [0, 2, 0, 2, 0], y: [0, 1, 0, 1, 0], transition: walkTransition },
    right: { rotate: [0, 2, 0, 2, 0], y: [0, 1, 0, 1, 0], transition: walkTransition },
  };

  const eyeVariant = {
    sleep: { scaleY: 0.1 },
    idle: { scaleY: 1 },
    hello: { scaleY: 1 },
    left: { scaleY: 1 },
    right: { scaleY: 1 },
    jump: { scaleY: 1 },
  };

  return (
    <motion.svg 
      viewBox="0 0 100 100" 
      className="w-full h-full overflow-visible"
      animate={action}
      variants={bodyVariant}
      style={{ originX: 0.5, originY: 1 }}
    >
      {/* Background Glow / Jetpack trail if jumping */}
      {isJumping && (
        <motion.ellipse 
          cx="50" cy="95" rx="15" ry="5" fill="#3b82f6" 
          animate={{ opacity: [0.8, 0, 0.8], scale: [1, 1.5, 1] }} 
          transition={{ repeat: Infinity, duration: 0.6 }}
        />
      )}

      {/* SPACE SUIT LEGS */}
      <motion.g variants={leftLegVariant} style={{ transformOrigin: '40px 70px' }}>
        <rect x="35" y="70" width="10" height="20" rx="4" fill="#e2e8f0" />
        <path d="M33 85 h14 v6 a3 3 0 0 1 -3 3 h-8 a3 3 0 0 1 -3 -3 v-6" fill="#94a3b8" />
      </motion.g>
      <motion.g variants={rightLegVariant} style={{ transformOrigin: '60px 70px' }}>
        <rect x="55" y="70" width="10" height="20" rx="4" fill="#e2e8f0" />
        <path d="M53 85 h14 v6 a3 3 0 0 1 -3 3 h-8 a3 3 0 0 1 -3 -3 v-6" fill="#94a3b8" />
      </motion.g>

      {/* SPACE SUIT ARMS */}
      {/* Left Arm - waving in hello */}
      <motion.g variants={leftArmVariant} style={{ transformOrigin: '30px 45px' }}>
        <rect x="25" y="45" width="10" height="25" rx="5" fill="#e2e8f0" />
        <circle cx="30" cy="65" r="5" fill="#94a3b8" />
      </motion.g>

      {/* Right Arm */}
      <motion.g variants={rightArmVariant} style={{ transformOrigin: '70px 45px' }}>
        <rect x="65" y="45" width="10" height="25" rx="5" fill="#e2e8f0" />
        <circle cx="70" cy="65" r="5" fill="#94a3b8" />
      </motion.g>

      {/* SPACE SUIT BODY */}
      <rect x="35" y="45" width="30" height="30" rx="10" fill="#f8fafc" />
      {/* Suit Belt */}
      <rect x="35" y="65" width="30" height="4" fill="#64748b" />
      <rect x="47" y="63" width="6" height="8" rx="1" fill="#3b82f6" />
      {/* Chest Logo */}
      <circle cx="50" cy="55" r="4" fill="#ef4444" />
      <circle cx="50" cy="55" r="2" fill="#fca5a5" />

      {/* HEAD GROUP */}
      <motion.g variants={headVariant} style={{ originX: '50px', originY: '45px' }}>
        {/* Helmet back / glass */}
        <circle cx="50" cy="30" r="22" fill="#bae6fd" opacity="0.4" />
        
        {/* PANDA HEAD */}
        <circle cx="50" cy="30" r="18" fill="white" />
        
        {/* Ears */}
        <circle cx="35" cy="18" r="6" fill="#1e293b" />
        <circle cx="65" cy="18" r="6" fill="#1e293b" />
        
        {/* Eye patches */}
        <ellipse cx="42" cy="28" rx="5" ry="6" fill="#1e293b" transform="rotate(-15 42 28)" />
        <ellipse cx="58" cy="28" rx="5" ry="6" fill="#1e293b" transform="rotate(15 58 28)" />
        
        {/* Eyes (animate closed for sleep) */}
        <motion.circle cx="42" cy="28" r="2" fill="white" variants={eyeVariant} />
        <motion.circle cx="58" cy="28" r="2" fill="white" variants={eyeVariant} />
        
        {/* Nose */}
        <ellipse cx="50" cy="35" rx="3" ry="2" fill="#1e293b" />
        {/* Mouth */}
        {!isSleeping && <path d="M 47 38 Q 50 40 53 38" stroke="#1e293b" strokeWidth="1.5" fill="none" />}
        {isSleeping && <path d="M 47 38 Q 50 38 53 38" stroke="#1e293b" strokeWidth="1.5" fill="none" />}

        {/* Helmet front glare */}
        <path d="M 33 22 Q 40 12 55 12" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
      </motion.g>

    </motion.svg>
  );
};
