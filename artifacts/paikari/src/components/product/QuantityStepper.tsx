import { Minus, Plus } from "lucide-react";
import { Button } from "../ui/button";

interface QuantityStepperProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
}

export function QuantityStepper({ value, onChange, min = 1, max = 9999 }: QuantityStepperProps) {
  const handleDec = () => {
    if (value > min) onChange(value - 1);
  };

  const handleInc = () => {
    if (value < max) onChange(value + 1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      if (val < min) onChange(min);
      else if (val > max) onChange(max);
      else onChange(val);
    }
  };

  return (
    <div className="flex items-center">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-r-none border-r-0"
        onClick={handleDec}
        disabled={value <= min}
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <input
        type="number"
        value={value}
        onChange={handleChange}
        className="h-8 w-14 border text-center text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ring z-10"
        min={min}
        max={max}
      />
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-l-none border-l-0"
        onClick={handleInc}
        disabled={value >= max}
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
