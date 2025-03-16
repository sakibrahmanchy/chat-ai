import { AnimatePresence } from "framer-motion";

import { motion } from "framer-motion";
import { Sparkles, FileText, Brain } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";


// Update the loadingStates array with more minimal styling
const loadingStates: Array<{
    icon: React.ComponentType<{ className?: string }>;
    message: string;
    color: string;
    bgColor: string;
  }> = [
      {
        icon: FileText,
        message: 'Preparing your resume...',
        color: 'text-primary',
        bgColor: 'bg-primary/10'
      },
      {
        icon: Brain,
        message: 'AI is analyzing your experience...',
        color: 'text-primary',
        bgColor: 'bg-primary/10'
      },
      {
        icon: Sparkles,
        message: 'Extracting your unique skills...',
        color: 'text-primary',
        bgColor: 'bg-primary/10'
      },
    ];
  
  const loadingDetails = [
    'This can take upto 20-30 seconds at max.',
    'Identifying key qualifications',
    'Analyzing work experience',
    'Extracting relevant skills',
    'Matching with job requirements'
  ];

export const ResumeProcessingAnimation = () => {
    const [progress, setProgress] = useState(0);
    const [loadingStateIndex, setLoadingStateIndex] = useState(0);
    const [detailIndex, setDetailIndex] = useState(0);

    useEffect(() => {
          // Rotate loading states
          const stateInterval = setInterval(() => {
            setLoadingStateIndex(prev => (prev + 1) % loadingStates.length);
          }, 3000);
    
          // Rotate detail messages
          const detailInterval = setInterval(() => {
            setDetailIndex(prev => (prev + 1) % loadingDetails.length);
          }, 2000);
    
          // Progress bar animation
          const progressInterval = setInterval(() => {
            setProgress(prev => {
              if (prev >= 90) return prev;
              return prev + 1;
            });
          }, 200);
    
          return () => {
            clearInterval(stateInterval);
            clearInterval(detailInterval);
            clearInterval(progressInterval);
          };
      }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
        >
            <motion.div
                className={`p-8 rounded-xl shadow-lg bg-gradient-to-br from-background to-primary/5 backdrop-blur-sm transition-colors duration-500`}
                animate={{
                    scale: [1, 1.02, 1],
                    transition: { duration: 3, repeat: Infinity }
                }}
            >
                <div className="flex items-center justify-center space-x-5">
                    <motion.div
                        animate={{
                            rotate: 360,
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                            scale: { duration: 2, repeat: Infinity }
                        }}
                        className={`rounded-full p-4 bg-primary/10 shadow-xl ring-1 ring-primary/20`}
                    >
                        {(() => {
                            const IconComponent = loadingStates[loadingStateIndex].icon;
                            return (
                                <IconComponent
                                    className={`h-10 w-10 ${loadingStates[loadingStateIndex].color}`}
                                />
                            );
                        })()}
                    </motion.div>
                    <motion.span
                        className={`text-xl font-medium ${loadingStates[loadingStateIndex].color}`}
                        animate={{ opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        {loadingStates[loadingStateIndex].message}
                    </motion.span>
                </div>

                <div className="mt-8 space-y-6">
                    <div className="relative">
                        <div className="overflow-hidden h-2 rounded-full bg-muted/50">
                            <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary"
                                style={{ width: `${progress}%` }}
                                animate={{
                                    opacity: [0.8, 1, 0.8]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={detailIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-center"
                        >
                            <motion.div
                                className="text-base text-muted-foreground/80"
                                animate={{ opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                {loadingDetails[detailIndex]}
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>

                    <motion.div
                        className="flex justify-center space-x-2"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <motion.span 
                            className="w-2 h-2 bg-primary/40 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        />
                        <motion.span 
                            className="w-2 h-2 bg-primary/40 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.span 
                            className="w-2 h-2 bg-primary/40 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        />
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
};