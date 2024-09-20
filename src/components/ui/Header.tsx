import React from "react";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";

interface HeaderProps {
  autoDetect: boolean;
  darkMode: boolean;
  setAutoDetect: (value: boolean) => void;
  setDarkMode: (value: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  autoDetect,
  darkMode,
  setDarkMode,
  setAutoDetect,
}) => (
  <div className="flex justify-between items-center mb-4">
    <h1 className="text-xl font-bold">EasyFill</h1>
    <div className="flex items-center space-x-2">
      <span
        className={`text-xs font-medium 
          ${darkMode ? "text-white" : "text-gray-500"}`}
      >
        Auto detect
      </span>
      <Switch
        darkMode={darkMode}
        checked={autoDetect}
        onCheckedChange={(checked) => setAutoDetect(checked)}
      />
      {darkMode ? (
        <Moon size={16} onClick={() => setDarkMode(!darkMode)} />
      ) : (
        <Sun size={16} onClick={() => setDarkMode(!darkMode)} />
      )}
    </div>
  </div>
);
