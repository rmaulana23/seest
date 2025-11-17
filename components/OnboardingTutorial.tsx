
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../contexts/LanguageContext';
import { X, ChevronRight, Sparkles, Users, PlusCircle, Heart } from 'lucide-react';

interface OnboardingTutorialProps {
    onComplete: () => void;
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onComplete }) => {
    const { t } = useTranslation();
    const [step, setStep] = useState(0);

    const steps = [
        {
            icon: <Sparkles size={48} className="text-yellow-400" />,
            title: t('onboarding.welcome.title'),
            desc: t('onboarding.welcome.desc'),
        },
        {
            icon: <div className="p-2 bg-brand-100 rounded-xl"><Users size={48} className="text-brand-600" /></div>,
            title: t('onboarding.feed.title'),
            desc: t('onboarding.feed.desc'),
        },
        {
            icon: <PlusCircle size={48} className="text-brand-600" />,
            title: t('onboarding.create.title'),
            desc: t('onboarding.create.desc'),
        },
        {
            icon: <Heart size={48} className="text-red-500" />,
            title: t('onboarding.connect.title'),
            desc: t('onboarding.connect.desc'),
        },
    ];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            onComplete();
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
            <div className="max-w-sm w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden relative">
                <button 
                    onClick={onComplete} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10"
                >
                    <X size={24} />
                </button>

                <AnimatePresence mode="wait">
                    <motion.div 
                        key={step}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="p-8 flex flex-col items-center text-center min-h-[400px]"
                    >
                        <div className="mt-8 mb-6 transform scale-110">
                            {steps[step].icon}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">{steps[step].title}</h2>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-8">{steps[step].desc}</p>
                        
                        <div className="mt-auto w-full">
                            <div className="flex justify-center gap-2 mb-6">
                                {steps.map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-brand-600' : 'w-2 bg-gray-300 dark:bg-slate-600'}`}
                                    />
                                ))}
                            </div>
                            
                            <button 
                                onClick={handleNext}
                                className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all flex items-center justify-center gap-2 shadow-lg"
                            >
                                {step === steps.length - 1 ? t('onboarding.finish') : t('onboarding.next')}
                                {step !== steps.length - 1 && <ChevronRight size={18} />}
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
