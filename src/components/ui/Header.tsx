import React from "react";
import { Switch } from "@/components/ui/switch";

interface HeaderProps {
  autoDetect: boolean;
  setAutoDetect: (value: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  autoDetect,
  setAutoDetect,
}) => (
  <div className="flex justify-between items-center mb-4">
    <h1 className="text-xl font-bold">EasyFill</h1>
    <div className="flex items-center space-x-2">
      <span className="text-xs font-medium text-gray-500">Auto detect</span>
      <Switch
        checked={autoDetect}
        onCheckedChange={(checked) => setAutoDetect(checked)}
      />
    </div>
  </div>
);
