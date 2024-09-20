import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FolderPlus } from "lucide-react";

interface NewCategoryInputProps {
  newCategory: string;
  setNewCategory: (value: string) => void;
  onAdd: () => void;
}

export const NewCategoryInput: React.FC<NewCategoryInputProps> = ({
  newCategory,
  setNewCategory,
  onAdd,
}) => (
  <div className="flex items-center space-x-2">
    <Input
      placeholder="New category name"
      value={newCategory}
      onChange={(e) => setNewCategory(e.target.value)}
    />
    <Button onClick={onAdd}>
      <FolderPlus size={16} />
    </Button>
  </div>
);
