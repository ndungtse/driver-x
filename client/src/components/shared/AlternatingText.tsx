'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const loginTexts = [
  {
    title: 'Track Every Mile',
    description: 'Keep detailed records of your driving hours and compliance status.'
  },
  {
    title: 'Stay Compliant',
    description: 'Automated HOS validation ensures you meet FMCSA regulations.'
  },
  {
    title: 'Simplify Logging',
    description: 'Digital logbook that replaces paper with modern efficiency.'
  }
];

const registerTexts = [
  {
    title: 'Join Professional Drivers',
    description: 'Start managing your hours of service with industry-leading tools.'
  },
  {
    title: 'Automated Compliance',
    description: 'Never worry about logbook violations with intelligent validation.'
  },
  {
    title: 'Your Journey Starts Here',
    description: 'Complete your registration and begin tracking your routes today.'
  }
];

export function AlternatingText() {
  const pathname = usePathname();
  const isLogin = pathname?.includes('/login');
  const texts = isLogin ? loginTexts : registerTexts;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % texts.length);
        setIsVisible(true);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [texts.length]);

  const currentText = texts[currentIndex];

  return (
    <div className="flex flex-col justify-center h-full px-8 lg:px-16">
      <div className="max-w-md">
        <h1 className="text-4xl lg:text-5xl font-bold mb-6">
          <span
            key={currentIndex}
            className={`inline-block transition-all duration-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {currentText.title}
          </span>
        </h1>
        <p
          key={`desc-${currentIndex}`}
          className={`text-lg lg:text-xl text-muted-foreground transition-all duration-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {currentText.description}
        </p>
        <div className="mt-8 flex gap-2">
          {texts.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => {
                  setCurrentIndex(index);
                  setIsVisible(true);
                }, 300);
              }}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-primary'
                  : 'w-1.5 bg-muted-foreground/30'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
