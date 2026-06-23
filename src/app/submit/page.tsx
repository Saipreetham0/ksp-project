import { Metadata } from "next";
import { StudentForm } from "@/components/student/StudentForm";

export const metadata: Metadata = {
  title: "Submit Project - ProjectX",
  description: "Submit your project for review and grading",
};

export default function SubmitPage() {
  return <StudentForm />;
}