import React from 'react';
import { motion } from 'framer-motion';

export function Skeleton({ className = '', variant = 'rectangular' }) {
    const baseClass = "bg-white/5 animate-pulse rounded-lg relative overflow-hidden";
    
    const variants = {
        circular: "rounded-full",
        text: "h-4 w-full",
        title: "h-8 w-3/4",
        rectangular: "h-24 w-full"
    };
    
    return (
        <div className={`${baseClass} ${variants[variant]} ${className}`}>
            <motion.div
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ translateX: ['100%', '-100%'] }}
                transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "linear"
                }}
            />
        </div>
    );
}

export function TripCardSkeleton() {
    return (
        <div className="card glass p-0 overflow-hidden h-[300px] flex flex-col">
            <Skeleton variant="rectangular" className="h-40 rounded-none rounded-t-xl" />
            <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                    <Skeleton variant="title" className="h-6" />
                    <Skeleton variant="text" className="w-1/2" />
                </div>
                <div className="flex justify-between mt-4">
                    <Skeleton variant="circular" className="h-8 w-8" />
                    <Skeleton variant="circular" className="h-8 w-8" />
                </div>
            </div>
        </div>
    );
}

export function DaySkeleton() {
    return (
        <div className="mb-8 bg-dark-900/40 rounded-xl p-4 border border-white/5">
            <Skeleton variant="title" className="h-6 w-48 mb-4" />
            <div className="space-y-4">
                <Skeleton variant="rectangular" className="h-24" />
                <Skeleton variant="rectangular" className="h-24" />
            </div>
        </div>
    );
}
