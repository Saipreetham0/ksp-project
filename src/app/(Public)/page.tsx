"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sparkles,
  ArrowRight,
  Cpu,
  BrainCircuit,
  Settings as MechanicalIcon,
  FileText,
  CheckCircle2,
  Laptop,
  BookOpen,
  Menu,
  X,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import Link from "next/link";

// TODO: point these at their real URLs (kspelectronics.in / platform routes).
const FOOTER_COLUMNS = [
  {
    title: "Shop Electronics",
    links: ["3D Printers", "3D Printer Filaments", "Electronics Components", "IoT Devices", "Development Boards", "Robotics Kits", "Tools & Accessories", "New Products", "Outlet"],
  },
  {
    title: "Engineering Services",
    links: ["3D Printer Sales & Service", "IoT Product Development", "Custom Electronics Projects", "Final Year Engineering Projects", "Project Inquiry"],
  },
  {
    title: "Platform",
    links: ["Tools", "Learn", "Forum", "Apps", "Documentation"],
  },
  {
    title: "Customer Support",
    links: ["Order Tracking", "Shipping Policy", "Delivery & Returns", "Refund Policy", "FAQ", "Contact Us"],
  },
  {
    title: "Company",
    links: ["About Us", "Our Stores", "Hyderabad Store", "Asifabad Store", "Blog", "Promotions"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms & Conditions", "Warranty Policy"],
  },
];

const NAV_LINKS = [
  { href: "#domains", label: "Domains" },
  { href: "#projects", label: "Projects" },
  { href: "#simulator", label: "Portal Tracker" },
  { href: "#estimator", label: "Cost Calculator" },
  { href: "#inbox", label: "Submit Idea" },
  { href: "#faq", label: "FAQ" },
];

// TODO: confirm your WhatsApp business number (seeded from PAYMENT_CONFIG.upi_id)
const WHATSAPP_NUMBER = "919550421866";
const waLink = (text: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.803-4.381 9.805-9.782.001-2.592-1.01-5.03-2.846-6.87C16.4 2.1 13.962 1.085 11.378 1.085 5.975 1.085 1.58 5.467 1.578 10.87c-.001 1.547.412 3.056 1.196 4.394l-.994 3.635 3.727-.978zm11.368-6.14c-.29-.145-1.72-.85-1.985-.945-.266-.096-.46-.145-.653.145-.193.29-.747.945-.918 1.14-.17.193-.341.217-.63.073-.29-.145-1.229-.453-2.34-1.445-.864-.77-1.447-1.72-1.618-2.01-.17-.29-.018-.448.127-.592.13-.13.29-.34.435-.51.145-.17.193-.29.29-.483.097-.193.048-.36-.024-.507-.072-.145-.653-1.575-.895-2.158-.236-.569-.475-.49-.653-.49-.17 0-.365-.01-.56-.01-.196 0-.518.073-.79.373-.272.29-1.04 1.016-1.04 2.479 0 1.464 1.066 2.88 1.212 3.074.145.193 2.098 3.202 5.08 4.494.71.307 1.264.49 1.696.628.713.226 1.36.194 1.872.118.571-.085 1.72-.704 1.962-1.385.242-.68.242-1.262.17-1.385-.072-.124-.267-.196-.557-.341z" />
  </svg>
);

// Editable showcase — swap for your real flagship projects + prices.
const PROJECTS = [
  { domain: "IoT", title: "Smart Greenhouse Monitor", desc: "ESP32 sensors with a live cloud dashboard for temperature, humidity and soil.", price: 16000 },
  { domain: "ML", title: "Crop Disease Detection", desc: "CNN model with a web demo that flags plant diseases from leaf images.", price: 14000 },
  { domain: "Mechanical", title: "Automated Sorting Conveyor", desc: "Sensor-driven object sorting system with full CAD design and assembly.", price: 13000 },
  { domain: "IoT", title: "Home Automation Hub", desc: "App and voice controlled appliances with a custom PCB enclosure.", price: 15000 },
  { domain: "ML", title: "Traffic Sign Recognition", desc: "Real-time detection model with an accuracy report and live demo.", price: 14000 },
  { domain: "Combo", title: "Hybrid Smart Greenhouse + ML", desc: "IoT hardware paired with an ML crop-disease prediction model.", price: 22000 },
];

// TODO: replace 250+ with your real delivered count.
const STATS = [
  { value: "250+", label: "Projects delivered" },
  { value: "80+", label: "Student groups" },
  { value: "4", label: "Specialist domains" },
  { value: "Pan-India", label: "Hardware delivery" },
];

export default function StudentProjectHubLanding() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Project Estimator States
  const [selectedDomain, setSelectedDomain] = useState<"iot" | "ml" | "mechanical" | "combo">("iot");
  const [projectScale, setProjectScale] = useState<"mini" | "major">("major");
  const [includeDocumentation, setIncludeDocumentation] = useState(true);
  const [includePPT, setIncludePPT] = useState(true);
  const [includeVideoWalkthrough, setIncludeVideoWalkthrough] = useState(false);
  const [includeVivaPrep, setIncludeVivaPrep] = useState(false);

  // Student Dashboard Simulator States
  const [activeStep, setActiveStep] = useState<"onboarding" | "development" | "documentation" | "delivered">("development");

  // Contact Form Custom Project Request State
  const [customInquiry, setCustomInquiry] = useState({
    name: "",
    email: "",
    phone: "",
    idea: ""
  });
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  // Pricing calculations based on real student project rates
  const calculateEstimate = () => {
    const baseRates = {
      iot: { mini: 6000, major: 15000 },
      ml: { mini: 5000, major: 12000 },
      mechanical: { mini: 5500, major: 13000 },
      combo: { mini: 9000, major: 22000 }
    };
    
    let total = baseRates[selectedDomain][projectScale];
    
    if (includeDocumentation) total += 2000;
    if (includePPT) total += 1000;
    if (includeVideoWalkthrough) total += 1500;
    if (includeVivaPrep) total += 1500;
    
    return total;
  };

  const getWorkflowProgress = () => {
    const progressMap = { onboarding: 25, development: 50, documentation: 75, delivered: 100 };
    return progressMap[activeStep];
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySubmitted(true);
    setTimeout(() => {
      setInquirySubmitted(false);
      setCustomInquiry({ name: "", email: "", phone: "", idea: "" });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-[#1c61e7] selection:text-white overflow-hidden font-sans">
      
      {/* --- HEADER --- */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between gap-4 px-4 md:px-8">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center" aria-label="KSP Electronics home">
            <Image
              src="/KSP Electronics-dark.png"
              alt="KSP Electronics"
              width={150}
              height={40}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 text-sm font-medium text-slate-600 md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 transition-colors hover:bg-slate-100 hover:text-[#1c61e7]"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 md:flex">
              <Button asChild variant="ghost" className="text-sm font-medium text-slate-600 hover:text-[#1c61e7]">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild className="rounded-lg bg-[#1c61e7] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1a55cc]">
                <Link href="/signup">Get started</Link>
              </Button>
            </div>
            <button
              type="button"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-slate-200 bg-white px-3 py-3 md:hidden">
            <nav className="flex flex-col">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-[#1c61e7]"
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
              <Button asChild variant="outline" className="w-full border-slate-200 text-slate-700">
                <Link href="/login" onClick={() => setMenuOpen(false)}>Sign in</Link>
              </Button>
              <Button asChild className="w-full bg-[#1c61e7] font-semibold text-white hover:bg-[#1a55cc]">
                <Link href="/signup" onClick={() => setMenuOpen(false)}>Get started</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto text-center">
        {/* Brand Glow Announcement Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#21c15e]/10 text-[#21c15e] text-xs font-bold mb-8">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Real-time Mentorship & Technical Project Solutions</span>
        </div>

        {/* Hero Headings (Solid Colors, No Gradients) */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-slate-900 leading-tight">
          Accelerate Your Academic <br />
          <span className="text-[#1c61e7]">
            Project & Development Journey.
          </span>
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
          Struggling to manage project milestones and student updates? Our team of specialists designs and builds custom academic projects in 
          <strong className="text-slate-900"> IoT, Machine Learning, and Mechanical CAD</strong>, with complete IEEE documentation.
        </p>

        {/* Hero Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
          <Button asChild size="lg" className="w-full sm:w-auto bg-[#1c61e7] hover:bg-[#1a55cc] text-white font-bold transition-all duration-300 hover:scale-[1.02] rounded-xl px-8 py-6 shadow-md shadow-blue-500/10">
            <Link href="/login">
              Enter Student Portal
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl px-8 py-6 bg-white shadow-xs">
            <a href="#estimator">Project Cost Estimator</a>
          </Button>
          <Button asChild size="lg" className="w-full sm:w-auto bg-[#21c15e] hover:bg-[#1da94f] text-white font-bold rounded-xl px-8 py-6 shadow-md shadow-green-500/10">
            <a href={waLink("Hi! I'd like to know more about your academic projects.")} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon className="mr-2 h-5 w-5 fill-white" /> Chat on WhatsApp
            </a>
          </Button>
        </div>

        {/* --- STUDENT LIVE PORTAL SIMULATOR --- */}
        <div id="simulator" className="relative max-w-5xl mx-auto rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60 p-1 md:p-2">
          {/* Mock Browser Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-[#21c15e]" />
              <span className="text-[10px] text-slate-400 font-mono ml-2 tracking-wider">student-portal_live-status_#ORD-09418</span>
            </div>
            <div className="flex gap-1.5 bg-slate-50 p-1 rounded-lg">
              <span className="text-[9px] text-[#21c15e] font-bold px-2 py-0.5 bg-[#21c15e]/10 rounded font-mono">
                Supabase Connected
              </span>
            </div>
          </div>

          <div className="p-4 md:p-8 min-h-[380px] flex flex-col justify-between text-left">
            <div className="space-y-6">
              {/* Order Info Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] text-[#1c61e7] font-mono font-bold block mb-1">PROJECT ID: #PROJ-09418</span>
                  <h4 className="text-lg md:text-xl font-bold text-slate-900">Hybrid Smart Greenhouse with Crop Disease Prediction</h4>
                  <p className="text-xs text-slate-500 mt-1">Cross-Domain Project (IoT Hardware + ML Inference Model)</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#21c15e]/10 text-[#21c15e] border border-[#21c15e]/25">
                    Paid (50% Advance)
                  </span>
                </div>
              </div>

              {/* Progress Pipeline */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Milestone Progress Track</span>
                  <span className="font-mono text-[#21c15e] font-bold">{getWorkflowProgress()}%</span>
                </div>
                
                {/* Visual Pipeline Bar */}
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#1c61e7] h-3 rounded-full transition-all duration-500"
                    style={{ width: `${getWorkflowProgress()}%` }}
                  />
                </div>

                {/* Workflow Steps Indicator */}
                <div className="grid grid-cols-4 gap-2 pt-2 text-center text-[10px] md:text-xs text-slate-500">
                  <div className={`p-2 rounded-lg border transition-all ${activeStep === "onboarding" ? "border-[#21c15e] bg-[#21c15e]/5 text-[#21c15e] font-bold" : "border-transparent text-slate-400"}`}>
                    1. Onboarded
                  </div>
                  <div className={`p-2 rounded-lg border transition-all ${activeStep === "development" ? "border-[#21c15e] bg-[#21c15e]/5 text-[#21c15e] font-bold" : "border-transparent text-slate-400"}`}>
                    2. In Development
                  </div>
                  <div className={`p-2 rounded-lg border transition-all ${activeStep === "documentation" ? "border-[#21c15e] bg-[#21c15e]/5 text-[#21c15e] font-bold" : "border-transparent text-slate-400"}`}>
                    3. Documentation
                  </div>
                  <div className={`p-2 rounded-lg border transition-all ${activeStep === "delivered" ? "border-[#21c15e] bg-[#21c15e]/5 text-[#21c15e] font-bold" : "border-transparent text-slate-400"}`}>
                    4. Shipped
                  </div>
                </div>
              </div>

              {/* Live Files Section Mockup */}
              <div className="bg-slate-50/70 border border-slate-150 rounded-xl p-5 space-y-3">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Released Project Attachments</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-lg shadow-xs">
                    <span className="text-slate-700 flex items-center gap-2 truncate">
                      <FileText className="h-4 w-4 text-[#21c15e]" />
                      Greenhouse_Project_Report_v1.pdf
                    </span>
                    <span className="text-[10px] text-slate-400">Wait for Release</span>
                  </div>
                  <div className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-lg shadow-xs">
                    <span className="text-slate-700 flex items-center gap-2 truncate">
                      <Laptop className="h-4 w-4 text-[#1c61e7]" />
                      IoT_ESP32_Greenhouse_Firmware.zip
                    </span>
                    <span className="text-[10px] text-slate-400">Wait for Release</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulation Controller */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#21c15e] animate-pulse" />
                Change status to preview student view flow:
              </span>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                {["onboarding", "development", "documentation", "delivered"].map((step) => (
                  <button
                    key={step}
                    onClick={() => setActiveStep(step as any)}
                    className={`px-3 py-1 rounded text-[10px] transition-all uppercase tracking-wider font-bold ${
                      activeStep === step 
                        ? "bg-[#1c61e7] text-white" 
                        : "text-slate-600 hover:text-[#1c61e7]"
                    }`}
                  >
                    {step === "onboarding" ? "Onboard" : step === "development" ? "Dev" : step === "documentation" ? "Docs" : "Ship"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SOCIAL PROOF STATS --- */}
      <section className="border-y border-slate-200 bg-white py-10 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-3xl md:text-4xl font-extrabold text-[#1c61e7]">{s.value}</div>
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* --- POPULAR PROJECTS CATALOG --- */}
      <section id="projects" className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-slate-950">Popular Student Projects</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-xs md:text-sm">
            Ready-to-order projects across every domain — or send us your own idea. Every build ships with
            source code, documentation and a viva walkthrough.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECTS.map((p) => {
            const green = p.domain === "ML" || p.domain === "Combo";
            return (
              <div
                key={p.title}
                className="flex flex-col bg-white border border-slate-200 hover:border-[#1c61e7]/40 shadow-sm hover:shadow-md transition-all rounded-xl p-6"
              >
                <span
                  className={`self-start text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-4 ${
                    green ? "bg-[#21c15e]/10 text-[#21c15e]" : "bg-[#1c61e7]/10 text-[#1c61e7]"
                  }`}
                >
                  {p.domain}
                </span>
                <h3 className="text-slate-900 font-bold text-lg mb-2">{p.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed flex-1">{p.desc}</p>
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
                  <span className="text-sm font-bold text-slate-900">
                    from ₹{p.price.toLocaleString("en-IN")}
                  </span>
                  <Button asChild size="sm" className="bg-[#21c15e] hover:bg-[#1da94f] text-white font-semibold text-xs rounded-lg">
                    <a
                      href={waLink(`Hi! I'm interested in the "${p.title}" project. Can you share the details?`)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <WhatsAppIcon className="h-3.5 w-3.5 mr-1.5 fill-white" /> Enquire
                    </a>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* --- THE 4 SPECIALTY DOMAINS --- */}
      <section id="domains" className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-slate-950">
            Our 4 Core Engineering Domains
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-xs md:text-sm">
            Your project is handled directly by dedicated specialists in each domain. We design custom hardware, 
            train models, assemble mechanical designs, and draft IEEE reports.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* IoT */}
          <Card className="bg-white border-slate-200 hover:border-[#1c61e7]/40 shadow-sm hover:shadow-md transition-all duration-300 group rounded-xl p-2">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-[#1c61e7]/10 border border-[#1c61e7]/20 flex items-center justify-center text-[#1c61e7] mb-4 group-hover:scale-110 transition-transform">
                <Cpu className="h-6 w-6" />
              </div>
              <CardTitle className="text-slate-900 text-lg font-bold">1. Internet of Things (IoT)</CardTitle>
              <CardDescription className="text-slate-500 text-xs mt-2 leading-relaxed">
                Smart automation, ESP32/Arduino microcontroller firmware, sensor integration, dashboard telemetries, and hardware assembly.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* ML */}
          <Card className="bg-white border-slate-200 hover:border-[#21c15e]/40 shadow-sm hover:shadow-md transition-all duration-300 group rounded-xl p-2">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-[#21c15e]/10 border border-[#21c15e]/20 flex items-center justify-center text-[#21c15e] mb-4 group-hover:scale-110 transition-transform">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <CardTitle className="text-slate-900 text-lg font-bold">2. Machine Learning (ML)</CardTitle>
              <CardDescription className="text-slate-500 text-xs mt-2 leading-relaxed">
                Python scripts, CNN/RNN classification models, predictions, dataset cleaning, computer vision inference, and accuracy analytics.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Mechanical */}
          <Card className="bg-white border-slate-200 hover:border-[#1c61e7]/40 shadow-sm hover:shadow-md transition-all duration-300 group rounded-xl p-2">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-[#1c61e7]/10 border border-[#1c61e7]/20 flex items-center justify-center text-[#1c61e7] mb-4 group-hover:scale-110 transition-transform">
                <MechanicalIcon className="h-6 w-6" />
              </div>
              <CardTitle className="text-slate-900 text-lg font-bold">3. Mechanical CAD</CardTitle>
              <CardDescription className="text-slate-500 text-xs mt-2 leading-relaxed">
                3D modeling, Fusion360/SolidWorks designs, custom hardware enclosures, product designs, and STL files ready for 3D printing.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Documentation */}
          <Card className="bg-white border-slate-200 hover:border-[#21c15e]/40 shadow-sm hover:shadow-md transition-all duration-300 group rounded-xl p-2">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-[#21c15e]/10 border border-[#21c15e]/20 flex items-center justify-center text-[#21c15e] mb-4 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6" />
              </div>
              <CardTitle className="text-slate-900 text-lg font-bold">4. Documentation & PPT</CardTitle>
              <CardDescription className="text-slate-500 text-xs mt-2 leading-relaxed">
                Comprehensive project reports, IEEE format synopses, custom presentation PPTs, circuit diagrams, and Viva explanation walksheets.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* --- DYNAMIC PROJECT ESTIMATOR & CALCULATOR WIDGET --- */}
      <section id="estimator" className="py-20 bg-white border-y border-slate-200 px-4 md:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Configurator Left Column */}
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1c61e7]/10 text-[#1c61e7] text-xs font-bold">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Project Configurator</span>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900 leading-tight">
              Configure Your Project Package & Estimate Cost
            </h3>
            <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
              Select your primary engineering domain and choose your academic deliverables. Our pricing scales 
              transparently based on required hardware components, documentation depth, and viva training support.
            </p>

            <div className="space-y-5 mt-6">
              {/* Domain Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Select Domain</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100 p-1 rounded-xl">
                  {[
                    { id: "iot", label: "IoT" },
                    { id: "ml", label: "ML" },
                    { id: "mechanical", label: "Mech" },
                    { id: "combo", label: "Combo" }
                  ].map((dom) => (
                    <button
                      key={dom.id}
                      onClick={() => setSelectedDomain(dom.id as any)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        selectedDomain === dom.id ? "bg-[#1c61e7] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {dom.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Scale Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Project Scale</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                  {[
                    { id: "mini", label: "Mini Project (Semester)" },
                    { id: "major", label: "Major Project (Final Year)" }
                  ].map((scale) => (
                    <button
                      key={scale.id}
                      onClick={() => setProjectScale(scale.id as any)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        projectScale === scale.id ? "bg-[#1c61e7] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {scale.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Addons Checklist */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Deliverables & Support Addons</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={includeDocumentation}
                      onChange={(e) => setIncludeDocumentation(e.target.checked)}
                      className="rounded border-slate-300 bg-white text-[#1c61e7] focus:ring-[#1c61e7] w-4 h-4"
                    />
                    <span>Full Project Report (+₹2,000)</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={includePPT}
                      onChange={(e) => setIncludePPT(e.target.checked)}
                      className="rounded border-slate-300 bg-white text-[#1c61e7] focus:ring-[#1c61e7] w-4 h-4"
                    />
                    <span>Presentation Slides PPT (+₹1,000)</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={includeVideoWalkthrough}
                      onChange={(e) => setIncludeVideoWalkthrough(e.target.checked)}
                      className="rounded border-slate-300 bg-white text-[#1c61e7] focus:ring-[#1c61e7] w-4 h-4"
                    />
                    <span className="text-[#21c15e] font-medium">Video Walkthrough (+₹1,500)</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={includeVivaPrep}
                      onChange={(e) => setIncludeVivaPrep(e.target.checked)}
                      className="rounded border-slate-300 bg-white text-[#1c61e7] focus:ring-[#1c61e7] w-4 h-4"
                    />
                    <span className="text-[#21c15e] font-medium">1-on-1 Viva Prep Call (+₹1,500)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Estimation Output Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6 text-left relative shadow-sm">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Price Breakdown (Zoho Synced)</h4>
            
            <div className="space-y-3 font-mono text-xs text-slate-700">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span>Domain Core Project:</span>
                <span className="text-slate-900 font-bold">₹{
                  selectedDomain === "iot" ? (projectScale === "mini" ? "6,000" : "15,000") :
                  selectedDomain === "ml" ? (projectScale === "mini" ? "5,000" : "12,000") :
                  selectedDomain === "mechanical" ? (projectScale === "mini" ? "5,500" : "13,000") :
                  (projectScale === "mini" ? "9,000" : "22,000")
                }</span>
              </div>
              
              {includeDocumentation && (
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span>Documentation Report:</span>
                  <span className="text-slate-900">+₹2,000</span>
                </div>
              )}
              
              {includePPT && (
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span>Presentation Slides:</span>
                  <span className="text-slate-900">+₹1,000</span>
                </div>
              )}

              {includeVideoWalkthrough && (
                <div className="flex justify-between border-b border-slate-200 pb-2 text-[#21c15e] font-bold">
                  <span>Video walkthrough tutor:</span>
                  <span>+₹1,500</span>
                </div>
              )}

              {includeVivaPrep && (
                <div className="flex justify-between border-b border-slate-200 pb-2 text-[#21c15e] font-bold">
                  <span>Viva Mock Prep call:</span>
                  <span>+₹1,500</span>
                </div>
              )}

              <div className="flex justify-between pt-4 text-base font-bold border-t border-slate-200">
                <span className="text-slate-800">Total Project Value:</span>
                <span className="text-[#21c15e] text-lg font-bold">₹{calculateEstimate().toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                <span>50% Advance Required:</span>
                <span>₹{(calculateEstimate() / 2).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl text-xs space-y-2 text-slate-500 shadow-xs">
              <p>💡 <strong>Payment Flow:</strong> Bookings trigger automated onboarding via our student portal. Payment terms are verified and securely updated in Zoho.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- RECONCILED WORKFLOW PROCESS --- */}
      <section className="py-20 px-4 md:px-8 max-w-5xl mx-auto text-center">
        <h2 className="text-2xl md:text-4xl font-extrabold mb-4 text-slate-950">
          How We Deliver Your Success
        </h2>
        <p className="text-slate-600 text-xs md:text-sm max-w-xl mx-auto mb-12">
          From payment checkout to technical testing and doorstep hardware shipping.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="bg-white border border-slate-200 rounded-xl p-5 relative shadow-xs">
            <span className="absolute top-3 right-3 text-[10px] font-mono text-slate-300 font-bold">01</span>
            <div className="w-10 h-10 rounded-full bg-[#1c61e7]/10 text-[#1c61e7] flex items-center justify-center mx-auto mb-4 font-bold">
              1
            </div>
            <h4 className="text-slate-900 text-sm font-bold mb-2">Book Order</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Book your project, choose addons, and securely submit your 50% advance.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 relative shadow-xs">
            <span className="absolute top-3 right-3 text-[10px] font-mono text-slate-300 font-bold">02</span>
            <div className="w-10 h-10 rounded-full bg-[#21c15e]/10 text-[#21c15e] flex items-center justify-center mx-auto mb-4 font-bold">
              2
            </div>
            <h4 className="text-slate-900 text-sm font-bold mb-2">Custom Build</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Our IoT, ML, and Mech devs construct the code, circuit, CAD models, and draft reports.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 relative shadow-xs">
            <span className="absolute top-3 right-3 text-[10px] font-mono text-slate-300 font-bold">03</span>
            <div className="w-10 h-10 rounded-full bg-[#1c61e7]/10 text-[#1c61e7] flex items-center justify-center mx-auto mb-4 font-bold">
              3
            </div>
            <h4 className="text-slate-900 text-sm font-bold mb-2">Walkthrough Call</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Complete walkthrough presentation call via GoogleMeet to explain all code and design elements.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 relative shadow-xs">
            <span className="absolute top-3 right-3 text-[10px] font-mono text-slate-300 font-bold">04</span>
            <div className="w-10 h-10 rounded-full bg-[#21c15e]/10 text-[#21c15e] flex items-center justify-center mx-auto mb-4 font-bold">
              4
            </div>
            <h4 className="text-slate-900 text-sm font-bold mb-2">Doorstep Delivery</h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              We securely pack and ship the hardware setup via premium couriers across India.
            </p>
          </div>
        </div>
      </section>

      {/* --- CUSTOM PROJECT REQUIREMENT INBOX --- */}
      <section id="inbox" className="py-20 bg-slate-100/50 border-y border-slate-200 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#21c15e]/10 text-[#21c15e] text-xs font-bold mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Have a Custom Idea?</span>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900">Request Custom Project Development</h3>
            <p className="text-slate-500 text-xs md:text-sm mt-2">
              Share your custom project requirements or syllabus guidelines. Our team will review the parameters and get back to you within 24 hours.
            </p>
          </div>

          {inquirySubmitted ? (
            <div className="bg-[#21c15e]/10 border border-[#21c15e]/30 p-6 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-[#21c15e] mx-auto" />
              <h4 className="text-slate-900 font-bold">Requirements Received successfully!</h4>
              <p className="text-slate-600 text-xs">Our domain specialist will review your guidelines and reach out to you via email shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleInquirySubmit} className="space-y-4 bg-white border border-slate-200 p-6 md:p-8 rounded-2xl text-left shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Full Name</label>
                  <Input 
                    type="text" 
                    required 
                    placeholder="Enter your name" 
                    className="bg-slate-50 border-slate-200 focus:border-[#1c61e7] text-slate-900 rounded-lg py-5"
                    value={customInquiry.name}
                    onChange={(e) => setCustomInquiry({ ...customInquiry, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Email Address</label>
                  <Input 
                    type="email" 
                    required 
                    placeholder="your.email@example.com" 
                    className="bg-slate-50 border-slate-200 focus:border-[#1c61e7] text-slate-900 rounded-lg py-5"
                    value={customInquiry.email}
                    onChange={(e) => setCustomInquiry({ ...customInquiry, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">WhatsApp Number</label>
                <Input 
                  type="tel" 
                  required 
                  placeholder="Enter contact number" 
                  className="bg-slate-50 border-slate-200 focus:border-[#1c61e7] text-slate-900 rounded-lg py-5"
                  value={customInquiry.phone}
                  onChange={(e) => setCustomInquiry({ ...customInquiry, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Project Guidelines / Concept Idea</label>
                <Textarea 
                  required 
                  rows={4}
                  placeholder="Briefly describe what your project is about or paste your university guidelines..." 
                  className="bg-slate-50 border-slate-200 focus:border-[#1c61e7] text-slate-900 rounded-lg"
                  value={customInquiry.idea}
                  onChange={(e) => setCustomInquiry({ ...customInquiry, idea: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full bg-[#1c61e7] hover:bg-[#1a55cc] text-white font-bold py-6 rounded-xl transition-all shadow-md shadow-blue-500/10">
                Submit Requirement Details
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" className="py-20 px-4 md:px-8 max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-4 text-slate-950">
          Frequently Asked Questions
        </h2>
        <p className="text-center text-slate-600 text-xs md:text-sm mb-12">
          Everything you need to know about our project building and delivery workflow.
        </p>

        <Accordion type="single" collapsible className="w-full space-y-3">
          <AccordionItem value="faq-1" className="border border-slate-200 bg-white rounded-xl px-4 shadow-xs">
            <AccordionTrigger className="text-slate-900 hover:text-[#1c61e7] font-semibold py-4 text-left">
              Do we get the complete source code and reports?
            </AccordionTrigger>
            <AccordionContent className="text-slate-600 text-xs md:text-sm leading-relaxed pb-4">
              Yes, all packages include complete, clean source code with comments. If you opt for documentation, we provide professional reports (typically 50-70 pages) in PDF/Doc format matching IEEE guidelines, along with presentation slides (PPT).
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-2" className="border border-slate-200 bg-white rounded-xl px-4 shadow-xs">
            <AccordionTrigger className="text-slate-900 hover:text-[#1c61e7] font-semibold py-4 text-left">
              How do you ship the hardware components?
            </AccordionTrigger>
            <AccordionContent className="text-slate-600 text-xs md:text-sm leading-relaxed pb-4">
              For IoT and robotics projects, we purchase premium components, assemble the physical prototype, test for defects, pack them securely in shock-resistant enclosures, and ship them via tracked courier services nationwide across India.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-3" className="border border-slate-200 bg-white rounded-xl px-4 shadow-xs">
            <AccordionTrigger className="text-slate-900 hover:text-[#1c61e7] font-semibold py-4 text-left">
              Will you explain the project for my Viva Voce exam?
            </AccordionTrigger>
            <AccordionContent className="text-slate-600 text-xs md:text-sm leading-relaxed pb-4">
              Absolutely. We schedule dedicated project walk-through calls via Google Meet where we explain the circuit connections, line-by-line code logic, dataset inputs, and model outputs. You can also opt for a mock viva session to practice answering typical examiner questions.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="faq-4" className="border border-slate-200 bg-white rounded-xl px-4 shadow-xs">
            <AccordionTrigger className="text-slate-900 hover:text-[#1c61e7] font-semibold py-4 text-left">
              What is your revision/modification policy?
            </AccordionTrigger>
            <AccordionContent className="text-slate-600 text-xs md:text-sm leading-relaxed pb-4">
              We offer standard post-delivery support for 1 to 3 months. If your college guides request modifications to the code or documentation, we perform those updates free of charge as long as they align with the original guidelines.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* --- PREMIUM CALL TO ACTION BANNER --- */}
      <section className="py-20 px-4 md:px-8 max-w-5xl mx-auto">
        <div className="relative rounded-3xl border border-slate-200 bg-white p-8 md:p-12 text-center overflow-hidden shadow-xl shadow-slate-200/50">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">
            Ready to Build Your Project?
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto mb-8 text-xs md:text-sm leading-relaxed">
            Get assigned to our domain developers, track milestones, and download complete reports.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="bg-[#1c61e7] text-white hover:bg-[#1a55cc] font-bold px-8 py-5 rounded-xl shadow-lg transition-transform hover:scale-[1.02]">
              <Link href="/login">Access Portal</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl px-8 py-5 bg-white shadow-xs">
              <a href="https://calendly.com/saipreetham0/30min" target="_blank" rel="noopener noreferrer">
                Book a Free Consultation
              </a>
            </Button>
            <Button asChild size="lg" className="bg-[#21c15e] hover:bg-[#1da94f] text-white font-bold px-8 py-5 rounded-xl shadow-lg">
              <a href={waLink("Hi! I'd like to start a project.")} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="mr-2 h-5 w-5 fill-white" /> Chat on WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp */}
      <a
        href={waLink("Hi! I'd like to enquire about a project.")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-50 transition-transform hover:scale-105"
      >
        <Image 
          src="/whatsapp.svg" 
          alt="WhatsApp" 
          width={56} 
          height={56} 
          className="h-14 w-14 drop-shadow-lg"
          priority
        />
      </a>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          <div className="grid gap-10 lg:grid-cols-12">
            {/* Brand + contact */}
            <div className="lg:col-span-4 space-y-5">
              <Image
                src="/KSP Electronics-dark.png"
                alt="KSP Electronics"
                width={170}
                height={45}
                className="h-10 w-auto object-contain"
              />
              <p className="max-w-sm text-sm leading-relaxed text-slate-600">
                A leading electronics and IoT solutions provider in Telangana —
                3D printers, development boards, robotics kits, components, and
                custom engineering services across India.
              </p>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#1c61e7]" />
                  <p>
                    <span className="font-semibold text-slate-800">Asifabad:</span>{" "}
                    H.No 6-55-124/1, Near Bharath Gas, Asifabad, Komaram Bheem,
                    Telangana – 504293
                  </p>
                </div>
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#1c61e7]" />
                  <p>
                    <span className="font-semibold text-slate-800">Hyderabad:</span>{" "}
                    Uppal, Hyderabad, Telangana — Store &amp; Service Center
                  </p>
                </div>
                <a href="tel:+919550421866" className="flex items-center gap-3 hover:text-[#1c61e7]">
                  <Phone className="h-4 w-4 shrink-0 text-[#1c61e7]" /> +91 95504 21866
                </a>
                <a href="mailto:sales@kspelectronics.in" className="flex items-center gap-3 hover:text-[#1c61e7]">
                  <Mail className="h-4 w-4 shrink-0 text-[#1c61e7]" /> sales@kspelectronics.in
                </a>
              </div>
            </div>

            {/* Link columns */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8">
              {FOOTER_COLUMNS.map((col) => (
                <div key={col.title}>
                  <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-900">
                    {col.title}
                  </h4>
                  <ul className="space-y-2.5">
                    {col.links.map((label) => (
                      <li key={label}>
                        <a href="#" className="text-sm text-slate-600 transition-colors hover:text-[#1c61e7]">
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-200">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row md:px-8">
            <p>
              ©2020–{new Date().getFullYear()} KSP Electronics™. All rights reserved.
              <span className="mx-2 hidden sm:inline">·</span>
              <span className="block sm:inline">GST: 36GALPK7037N1ZZ</span>
            </p>
            <p>
              Designed by KSP Digital Solutions with{" "}
              <span className="text-[#21c15e]">♥</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
