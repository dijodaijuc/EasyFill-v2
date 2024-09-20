import React from "react";
import { Input } from "@/components/ui/input";

interface TriggerSymbolInputProps {
  triggerSymbol: string;
  setTriggerSymbol: (value: string) => void;
}

export const TriggerSymbolInput: React.FC<TriggerSymbolInputProps> = ({
  triggerSymbol,
  setTriggerSymbol,
}) => (
  <div className="flex items-center space-x-2 mb-4">
    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
      Trigger Symbol:
    </label>
    <Input
      type="text"
      value={triggerSymbol}
      onChange={(e) => setTriggerSymbol(e.target.value)}
      maxLength={1}
      className="w-full h-8"
    />
  </div>
);
