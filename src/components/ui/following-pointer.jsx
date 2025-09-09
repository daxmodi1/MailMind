import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue } from "motion/react";
import { cn } from "@/lib/utils";

export const FollowerPointerCard = ({
  children,
  className,
  title
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const ref = React.useRef(null);
  const [isInside, setIsInside] = useState(false);

  const handleMouseMove = useCallback((e) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      // Use relative positioning within the container
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;
      
      x.set(relativeX);
      y.set(relativeY);
    }
  }, [x, y]);
  
  const handleMouseLeave = useCallback(() => {
    setIsInside(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsInside(true);
  }, []);

  return (
    <div
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      style={{
        cursor: "none",
      }}
      ref={ref}
      className={cn("relative overflow-visible", className)}>
      <AnimatePresence>
        {isInside && <FollowPointer x={x} y={y} title={title} />}
      </AnimatePresence>
      {children}
    </div>
  );
};

export const FollowPointer = ({
  x,
  y,
  title
}) => {
  const colors = [
    "#0ea5e9",
    "#737373", 
    "#14b8a6",
    "#22c55e",
    "#3b82f6",
    "#ef4444",
    "#eab308",
  ];

  const [backgroundColor, setBackgroundColor] = useState(colors[0]);

  useEffect(() => {
    setBackgroundColor(colors[Math.floor(Math.random() * colors.length)]);
  }, []);

  return (
    <motion.div
      className="absolute z-50 h-4 w-4 rounded-full pointer-events-none"
      style={{
        top: y,
        left: x,
        translateX: "-50%",
        translateY: "-50%"
      }}
      initial={{
        scale: 1,
        opacity: 1,
      }}
      animate={{
        scale: 1,
        opacity: 1,
      }}
      exit={{
        scale: 0,
        opacity: 0,
      }}>
      <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="1"
        viewBox="0 0 16 16"
        className="h-6 w-6 -translate-x-[12px] -translate-y-[10px] -rotate-[70deg] transform stroke-sky-600 text-sky-500"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z"></path>
      </svg>
      <motion.div
        style={{
          backgroundColor: backgroundColor,
        }}
        initial={{
          scale: 0.5,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        exit={{
          scale: 0.5,
          opacity: 0,
        }}
        className="absolute top-4 left-4 min-w-max rounded-full bg-neutral-200 px-2 py-2 text-xs whitespace-nowrap text-white">
        {title || `William Shakespeare`}
      </motion.div>
    </motion.div>
  );
};