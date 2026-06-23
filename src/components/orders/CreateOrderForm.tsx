"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Laptop,
  Users,
  Calendar,
  IndianRupee,
  Zap,
  Target,
  CheckCircle,
  X,
  Plus,
  ArrowLeft,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { toast } from "@/hooks/use-toast";

const orderSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Please select a category"),
  technology: z.array(z.string()).min(1, "Please select at least one technology"),
  timeline_days: z.number().min(1, "Timeline must be at least 1 day").max(365, "Timeline cannot exceed 365 days"),
  team_size: z.number().min(1, "Team size must be at least 1").max(20, "Team size cannot exceed 20"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  amount: z.number().min(0, "Amount cannot be negative").optional(),
  requirements: z.string().optional(),
  deliverables: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

const CATEGORIES = [
  "Web Development",
  "Mobile App Development",
  "IoT & Embedded Systems",
  "AI & Machine Learning",
  "Blockchain",
  "Desktop Applications",
  "E-commerce",
  "Custom Development",
];

const TECHNOLOGIES = [
  "React", "Node.js", "Python", "JavaScript", "TypeScript", "Java",
  "Arduino", "Raspberry Pi", "IoT", "Embedded Systems", "PCB Design",
  "React Native", "Flutter", "Swift", "Kotlin",
  "TensorFlow", "PyTorch", "Machine Learning", "AI",
  "Solidity", "Ethereum", "Smart Contracts",
  "PostgreSQL", "MongoDB", "MySQL", "Firebase",
  "AWS", "Google Cloud", "Azure", "Docker",
  "Others"
];

const PRIORITIES = [
  { value: "low", label: "Low", color: "bg-green-100 text-green-700", icon: "🟢" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-700", icon: "🟡" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-700", icon: "🟠" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-700", icon: "🔴" },
];

export function CreateOrderForm() {
  const router = useRouter();
  const { user, supabase } = useAuthSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      technology: [],
      timeline_days: 30,
      team_size: 1,
      priority: "medium",
      amount: 0,
      requirements: "",
      deliverables: "",
    },
  });

  const handleTechnologyToggle = (tech: string) => {
    const updated = selectedTechnologies.includes(tech)
      ? selectedTechnologies.filter(t => t !== tech)
      : [...selectedTechnologies, tech];
    
    setSelectedTechnologies(updated);
    form.setValue("technology", updated);
  };

  const onSubmit = async (data: OrderFormData) => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create an order",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        ...data,
        user_id: user.id,
        status: "draft",
        payment_status: "pending",
        progress_percentage: 0,
        technology: JSON.stringify(data.technology),
      };

      const { error } = await supabase
        .from("orders")
        .insert([orderData]);

      if (error) throw error;

      toast({
        title: "Order created successfully! 🎉",
        description: "Your order has been submitted and is now being processed.",
      });

      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast({
        title: "Failed to create order",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              Create New Order
            </h1>
            <p className="text-gray-600 mt-1">
              Tell us about your project and we&apos;ll get started right away
            </p>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-200 ${
                  stepNum === step
                    ? "bg-blue-600 text-white shadow-lg"
                    : stepNum < step
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}>
                  {stepNum < step ? <CheckCircle className="w-5 h-5" /> : stepNum}
                </div>
                {stepNum < totalSteps && (
                  <div className={`w-16 h-1 mx-2 rounded-full ${
                    stepNum < step ? "bg-green-600" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <span className="text-sm text-gray-600">
              Step {step} of {totalSteps}
            </span>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
              <CardTitle className="text-xl font-semibold text-gray-900">
                {step === 1 && "Project Overview"}
                {step === 2 && "Technical Details"}
                {step === 3 && "Requirements & Budget"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Step 1: Basic Information */}
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">Project Title *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., E-commerce Website with Payment Integration"
                                className="h-12 text-lg"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">Project Description *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your project in detail. What do you want to build? What problems will it solve?"
                                className="min-h-[120px] text-base"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">Category *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12">
                                  <SelectValue placeholder="Select project category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CATEGORIES.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end">
                        <Button 
                          type="button" 
                          onClick={nextStep}
                          className="bg-blue-600 hover:bg-blue-700 px-8"
                        >
                          Next Step
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Technical Details */}
                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <FormField
                        control={form.control}
                        name="technology"
                        render={() => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">Technologies *</FormLabel>
                            <FormControl>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {TECHNOLOGIES.map((tech) => (
                                  <motion.div
                                    key={tech}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    <Badge
                                      variant={selectedTechnologies.includes(tech) ? "default" : "outline"}
                                      className={`cursor-pointer p-3 text-center justify-center transition-all ${
                                        selectedTechnologies.includes(tech)
                                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                                          : "hover:bg-blue-50 hover:border-blue-300"
                                      }`}
                                      onClick={() => handleTechnologyToggle(tech)}
                                    >
                                      {tech}
                                    </Badge>
                                  </motion.div>
                                ))}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="timeline_days"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Timeline (Days) *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="30"
                                  className="h-12"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="team_size"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Team Size *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="1"
                                  className="h-12"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                Priority *
                              </FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-12">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {PRIORITIES.map((priority) => (
                                    <SelectItem key={priority.value} value={priority.value}>
                                      <div className="flex items-center gap-2">
                                        <span>{priority.icon}</span>
                                        {priority.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-between">
                        <Button type="button" variant="outline" onClick={prevStep}>
                          Previous
                        </Button>
                        <Button type="button" onClick={nextStep} className="bg-blue-600 hover:bg-blue-700">
                          Next Step
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Requirements & Budget */}
                  {step === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <FormField
                        control={form.control}
                        name="requirements"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">Detailed Requirements</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="List specific features, functionalities, or requirements for your project..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="deliverables"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium">Expected Deliverables</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="What do you expect to receive? (e.g., source code, documentation, deployment, etc.)"
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 font-medium flex items-center gap-2">
                              <IndianRupee className="w-4 h-4" />
                              Budget (Optional)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter your budget in INR"
                                className="h-12 text-lg"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-between pt-4">
                        <Button type="button" variant="outline" onClick={prevStep}>
                          Previous
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Creating Order...
                            </>
                          ) : (
                            <>
                              <Zap className="w-4 h-4 mr-2" />
                              Create Order
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}