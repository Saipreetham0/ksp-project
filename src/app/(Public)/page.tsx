"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
// import Image from "next/image";

// import { AuthButton } from '@/components/AuthButton';
import { redirect } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  MessageSquare,
  Users,
  Clock,
  Award,
  Coffee,
  Video,
  Package,
  ThumbsUp,
  Star,
  Send,
  Quote,
  GraduationCap,
  Laptop,
  BrainCircuit,
  Rocket,
} from "lucide-react";
import { HeroSection } from "@/components/HeroSection";
import { useAuth } from "@/hooks/useAuth";

const ProcessExplanation = () => {
  const steps = [
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Project Selection",
      subtitle: "Step 1",
      description: "Choose from our catalog or share your custom idea",
    },
    {
      icon: <Package className="h-8 w-8" />,
      title: "Development",
      subtitle: "Step 2",
      description: "We design and develop according to requirements",
    },
    {
      icon: <ThumbsUp className="h-8 w-8" />,
      title: "Feedback",
      subtitle: "Step 3",
      description: "Share feedback for refinements",
    },
    {
      icon: <Video className="h-8 w-8" />,
      title: "Explanation",
      subtitle: "Step 4",
      description: "Detailed walkthrough via Zoom/Meet",
    },
    {
      icon: <Send className="h-8 w-8" />,
      title: "Delivery",
      subtitle: "Step 5",
      description: "Nationwide shipping across India",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">How It Works</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Our streamlined process ensures your project is delivered efficiently
          and effectively
        </p>
      </div>

      {/* Desktop Process Flow */}
      <div className="hidden lg:block relative">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#1C61E7] to-[#21C15E] transform -translate-y-1/2" />

        <div className="grid grid-cols-5 gap-8 relative">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Vertical Line */}
              <div className="absolute top-[76px] left-1/2 h-8 w-0.5 bg-[#1C61E7] transform -translate-x-1/2" />

              {/* Icon Circle */}
              <div className="relative flex justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1C61E7] to-[#21C15E] p-0.5 transform group-hover:scale-110 transition-transform duration-300">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <div className="text-[#1C61E7]">{step.icon}</div>
                  </div>
                </div>
              </div>

              {/* Content Card */}
              <div className="mt-8 text-center transform group-hover:-translate-y-1 transition-transform duration-300">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <span className="text-sm font-medium text-[#21C15E] mb-2 block">
                    {step.subtitle}
                  </span>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Process Flow */}
      <div className="lg:hidden space-y-8">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1C61E7] to-[#21C15E] p-0.5">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                  <div className="text-[#1C61E7]">
                    {React.cloneElement(step.icon, { className: "h-6 w-6" })}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-grow">
              <span className="text-sm font-medium text-[#21C15E] mb-1 block">
                {step.subtitle}
              </span>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FAQSection = () => {
  return (
    <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
      <AccordionItem value="item-1">
        <AccordionTrigger>
          How long does it take to complete a project?
        </AccordionTrigger>
        <AccordionContent>
          Project timelines vary based on complexity. Basic projects typically
          take 2-3 weeks, while advanced custom projects may take 4-6 weeks.
          We&asop;ll provide a specific timeline during consultation.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>
          Do you provide source code and documentation?
        </AccordionTrigger>
        <AccordionContent>
          Yes, all projects include complete source code, detailed
          documentation, and video explanations to help you understand the
          implementation thoroughly.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>
          Can I modify the project after delivery?
        </AccordionTrigger>
        <AccordionContent>
          Yes, you&asop;ll have full access to the source code and can modify
          it. We also offer post-delivery support if you need help with
          modifications.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4">
        <AccordionTrigger>How do you handle project delivery?</AccordionTrigger>
        <AccordionContent>
          We deliver projects nationwide across India. Hardware components are
          shipped securely, and software components are delivered via secure
          download links.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-5">
        <AccordionTrigger>
          What kind of support do you provide?
        </AccordionTrigger>
        <AccordionContent>
          We provide comprehensive support including project setup,
          troubleshooting, and modifications. Support duration varies by
          package, ranging from 1 to 6 months.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

interface Category {
  id: string;
  label: string;
  icon: JSX.Element;
}

const SearchProjects = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);

  const categories: Category[] = [
    { id: "iot", label: "IoT Projects", icon: <Laptop className="w-4 h-4" /> },
    {
      id: "ml",
      label: "ML Projects",
      icon: <BrainCircuit className="w-4 h-4" />,
    },
    { id: "robotics", label: "Robotics", icon: <Rocket className="w-4 h-4" /> },
    {
      id: "vision",
      label: "Computer Vision",
      icon: <GraduationCap className="w-4 h-4" />,
    },
  ];

  const popularSearches: string[] = [
    "Smart Home Automation",
    "Face Recognition",
    "Weather Prediction",
    "Robot Navigation",
  ];

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="relative max-w-3xl mx-auto">
      <div
        className={`relative transition-all duration-300 ${
          isSearchFocused ? "transform -translate-y-2" : ""
        }`}
      >
        <div className="relative group">
          <Search
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
              isSearchFocused ? "text-[#1C61E7]" : "text-gray-400"
            }`}
          />
          <Input
            type="text"
            placeholder="What kind of project are you looking for?"
            className="w-full pl-12 pr-4 py-6 rounded-xl border-2 border-gray-200 focus:border-[#1C61E7] transition-all duration-300 text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </div>

        {/* Popular Searches */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Popular:</span>
          {popularSearches.map((search) => (
            <button
              key={search}
              onClick={() => setSearchTerm(search)}
              className="text-sm text-[#1C61E7] hover:text-[#21C15E] transition-colors duration-300"
            >
              {search}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => toggleCategory(category.id)}
            className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
              selectedCategories.includes(category.id)
                ? "border-[#1C61E7] bg-[#1C61E7]/5 text-[#1C61E7]"
                : "border-gray-200 hover:border-[#1C61E7] hover:bg-[#1C61E7]/5"
            }`}
          >
            {category.icon}
            <span className="text-sm font-medium">{category.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const LandingPage = () => {


  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    redirect('/dashboard');
  }

  const features = [
    {
      title: "End-to-End Guidance",
      description: "Complete support from concept to implementation",
      icon: <Users className="h-6 w-6 text-[#1C61E7]" />,
    },
    {
      title: "24/7 Support",
      description: "Round-the-clock technical assistance",
      icon: <Clock className="h-6 w-6 text-[#1C61E7]" />,
    },
    {
      title: "Expert Team",
      description: "Experienced professionals in IoT and ML",
      icon: <Award className="h-6 w-6 text-[#1C61E7]" />,
    },
    {
      title: "Hands-on Learning",
      description: "Practical experience with cutting-edge technology",
      icon: <Coffee className="h-6 w-6 text-[#1C61E7]" />,
    },
  ];

  const projects = [
    {
      title: "IoT Home Automation",
      category: "Internet of Things",
      description: "Smart home solutions with remote monitoring capabilities",
    },
    {
      title: "Predictive Analytics",
      category: "Machine Learning",
      description: "Data-driven insights for business decision making",
    },
    {
      title: "Smart Agriculture",
      category: "IoT & ML",
      description: "Automated farming solutions with ML-powered insights",
    },
  ];

  // const HeroSection = () => {
  //   return (
  //     <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
  //       <div className="max-w-7xl mx-auto text-center relative">
  //         <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-full">
  //           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/10 to-green-500/10 blur-3xl" />
  //         </div>

  //         <div className="relative">
  //           <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
  //             <span className="text-[#000000]">Build Cutting-Edge </span>
  //             <span className="text-[#1C61E7] inline-block animate-bounce-subtle">
  //               IoT
  //             </span>
  //             <span className="text-[#000000]"> & </span>
  //             <span className="text-[#21C15E] inline-block animate-bounce-subtle delay-150">
  //               ML Projects
  //             </span>
  //           </h1>
  //           <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fade-in-up">
  //             Transform your academic journey with hands-on experience in IoT
  //             and ML projects tailored for student success!
  //           </p>
  //           <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up delay-300">
  //             <Button className="bg-[#1C61E7] hover:bg-[#1C61E7]/90 group transform hover:scale-105 transition-all duration-300">
  //               Get Started
  //               <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
  //             </Button>
  //             <Button
  //               variant="outline"
  //               className="border-[#21C15E] text-[#21C15E] hover:bg-[#21C15E] hover:text-white group transform hover:scale-105 transition-all duration-300"
  //             >
  //               Request Custom Project
  //               <Star className="ml-2 h-4 w-4 group-hover:rotate-180 transition-transform" />
  //             </Button>
  //           </div>
  //         </div>
  //       </div>
  //     </section>
  //   );
  // };

  // Define the interface for a testimonial
  interface Testimonial {
    name: string;
    college: string;
    content: string;
    rating: number;
  }

  // Add type to the TestimonialCard props
  interface TestimonialCardProps {
    testimonial: Testimonial;
  }

  const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
    return (
      <Card className="relative transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#1C61E7] to-[#21C15E] p-0.5">
              <div className="w-full h-full rounded-full overflow-hidden">
                {/* <Image
                  src={`/api/placeholder/150/150`}
                  alt={testimonial.name}
                  className="w-full h-full object-cover"
                /> */}
              </div>
            </div>
            <div>
              <CardTitle className="text-lg">{testimonial.name}</CardTitle>
              <CardDescription>{testimonial.college}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Quote className="w-8 h-8 text-[#1C61E7]/20 mb-2" />
          <p className="text-gray-600">{testimonial.content}</p>
        </CardContent>
        <CardFooter>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < testimonial.rating
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </CardFooter>
      </Card>
    );
  };

  const Testimonials = () => {
    const testimonials = [
      {
        name: "Priya Sharma",
        college: "IIT Delhi",
        content:
          "The IoT home automation project helped me secure an internship at a leading tech company. The mentorship was exceptional!",
        rating: 5,
      },
      {
        name: "Rahul Kumar",
        college: "VIT Vellore",
        content:
          "Their ML project guidance made complex concepts easy to understand. I won first prize in our college tech fest!",
        rating: 5,
      },
      {
        name: "Ananya Patel",
        college: "BITS Pilani",
        content:
          "Outstanding support throughout my final year project. The team went above and beyond to help me succeed.",
        rating: 4,
      },
    ];

    return (
      <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Student Success Stories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from students who transformed their academic journey with our
              projects
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>
    );
  };
  return (
    <div className="min-h-screen bg-white">
      {/* <Header /> */}

      {/* <Header /> */}
      <HeroSection />

      {/* Hero Section */}

      {/* Search Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Find Your Perfect Project</h2>
          <SearchProjects />
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <ProcessExplanation />
      </section>

      {/* Pricing Section */}
      {/* <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">
            Project Packages
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Choose the perfect package for your academic needs. All packages
            include comprehensive support and documentation.
          </p>
          <PricingSection />
        </div>
      </section> */}

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose KSP Projects?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Showcase */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Featured Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-sm font-medium text-[#21C15E] mb-2">
                    {project.category}
                  </div>
                  <CardTitle>{project.title}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            Find answers to common questions about our projects and services
          </p>
          <FAQSection />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-[#1C61E7] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Start Your Project?
          </h2>
          <p className="text-lg mb-8">
            Get in touch with us to discuss your project requirements and
            academic needs
          </p>
          {/* <Button className="bg-white text-[#1C61E7] hover:bg-gray-100">
            Schedule Free Consultation
          </Button> */}

          <a
            href="https://calendly.com/saipreetham0/30min"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="bg-white text-[#1C61E7] hover:bg-gray-100">
              Schedule Free Consultation
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
