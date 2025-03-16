import { AnimatePresence } from "framer-motion";

import { motion } from "framer-motion";
import { Sparkles, FileText, Brain } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";


// Update the loadingStates array with more engaging messages and colors
const loadingStates: Array<{
    icon: React.ComponentType<{ className?: string }>;
    message: string;
    color: string;
    bgColor: string;
  }> = [
      {
        icon: FileText,
        message: 'Preparing your resume...',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50'
      },
      {
        icon: Brain,
        message: 'AI is analyzing your experience...',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50'
      },
      {
        icon: Sparkles,
        message: 'Extracting your unique skills...',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50'
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
            className=""
        >
            <motion.div
                className={`p-8 shadow-lg transition-colors duration-500 ${loadingStates[loadingStateIndex].bgColor}`}
                animate={{
                    scale: [1, 1.02, 1],
                    transition: { duration: 2, repeat: Infinity }
                }}
            >
                <div className="flex items-center justify-center space-x-4">
                    <motion.div
                        animate={{
                            rotate: 360,
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                            scale: { duration: 1, repeat: Infinity }
                        }}
                        className={`rounded-full p-3 ${loadingStates[loadingStateIndex].bgColor}`}
                    >
                        {(() => {
                            const IconComponent = loadingStates[loadingStateIndex].icon;
                            return (
                                <IconComponent
                                    className={`h-12 w-12 ${loadingStates[loadingStateIndex].color}`}
                                />
                            );
                        })()}
                    </motion.div>
                    <motion.span
                        className={`text-2xl font-medium ${loadingStates[loadingStateIndex].color}`}
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        {loadingStates[loadingStateIndex].message}
                    </motion.span>
                </div>

                <div className="mt-6 space-y-3">
                    <div className="relative pt-1">
                        <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200">
                            <motion.div
                                className="transition-all duration-300 shadow-lg rounded-full bg-indigo-600"
                                style={{ width: `${progress}%` }}
                                animate={{
                                    background: [
                                        'bg-indigo-600'
                                    ]
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
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
                                className="text-md text-indigo-600 font-medium"
                                animate={{ opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                {loadingDetails[detailIndex]}
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>

                    <motion.div
                        className="flex justify-center space-x-1 pt-2"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <span className="w-2 h-2 bg-gray-400 rounded-full" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full" />
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
};