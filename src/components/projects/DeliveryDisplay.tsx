// src/components/projects/DeliveryDisplay.tsx
import { MapPin } from "lucide-react";
import { DeliveryAddress } from "@/types/project";

interface DeliveryDisplayProps {
  address: DeliveryAddress;
}

export function DeliveryDisplay({ address }: DeliveryDisplayProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
      <div className="flex items-start gap-2">
        <MapPin className="h-5 w-5 text-gray-500 mt-1 flex-shrink-0" />
        <div>
          <p>{address.street}</p>
          <p>
            {address.city}, {address.state} {address.postalCode}
          </p>
          <p>{address.country}</p>
          <p className="text-sm text-gray-500 mt-2">
            Contact: {address.contactNumber}
          </p>
        </div>
      </div>
    </div>
  );
}
