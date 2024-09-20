import React from "react";
import { Input } from "@/components/ui/input";

interface TriggerSymbolInputProps {
  triggerSymbol: string;
  darkMode: boolean;
  setTriggerSymbol: (value: string) => void;
}

export const TriggerSymbolInput: React.FC<TriggerSymbolInputProps> = ({
  triggerSymbol,
  darkMode,
  setTriggerSymbol,
}) => (
  <div className="flex items-center space-x-2 mb-4">
    <label
      className={`text-sm font-medium whitespace-nowrap
          ${darkMode ? "text-white" : "text-gray-700"}`}
    >
      Trigger Symbol:
    </label>
    <Input
      type="text"
      darkMode={darkMode}
      value={triggerSymbol}
      onChange={(e) => setTriggerSymbol(e.target.value)}
      maxLength={1}
      className="w-full h-8"
    />
  </div>
);
