import React from 'react';
import { motion } from 'framer-motion';

interface SpaceAnimalProps {
  action: 'idle' | 'sleep' | 'hello' | 'left' | 'right' | 'jump' | 'hide' | 'read' | 'write';
  animal?: 'panda' | 'cat' | 'rabbit';
}

export const SpaceAnimal: React.FC<SpaceAnimalProps> = ({ action, animal = 'panda' }) => {
  const isJumping = action === 'jump';
  const isHello = action === 'hello';
  const isSleeping = action === 'sleep';
  const isReading = action === 'read';
  const isWriting = action === 'write';

  const emojis = {
    panda: '🐼',
    cat: '🐱',
    rabbit: '🐰'
  };

  const walkTransition = { repeat: Infinity, duration: 1.2, ease: "easeInOut" };

  const bodyVariant = {
    idle: { y: [0, -3, 0], transition: { repeat: Infinity, duration: 3, ease: "easeInOut" } },
    jump: { y: [0, -25, 0], transition: { repeat: Infinity, duration: 0.5, ease: "easeOut" } },
    sleep: { rotate: -90, x: -10, y: 15, scaleY: [1, 0.96, 1], transition: { repeat: Infinity, duration: 4, ease: "easeInOut" } },
    hello: { y: [0, -2, 0], transition: { repeat: Infinity, duration: 2, ease: "easeInOut" } },
    left: { y: [0, -4, 0, -4, 0], rotate: [2, 4, 2, 4, 2], transition: walkTransition },
    right: { y: [0, -4, 0, -4, 0], rotate: [2, 4, 2, 4, 2], transition: walkTransition },
    read: { y: [0, -1, 0], transition: { repeat: Infinity, duration: 3, ease: "easeInOut" } },
    write: { y: [0, -1, 0], transition: { repeat: Infinity, duration: 3, ease: "easeInOut" } },
  };

  const leftArmVariant = {
    idle: { rotate: [0, 5, 0], transition: { repeat: Infinity, duration: 4, ease: "easeInOut" } },
    jump: { rotate: -150, y: -5 },
    sleep: { rotate: 20 },
    hello: { rotate: [0, -120, -80, -120, -80, 0], transition: { duration: 1.5, repeat: isHello ? Infinity : 0, ease: "easeInOut" } },
    left: { rotate: [-25, 0, 25, 0, -25], transition: walkTransition },
    right: { rotate: [-25, 0, 25, 0, -25], transition: walkTransition },
    read: { rotate: -40, y: -2, transition: { duration: 0.5 } },
    write: { rotate: -20, y: -2, transition: { duration: 0.5 } },
  };

  const rightArmVariant = {
    idle: { rotate: [0, -5, 0], transition: { repeat: Infinity, duration: 4, ease: "easeInOut" } },
    jump: { rotate: 150, y: -5 },
    sleep: { rotate: -20 },
    hello: { rotate: [0, 20, 0], transition: { repeat: Infinity, duration: 2, ease: "easeInOut" } },
    left: { rotate: [25, 0, -25, 0, 25], transition: walkTransition },
    right: { rotate: [25, 0, -25, 0, 25], transition: walkTransition },
    read: { rotate: 40, y: -2, transition: { duration: 0.5 } },
    write: { rotate: [25, 45, 25, 50, 25], transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" } },
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
    read: { rotate: 15, y: 3, transition: { duration: 0.5 } },
    write: { rotate: 15, y: 3, transition: { duration: 0.5 } },
  };

  return (
    <motion.svg
      viewBox="0 0 100 100"
      className="w-full h-full overflow-visible"
      animate={action}
      variants={bodyVariant}
      style={{ transformOrigin: '50px 100px' }}
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

      {/* SPACE SUIT BODY (Drawn before arms so arms render in front) */}
      <rect x="35" y="45" width="30" height="30" rx="10" fill="#f8fafc" />
      <rect x="35" y="65" width="30" height="4" fill="#64748b" />
      <rect x="47" y="63" width="6" height="8" rx="1" fill="#3b82f6" />
      <circle cx="50" cy="55" r="4" fill="#ef4444" />
      <circle cx="50" cy="55" r="2" fill="#fca5a5" />

      {/* BOOK PROP */}
      {isReading && (
        <motion.g initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
          <rect x="34" y="55" width="16" height="12" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" transform="rotate(-5 36 55)" />
          <rect x="50" y="55" width="16" height="12" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" transform="rotate(5 50 55)" />
          <line x1="50" y1="55" x2="50" y2="67" stroke="#94a3b8" strokeWidth="1" />
        </motion.g>
      )}

      {/* PAPER PROP */}
      {isWriting && (
        <motion.g initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
          <rect x="40" y="52" width="20" height="25" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" rx="1" />
          <line x1="43" y1="57" x2="57" y2="57" stroke="#cbd5e1" strokeWidth="1" />
          <line x1="43" y1="62" x2="57" y2="62" stroke="#cbd5e1" strokeWidth="1" />
          <line x1="43" y1="67" x2="53" y2="67" stroke="#cbd5e1" strokeWidth="1" />
        </motion.g>
      )}

      {/* SPACE SUIT ARMS */}
      <motion.g variants={leftArmVariant} style={{ transformOrigin: '30px 45px' }}>
        <rect x="25" y="45" width="10" height="25" rx="5" fill="#e2e8f0" />
        <circle cx="30" cy="65" r="5" fill="#94a3b8" />
      </motion.g>

      <motion.g variants={rightArmVariant} style={{ transformOrigin: '70px 45px' }}>
        <rect x="65" y="45" width="10" height="25" rx="5" fill="#e2e8f0" />
        <circle cx="70" cy="65" r="5" fill="#94a3b8" />
        {isWriting && (
          <g>
            <rect x="68" y="55" width="4" height="15" fill="#fbbf24" transform="rotate(20 68 60)" />
            <polygon points="66,70 70,70 68,75" fill="#1e293b" transform="rotate(20 68 60)" />
          </g>
        )}
      </motion.g>

      {/* HEAD GROUP with Hand-Drawn Ultra-Cute Face */}
      <motion.g variants={headVariant} style={{ transformOrigin: '50px 45px' }}>
        {/* Helmet Interior / Head Base */}
        <circle cx="50" cy="30" r="22" fill="#ffffff" />

        {animal === 'panda' ? (
          <g>
            {/* Ears */}
            <circle cx="34" cy="16" r="7.5" fill="#1e293b" />
            <circle cx="66" cy="16" r="7.5" fill="#1e293b" />

            {/* Eye Patches */}
            <ellipse cx="40" cy="29" rx="6.5" ry="8.5" fill="#1e293b" transform="rotate(-20 40 29)" />
            <ellipse cx="60" cy="29" rx="6.5" ry="8.5" fill="#1e293b" transform="rotate(20 60 29)" />

            {/* Eyes */}
            {isSleeping ? (
              <>
                <path d="M 36 30 Q 40 33 44 30" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
                <path d="M 56 30 Q 60 33 64 30" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
              </>
            ) : (
              <>
                {/* Anime Glints */}
                <circle cx="41.5" cy="27" r="2.5" fill="white" />
                <circle cx="38" cy="31" r="1.2" fill="white" />

                <circle cx="58.5" cy="27" r="2.5" fill="white" />
                <circle cx="62" cy="31" r="1.2" fill="white" />
              </>
            )}

            {/* Blush */}
            <circle cx="32" cy="36" r="4" fill="#fca5a5" opacity="0.5" />
            <circle cx="68" cy="36" r="4" fill="#fca5a5" opacity="0.5" />

            {/* Nose */}
            <ellipse cx="50" cy="35" rx="3.5" ry="2.5" fill="#1e293b" />

            {/* Mouth */}
            {!isSleeping && (
              isHello ? (
                /* Happy Open Mouth */
                <path d="M 46 37 Q 50 44 54 37 Z" fill="#ef4444" stroke="#1e293b" strokeWidth="1" strokeLinejoin="round" />
              ) : (
                /* Cute W Smile */
                <path d="M 45 37.5 Q 47.5 40 50 37.5 Q 52.5 40 55 37.5" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              )
            )}
          </g>
        ) : (
          /* The Cute Animal Emoji fallback for others */
          <text
            x="50"
            y="38"
            fontSize="24"
            textAnchor="middle"
            style={{ filter: isSleeping ? 'grayscale(100%) opacity(0.8)' : 'none' }}
          >
            {isSleeping ? '😴' : emojis[animal]}
          </text>
        )}

        {/* Helmet Glass Overlay */}
        <circle cx="50" cy="30" r="22" fill="#bae6fd" opacity="0.4" />

        {/* Helmet Glare */}
        <path d="M 33 22 Q 40 12 55 12" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
      </motion.g>

    </motion.svg>
  );
};
