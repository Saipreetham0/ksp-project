// // src/app/projects/[id]/page.tsx
// "use client";

// import React, { useState, useEffect } from "react";
// import { useParams, useRouter } from "next/navigation";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardFooter,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// // import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import {
//   Clock,
//   Users,
//   Laptop,
//   Calendar,
//   MapPin,
//   Truck,
//   // CheckCircle,
// } from "lucide-react";
// import { supabase } from "@/lib/supabase";
// import { Project } from "@/types/project";

// interface DeliveryAddress {
//   street: string;
//   city: string;
//   state: string;
//   postalCode: string;
//   country: string;
//   contactNumber: string;
// }

// export default function ProjectDetailsPage() {
//   const params = useParams();
//   const router = useRouter();
//   const [project, setProject] = useState<Project | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [showDeliveryForm, setShowDeliveryForm] = useState(false);
//   const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
//     street: "",
//     city: "",
//     state: "",
//     postalCode: "",
//     country: "",
//     contactNumber: "",
//   });
//   const [addressSubmitting, setAddressSubmitting] = useState(false);

//   useEffect(() => {
//     fetchProjectDetails();
//   }, [params.id]);

//   const fetchProjectDetails = async () => {
//     try {
//       const { data, error } = await supabase
//         .from("projects")
//         .select("*")
//         .eq("id", params.id)
//         .single();

//       if (error) throw error;
//       setProject(data);
//       // Check if delivery address exists
//       const { data: deliveryData } = await supabase
//         .from("delivery_addresses")
//         .select("*")
//         .eq("project_id", params.id)
//         .single();

//       if (deliveryData) {
//         setDeliveryAddress(deliveryData);
//         setShowDeliveryForm(true);
//       }
//     } catch (err) {
//       console.error("Error fetching project:", err);
//       setError("Failed to load project details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeliverySubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setAddressSubmitting(true);

//     try {
//       const { error } = await supabase.from("delivery_addresses").upsert([
//         {
//           project_id: params.id,
//           ...deliveryAddress,
//           updated_at: new Date().toISOString(),
//         },
//       ]);

//       if (error) throw error;

//       // Update project status to indicate delivery information is added
//       await supabase
//         .from("projects")
//         .update({ delivery_status: "pending" })
//         .eq("id", params.id);

//       setShowDeliveryForm(false);
//       fetchProjectDetails(); // Refresh project data
//     } catch (err) {
//       console.error("Error submitting delivery address:", err);
//       setError("Failed to save delivery address");
//     } finally {
//       setAddressSubmitting(false);
//     }
//   };

//   if (loading) return <div className="p-6">Loading...</div>;
//   if (error) return <div className="p-6 text-red-500">{error}</div>;
//   if (!project) return <div className="p-6">Project not found</div>;

//   return (
//     <div className="p-6 max-w-4xl mx-auto space-y-6">
//       <Card>
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <CardTitle className="text-2xl font-bold">{project.title}</CardTitle>
//             <Badge variant={project.status === "completed" ? "secondary" : "default"}>
//               {project.status}
//             </Badge>
//           </div>
//         </CardHeader>

//         <CardContent className="space-y-6">
//           <div className="prose max-w-none">
//             <p className="text-gray-600">{project.description}</p>
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <div className="flex items-center gap-2">
//               <Laptop className="h-5 w-5 text-gray-500" />
//               <span className="text-sm">{project.technology}</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <Users className="h-5 w-5 text-gray-500" />
//               <span className="text-sm">{project.team_size} members</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <Calendar className="h-5 w-5 text-gray-500" />
//               <span className="text-sm">{project.timeline} weeks</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <Clock className="h-5 w-5 text-gray-500" />
//               <span className="text-sm">
//                 {new Date(project.created_at).toLocaleDateString()}
//               </span>
//             </div>
//           </div>

//           {project.status === "completed" && (
//             <div className="border-t pt-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-semibold flex items-center gap-2">
//                   <Truck className="h-5 w-5" />
//                   Delivery Information
//                 </h3>
//                 {!showDeliveryForm && (
//                   <Button
//                     onClick={() => setShowDeliveryForm(true)}
//                     variant="outline"
//                   >
//                     {deliveryAddress.street ? "Update Address" : "Add Address"}
//                   </Button>
//                 )}
//               </div>

//               {showDeliveryForm ? (
//                 <form onSubmit={handleDeliverySubmit} className="space-y-4">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="street">Street Address</Label>
//                       <Input
//                         id="street"
//                         value={deliveryAddress.street}
//                         onChange={(e) =>
//                           setDeliveryAddress({
//                             ...deliveryAddress,
//                             street: e.target.value,
//                           })
//                         }
//                         required
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="city">City</Label>
//                       <Input
//                         id="city"
//                         value={deliveryAddress.city}
//                         onChange={(e) =>
//                           setDeliveryAddress({
//                             ...deliveryAddress,
//                             city: e.target.value,
//                           })
//                         }
//                         required
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="state">State/Province</Label>
//                       <Input
//                         id="state"
//                         value={deliveryAddress.state}
//                         onChange={(e) =>
//                           setDeliveryAddress({
//                             ...deliveryAddress,
//                             state: e.target.value,
//                           })
//                         }
//                         required
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="postalCode">Postal Code</Label>
//                       <Input
//                         id="postalCode"
//                         value={deliveryAddress.postalCode}
//                         onChange={(e) =>
//                           setDeliveryAddress({
//                             ...deliveryAddress,
//                             postalCode: e.target.value,
//                           })
//                         }
//                         required
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="country">Country</Label>
//                       <Input
//                         id="country"
//                         value={deliveryAddress.country}
//                         onChange={(e) =>
//                           setDeliveryAddress({
//                             ...deliveryAddress,
//                             country: e.target.value,
//                           })
//                         }
//                         required
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="contactNumber">Contact Number</Label>
//                       <Input
//                         id="contactNumber"
//                         type="tel"
//                         value={deliveryAddress.contactNumber}
//                         onChange={(e) =>
//                           setDeliveryAddress({
//                             ...deliveryAddress,
//                             contactNumber: e.target.value,
//                           })
//                         }
//                         required
//                       />
//                     </div>
//                   </div>

//                   <div className="flex gap-4">
//                     <Button
//                       type="submit"
//                       className="flex-1"
//                       disabled={addressSubmitting}
//                     >
//                       {addressSubmitting ? "Saving..." : "Save Address"}
//                     </Button>
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={() => setShowDeliveryForm(false)}
//                     >
//                       Cancel
//                     </Button>
//                   </div>
//                 </form>
//               ) : (
//                 deliveryAddress.street && (
//                   <div className="bg-gray-50 p-4 rounded-lg space-y-2">
//                     <div className="flex items-start gap-2">
//                       <MapPin className="h-5 w-5 text-gray-500 mt-1" />
//                       <div>
//                         <p>{deliveryAddress.street}</p>
//                         <p>
//                           {deliveryAddress.city}, {deliveryAddress.state}{" "}
//                           {deliveryAddress.postalCode}
//                         </p>
//                         <p>{deliveryAddress.country}</p>
//                         <p className="text-sm text-gray-500 mt-2">
//                           Contact: {deliveryAddress.contactNumber}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 )
//               )}
//             </div>
//           )}
//         </CardContent>

//         <CardFooter className="border-t bg-gray-50">
//           <div className="flex justify-between w-full items-center">
//             <Badge variant="outline" className="capitalize">
//               {project.type} Project
//             </Badge>
//             <Button
//               variant="ghost"
//               onClick={() => router.back()}
//             >
//               Back to Dashboard
//             </Button>
//           </div>
//         </CardFooter>
//       </Card>
//     </div>
//   );
// }

// src/app/projects/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { Project, DeliveryAddress } from "@/types/project";
import { ProjectHeader } from "@/components/projects/ProjectHeader";
import { ProjectMetrics } from "@/components/projects/ProjectMetrics";
import { DeliverySection } from "@/components/projects/DeliverySection";
import { ErrorBoundary } from "@/components/projects/ErrorBoundary";

function LoadingState() {
  return (
    <div className="p-6 flex justify-center items-center min-h-[400px]">
      <p className="text-gray-600">Loading project details...</p>
    </div>
  );
}

function ErrorState({ error, onBack }: { error: string; onBack: () => void }) {
  return (
    <div className="p-6 flex justify-center items-center min-h-[400px]">
      <div className="text-red-500 text-center">
        <p className="font-semibold mb-2">Error</p>
        <p>{error}</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    contactNumber: "",
  });
  const [addressSubmitting, setAddressSubmitting] = useState(false);

  useEffect(() => {
    if (!projectId) {
      setError("Project ID is required");
      setLoading(false);
      return;
    }
    fetchProjectDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (projectError) throw projectError;
      if (!projectData) throw new Error("Project not found");

      setProject(projectData);

      const { data: deliveryData, error: deliveryError } = await supabase
        .from("delivery_addresses")
        .select("*")
        .eq("project_id", projectId)
        .single();

      if (deliveryError && deliveryError.code !== "PGRST116") {
        throw deliveryError;
      }

      if (deliveryData) {
        setDeliveryAddress(deliveryData);
        setShowDeliveryForm(false);
      }
    } catch (err) {
      console.error("Error fetching project:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load project details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (field: keyof DeliveryAddress, value: string) => {
    setDeliveryAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeliverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !project) return;

    setAddressSubmitting(true);
    try {
      const { error: deliveryError } = await supabase
        .from("delivery_addresses")
        .upsert([
          {
            project_id: projectId,
            ...deliveryAddress,
            updated_at: new Date().toISOString(),
          },
        ]);

      if (deliveryError) throw deliveryError;

      const { error: projectError } = await supabase
        .from("projects")
        .update({ delivery_status: "pending" })
        .eq("id", projectId);

      if (projectError) throw projectError;

      await fetchProjectDetails();
      setShowDeliveryForm(false);
    } catch (err) {
      console.error("Error submitting delivery address:", err);
      setError(
        err instanceof Error ? err.message : "Failed to save delivery address"
      );
    } finally {
      setAddressSubmitting(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onBack={() => router.back()} />;
  if (!project)
    return (
      <ErrorState error="Project not found" onBack={() => router.back()} />
    );

  return (
    <ErrorBoundary>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Card>
          <ProjectHeader title={project.title} status={project.status} />

          <CardContent className="space-y-6">
            <div className="prose max-w-none">
              <p className="text-gray-600">{project.description}</p>
            </div>

            <ProjectMetrics
              technology={project.technology}
              teamSize={project.team_size}
              timeline={project.timeline}
              createdAt={project.created_at}
            />

            {project.status === "completed" && (
              <DeliverySection
                showForm={showDeliveryForm}
                deliveryAddress={deliveryAddress}
                onAddressChange={handleAddressChange}
                onSubmit={handleDeliverySubmit}
                onToggleForm={() => setShowDeliveryForm(!showDeliveryForm)}
                isSubmitting={addressSubmitting}
              />
            )}
          </CardContent>

          {/* <CardFooter className="border-t bg-gray-50"> */}

          <CardFooter className="border-t bg-gray-50">
            <div className="flex justify-between w-full items-center">
              <Badge variant="outline" className="capitalize">
                {project.type} Project
              </Badge>
              <Button variant="ghost" onClick={() => router.back()}>
                Back to Dashboard
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </ErrorBoundary>
  );
}
