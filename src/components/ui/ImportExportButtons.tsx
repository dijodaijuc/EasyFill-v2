import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";

interface ImportExportButtonsProps {
  onExport: () => void;
  darkMode: boolean;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ImportExportButtons: React.FC<ImportExportButtonsProps> = ({
  darkMode,
  onExport,
  onImport,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex justify-between space-x-2 mt-4">
      <Button
        darkMode={darkMode}
        onClick={onExport}
        className={`flex-1 ${
          darkMode
            ? "bg-gray-800 hover:bg-gray-700"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        <Download size={16} className="mr-2" />
        Export
      </Button>
      <Button
        darkMode={darkMode}
        onClick={() => fileInputRef.current?.click()}
        className={`flex-1 ${
          darkMode
            ? "bg-gray-800 hover:bg-gray-700"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        <Upload size={16} className="mr-2" />
        Import
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="application/json"
        onChange={onImport}
      />
    </div>
  );
};
