import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Star } from 'lucide-react';
import { ContactForm } from './ContactForm';

export const HeroSection: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formType, setFormType] = useState<'get_started' | 'custom_project'>('get_started');

  const handleButtonClick = (type: 'get_started' | 'custom_project') => {
    setFormType(type);
    setIsOpen(true);
  };

  return (
    <>
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/10 to-green-500/10 blur-3xl" />
          </div>

          <div className="relative">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              <span className="text-[#000000]">Build Cutting-Edge </span>
              <span className="text-[#1C61E7] inline-block animate-bounce-subtle">
                IoT
              </span>
              <span className="text-[#000000]"> & </span>
              <span className="text-[#21C15E] inline-block animate-bounce-subtle delay-150">
                ML Projects
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fade-in-up">
              Transform your academic journey with hands-on experience in IoT
              and ML projects tailored for student success!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up delay-300">
              <Button
                className="bg-[#1C61E7] hover:bg-[#1C61E7]/90 group transform hover:scale-105 transition-all duration-300"
                onClick={() => handleButtonClick('get_started')}
              >
                Get Started
                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                className="border-[#21C15E] text-[#21C15E] hover:bg-[#21C15E] hover:text-white group transform hover:scale-105 transition-all duration-300"
                onClick={() => handleButtonClick('custom_project')}
              >
                Request Custom Project
                <Star className="ml-2 h-4 w-4 group-hover:rotate-180 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <ContactForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        formType={formType}
      />
    </>
  );
};