import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// INGA UNGA SPIDERMAN IMAGES-ODA EXACT PATH-A KODUKKANUM
// Example: Unga public folder-la 'spiderman' nu oru folder pottu athula images vekkalam
const SPRITES = {
  idle: '/spiderman/shime1.png',      // Nikkura image
  walk_1: '/spiderman/shime2.png',    // Nadakkura image 1
  walk_2: '/spiderman/shime3.png',    // Nadakkura image 2
  sit: '/spiderman/shime11.png',      // Ukkarum image
  climb_1: '/spiderman/shime13.png',  // Suvarula erura image 1
  climb_2: '/spiderman/shime14.png',  // Suvarula erura image 2
  fall: '/spiderman/shime4.png',      // Keezhe vizhum image
  ceiling: '/spiderman/shime12.png',  // Thalaikeezha nadakkum image
};

type Action = 'idle' | 'walk' | 'climb' | 'fall' | 'ceiling' | 'sit';

export const SpidermanShimeji: React.FC = () => {
  const [x, setX] = useState(window.innerWidth / 2);
  const [y, setY] = useState(window.innerHeight / 2);
  const [action, setAction] = useState<Action>('fall');
  const [direction, setDirection] = useState<1 | -1>(1);
  const [frameTick, setFrameTick] = useState(0); 

  const size = 100; // Character size (ungalukku ethamathiri mathikkalam)

  const stateRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    action: 'fall' as Action,
    direction: 1 as 1 | -1,
    vy: 0,
    vx: 0,
  });

  useEffect(() => {
    let animationFrame: number;
    let lastTime = performance.now();
    let actionTimer = 0;
    let frameTimer = 0;

    const update = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      actionTimer -= dt;
      frameTimer += dt;

      // 0.2 seconds-ku oru thadava image-a mathi animation create panrom
      if (frameTimer > 0.2) {
        setFrameTick((prev) => (prev === 0 ? 1 : 0));
        frameTimer = 0;
      }

      const state = stateRef.current;
      const w = window.innerWidth;
      const h = window.innerHeight;

      if (state.action === 'fall') {
        state.vy += 1500 * dt; // Gravity
        state.y += state.vy * dt;
        if (state.y >= h - size) {
          state.y = h - size;
          state.vy = 0;
          state.action = 'sit';
          actionTimer = 2 + Math.random() * 2;
        }
      } else if (state.action === 'idle' || state.action === 'sit') {
        if (actionTimer <= 0) {
          const rand = Math.random();
          if (rand < 0.5) {
            state.action = 'walk';
            state.direction = Math.random() > 0.5 ? 1 : -1;
            actionTimer = 2 + Math.random() * 3;
          } else {
            state.action = state.action === 'idle' ? 'sit' : 'idle';
            actionTimer = 2 + Math.random() * 2;
          }
        }
      } else if (state.action === 'walk') {
        const speed = 120;
        state.x += speed * state.direction * dt;
        
        if (state.x <= 0) {
          state.x = 0;
          state.action = 'climb';
          state.direction = -1; // Left wall climb
          actionTimer = 3;
        } else if (state.x >= w - size) {
          state.x = w - size;
          state.action = 'climb';
          state.direction = 1; // Right wall climb
          actionTimer = 3;
        }

        if (actionTimer <= 0) {
          state.action = 'idle';
          actionTimer = 1 + Math.random() * 2;
        }
      } else if (state.action === 'climb') {
        const speed = 100;
        state.y -= speed * dt; 

        if (state.y <= 0) {
          state.y = 0;
          state.action = 'ceiling';
          state.direction = state.x < w / 2 ? 1 : -1;
          actionTimer = 3 + Math.random() * 4;
        }

        if (actionTimer <= 0 && state.y > size) {
          state.action = 'fall';
        }
      } else if (state.action === 'ceiling') {
        const speed = 120;
        state.x += speed * state.direction * dt;

        if (state.x <= 0 || state.x >= w - size) {
          state.action = 'fall';
        }

        if (actionTimer <= 0) {
          state.action = 'fall';
        }
      }

      setX(state.x);
      setY(state.y);
      setDirection(state.direction);
      setAction(state.action);

      animationFrame = requestAnimationFrame(update);
    };

    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Action-ku etha mathiri correct-aana image-a select panrathu
  let currentImage = SPRITES.idle;
  if (action === 'sit') currentImage = SPRITES.sit;
  if (action === 'fall') currentImage = SPRITES.fall;
  if (action === 'walk') currentImage = frameTick === 0 ? SPRITES.walk_1 : SPRITES.walk_2;
  if (action === 'climb') currentImage = frameTick === 0 ? SPRITES.climb_1 : SPRITES.climb_2;
  if (action === 'ceiling') currentImage = frameTick === 0 ? SPRITES.walk_1 : SPRITES.walk_2; 

  // Wall / Ceiling-la pogum pothu character-a rotate panrathu
  let containerRotation = 0;
  if (action === 'climb') containerRotation = direction === 1 ? -90 : 90;
  if (action === 'ceiling') containerRotation = 180;

  return (
    <div 
      style={{
        position: 'fixed',
        left: x,
        top: y,
        width: size,
        height: size,
        zIndex: 99999,
        pointerEvents: 'none', 
      }}
    >
      <motion.img
        src={currentImage}
        alt="Spiderman Shimeji"
        animate={{
          rotate: containerRotation,
          scaleX: action === 'climb' || action === 'ceiling' ? 1 : direction, // Left/Right thirumbarathukku
        }}
        transition={{ duration: 0.2 }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: 'drop-shadow(0px 5px 10px rgba(0,0,0,0.4))', // Nalla real effect-ku shadow
          transformOrigin: 'center center'
        }}
      />
    </div>
  );
};