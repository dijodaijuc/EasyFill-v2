import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FolderPlus } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface CategorySelectProps {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  onNewCategory: () => void;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  onNewCategory,
}) => (
  <div className="flex items-center space-x-2">
    <Select
      value={selectedCategory}
      onValueChange={setSelectedCategory}
      disabled={categories.length === 0}
    >
      <SelectTrigger className="w-full">
        <SelectValue
          placeholder={
            categories.length === 0
              ? "No categories added, add one"
              : "Select a category"
          }
        />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.name}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <Button variant="outline" size="icon" onClick={onNewCategory}>
      <FolderPlus size={16} />
    </Button>
  </div>
);
