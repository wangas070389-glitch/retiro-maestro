'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"div"> {
    variant?: 'default' | 'glass' | 'outline';
    hoverEffect?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, variant = 'default', hoverEffect = false, ...props }, ref) => {

        const variants = {
            default: "bg-white border border-slate-200 shadow-sm",
            glass: "glass-panel text-slate-900 border-white/20",
            outline: "bg-transparent border border-slate-300 border-dashed"
        };

        const motionProps = hoverEffect ? {
            whileHover: { y: -4, transition: { duration: 0.2 } },
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.3 }
        } : {};

        return (
            <motion.div
                ref={ref}
                className={cn(
                    "rounded-xl p-6",
                    variants[variant],
                    className
                )}
                {...motionProps}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);

Card.displayName = "Card";
