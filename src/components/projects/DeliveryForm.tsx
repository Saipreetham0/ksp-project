// src/components/projects/DeliveryForm.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DeliveryAddress } from "@/types/project";

interface DeliveryFormProps {
  deliveryAddress: DeliveryAddress;
  onAddressChange: (field: keyof DeliveryAddress, value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function DeliveryForm({
  deliveryAddress,
  onAddressChange,
  onSubmit,
  onCancel,
  isSubmitting,
}: DeliveryFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(deliveryAddress).map(([field, value]) => (
          <div key={field} className="space-y-2">
            <Label htmlFor={field}>
              {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
            </Label>
            <Input
              id={field}
              type={field === "contactNumber" ? "tel" : "text"}
              value={value}
              onChange={(e) => onAddressChange(field as keyof DeliveryAddress, e.target.value)}
              required
            />
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <Button
          type="submit"
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Address"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
