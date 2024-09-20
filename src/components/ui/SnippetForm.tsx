import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CategorySelect } from "./CategorySelect";
import { NewCategoryInput } from "./NewCategoryInput";

interface Snippet {
  id: string;
  command: string;
  content: string;
  category: string;
}

interface Category {
  id: string;
  name: string;
}

interface SnippetFormProps {
  editingSnippet: Snippet | null;
  newCommand: string;
  setNewCommand: (value: string) => void;
  newContent: string;
  setNewContent: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  categories: Category[];
  onSave: () => void;
  triggerSymbol: string;
  newCategory: string;
  setNewCategory: (value: string) => void;
  addCategory: () => void;
  showNewCategoryInput: boolean;
  darkMode: boolean;
  setShowNewCategoryInput: (value: boolean) => void;
}

export const SnippetForm: React.FC<SnippetFormProps> = ({
  editingSnippet,
  newCommand,
  setNewCommand,
  darkMode,
  newContent,
  setNewContent,
  selectedCategory,
  setSelectedCategory,
  categories,
  onSave,
  triggerSymbol,
  newCategory,
  setNewCategory,
  addCategory,
  showNewCategoryInput,
  setShowNewCategoryInput,
}) => (
  <div className="space-y-4 mt-4">
    <div>
      <label className="block mb-1 text-sm font-medium">Command</label>
      <Input
        darkMode={darkMode}
        placeholder="Add your command"
        value={newCommand}
        onChange={(e) => setNewCommand(e.target.value)}
      />
      <p className="text-xs text-gray-500 mt-1">
        {newCommand === "" ? (
          "Tip: Make it easier to remember"
        ) : (
          <>
            Use {triggerSymbol}
            {newCommand} to expand the snippet.
          </>
        )}
      </p>
    </div>
    <div>
      <label className="block mb-1 text-sm font-medium">Text snippet</label>
      <Textarea
        placeholder="Add snippet"
        className="h-24"
        value={newContent}
        onChange={(e) => setNewContent(e.target.value)}
      />
      <p className="text-xs text-gray-500 mt-1">Max: 500 words</p>
    </div>
    <div>
      <label className="block mb-1 text-sm font-medium">Category</label>
      <CategorySelect
        darkMode={darkMode}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onNewCategory={() => setShowNewCategoryInput(!showNewCategoryInput)}
      />
    </div>
    {showNewCategoryInput && (
      <NewCategoryInput
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        onAdd={addCategory}
      />
    )}
    <Button
      darkMode={darkMode}
      className={`w-full text-white ${
        darkMode
          ? " bg-gray-800 hover:bg-gray-600 "
          : " hover:bg-gray-800 bg-black"
      }`}
      onClick={onSave}
    >
      {editingSnippet ? "Edit snippet" : "Add snippet"}
    </Button>
  </div>
);
