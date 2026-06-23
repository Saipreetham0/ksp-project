import { Metadata } from "next";
import { FileAttachments } from "@/components/attachments/FileAttachments";

export const metadata: Metadata = {
  title: "File Management - ProjectX",
  description: "Manage file attachments and documents",
};

export default function FilesPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <FileAttachments />
    </div>
  );
}