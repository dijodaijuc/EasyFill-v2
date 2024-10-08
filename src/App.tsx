import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TriggerSymbolInput } from "./components/ui/TriggerSymbolInput";
import { Header } from "./components/ui/Header";
import { SearchInput } from "./components/ui/SearchInput";
import { SnippetForm } from "./components/ui/SnippetForm";
import { SnippetList } from "./components/ui/SnippetList";
import { ImportExportButtons } from "./components/ui/ImportExportButtons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

function App() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCommand, setNewCommand] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [autoDetect, setAutoDetect] = useState(false);
  const [activeTab, setActiveTab] = useState("snippets");
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [triggerSymbol, setTriggerSymbol] = useState("-");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(
      ["snippets", "categories", "autoDetect", "triggerSymbol"],
      (result) => {
        if (result.snippets) setSnippets(result.snippets);
        if (result.categories) setCategories(result.categories);
        if (result.autoDetect !== undefined) setAutoDetect(result.autoDetect);
        if (result.triggerSymbol) setTriggerSymbol(result.triggerSymbol);
      }
    );
  }, []);

  useEffect(() => {
    // Check for user's preferred color scheme
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode) {
      setDarkMode(JSON.parse(savedMode));
      return;
    }
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    const handleChange = (event: MediaQueryListEvent) => {
      setDarkMode(event.matches);
    };
    setDarkMode(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    chrome.storage.local.set({ autoDetect });
  }, [autoDetect]);

  useEffect(() => {
    chrome.storage.local.set({ triggerSymbol });
  }, [triggerSymbol]);

  const saveSnippet = () => {
    if (newCommand && newContent) {
      if (
        snippets.some(
          (snippet) =>
            snippet.command === newCommand && snippet.id !== editingSnippet?.id
        )
      ) {
        alert("A snippet with this command already exists!");
        return;
      }

      let updatedSnippets: Snippet[];
      if (editingSnippet) {
        updatedSnippets = snippets.map((snippet) =>
          snippet.id === editingSnippet.id
            ? {
                ...snippet,
                command: newCommand,
                content: newContent,
                category:
                  selectedCategory === "all"
                    ? "Uncategorized"
                    : selectedCategory,
              }
            : snippet
        );
      } else {
        const newSnippet: Snippet = {
          id: Date.now().toString(),
          command: newCommand,
          content: newContent,
          category:
            selectedCategory === "all" ? "Uncategorized" : selectedCategory,
        };
        updatedSnippets = [...snippets, newSnippet];
      }

      setSnippets(updatedSnippets);
      chrome.storage.local.set({ snippets: updatedSnippets });
      setNewCommand("");
      setNewContent("");
      setEditingSnippet(null);
      setSelectedCategory("all");
      setActiveTab("snippets");
    }
  };

  const deleteSnippet = (id: string) => {
    const updatedSnippets = snippets.filter((snippet) => snippet.id !== id);
    setSnippets(updatedSnippets);
    chrome.storage.local.set({ snippets: updatedSnippets });
  };

  const editSnippet = (snippet: Snippet) => {
    setEditingSnippet(snippet);
    setNewCommand(snippet.command);
    setNewContent(snippet.content);
    setSelectedCategory(snippet.category);
    setActiveTab("add-snippets");
  };

  const addCategory = () => {
    if (newCategory && !categories.some((cat) => cat.name === newCategory)) {
      const updatedCategories = [
        ...categories,
        { id: Date.now().toString(), name: newCategory },
      ];
      setCategories(updatedCategories);
      chrome.storage.local.set({ categories: updatedCategories });
      setNewCategory("");
      setShowNewCategoryInput(false);
      setSelectedCategory(newCategory);
    }
  };

  const exportSnippets = () => {
    const dataStr = JSON.stringify({ snippets, categories }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "snippets_export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSnippets = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          if (imported.snippets && imported.categories) {
            setSnippets(imported.snippets);
            setCategories(imported.categories);
            chrome.storage.local.set({
              snippets: imported.snippets,
              categories: imported.categories,
            });
            alert("Snippets and categories imported successfully!");
          } else {
            alert("Invalid file format");
          }
        } catch (error) {
          console.error("Error importing snippets:", error);
          alert("Error reading file");
        }
      };
      reader.readAsText(file);
    }
  };

  const copySnippetContent = (content: string) => {
    navigator.clipboard.writeText(content).then(
      () => {
        console.log("Snippet copied to clipboard!");
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <div
      className={`w-80 h-[600px] px-4 py-4 ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      <Header
        setDarkMode={setDarkMode}
        darkMode={darkMode}
        autoDetect={autoDetect}
        setAutoDetect={setAutoDetect}
      />
      <TriggerSymbolInput
        darkMode={darkMode}
        triggerSymbol={triggerSymbol}
        setTriggerSymbol={setTriggerSymbol}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList darkMode={darkMode} className="grid w-full grid-cols-2">
          <TabsTrigger darkMode={darkMode} value="snippets">
            Snippets
          </TabsTrigger>
          <TabsTrigger darkMode={darkMode} value="add-snippets">
            {editingSnippet ? "Edit Snippet" : "Add Snippet"}
          </TabsTrigger>
        </TabsList>
        <TabsContent darkMode={darkMode} value="snippets">
          <div className="space-y-4 mt-4">
            <SearchInput
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <SnippetList
              darkMode={darkMode}
              snippets={snippets}
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              triggerSymbol={triggerSymbol}
              onEdit={editSnippet}
              onDelete={deleteSnippet}
              onCopy={copySnippetContent}
            />
          </div>
        </TabsContent>
        <TabsContent darkMode={darkMode} value="add-snippets">
          <SnippetForm
            darkMode={darkMode}
            editingSnippet={editingSnippet}
            newCommand={newCommand}
            setNewCommand={setNewCommand}
            newContent={newContent}
            setNewContent={setNewContent}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
            onSave={saveSnippet}
            triggerSymbol={triggerSymbol}
            newCategory={newCategory}
            setNewCategory={setNewCategory}
            addCategory={addCategory}
            showNewCategoryInput={showNewCategoryInput}
            setShowNewCategoryInput={setShowNewCategoryInput}
          />
          <ImportExportButtons
            darkMode={darkMode}
            onExport={exportSnippets}
            onImport={importSnippets}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default App;
