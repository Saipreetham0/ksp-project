// src/components/projects/DeliverySection.tsx
import { Button } from "@/components/ui/button";
import { Truck } from "lucide-react";
import { DeliveryForm } from "./DeliveryForm";
import { DeliveryDisplay } from "./DeliveryDisplay";
import { DeliveryAddress } from "@/types/project";

interface DeliverySectionProps {
  showForm: boolean;
  deliveryAddress: DeliveryAddress;
  onAddressChange: (field: keyof DeliveryAddress, value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onToggleForm: () => void;
  isSubmitting: boolean;
}

export function DeliverySection({
  showForm,
  deliveryAddress,
  onAddressChange,
  onSubmit,
  onToggleForm,
  isSubmitting,
}: DeliverySectionProps) {
  return (
    <div className="border-t pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Delivery Information
        </h3>
        {!showForm && (
          <Button
            onClick={onToggleForm}
            variant="outline"
          >
            {deliveryAddress.street ? "Update Address" : "Add Address"}
          </Button>
        )}
      </div>

      {showForm ? (
        <DeliveryForm
          deliveryAddress={deliveryAddress}
          onAddressChange={onAddressChange}
          onSubmit={onSubmit}
          onCancel={onToggleForm}
          isSubmitting={isSubmitting}
        />
      ) : (
        deliveryAddress.street && <DeliveryDisplay address={deliveryAddress} />
      )}
    </div>
  );
}
