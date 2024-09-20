import { useState, useEffect, useRef } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Edit,
  Trash2,
  FolderPlus,
  Upload,
  Download,
  Copy,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const filteredSnippets = snippets.filter(
    (snippet) =>
      (selectedCategory === "all" || snippet.category === selectedCategory) &&
      (snippet.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
        snippet.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        alert("Snippet copied to clipboard!");
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  return (
    <div className="w-80 h-[600px] px-4 py-4 overflow-y-auto">
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="snippets">Snippets</TabsTrigger>
          <TabsTrigger value="add-snippets">
            {editingSnippet ? "Edit Snippet" : "Add Snippet"}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="snippets">
          <div className="space-y-4 mt-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Type a command or search..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
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
            {filteredSnippets.map((snippet) => (
              <Card
                key={snippet.id}
                className="bg-white rounded-md border shadow-none"
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">
                      {triggerSymbol}
                      {snippet.command}
                    </div>
                    <div className="text-sm text-gray-500">
                      {snippet.content.substring(0, 30)}...
                    </div>
                    <div className="text-xs text-gray-400">
                      {snippet.category}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="text-gray-500"
                      onClick={() => copySnippetContent(snippet.content)}
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      className="text-gray-500"
                      onClick={() => deleteSnippet(snippet.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      className="text-gray-500"
                      onClick={() => editSnippet(snippet)}
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="add-snippets">
          <div className="space-y-4 mt-4">
            <div>
              <label className="block mb-1 text-sm font-medium">Command</label>
              <Input
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
              <label className="block mb-1 text-sm font-medium">
                Text snippet
              </label>
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
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}
                >
                  <FolderPlus size={16} />
                </Button>
              </div>
            </div>
            {showNewCategoryInput && (
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="New category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <Button onClick={addCategory}>
                  <FolderPlus size={16} />
                </Button>
              </div>
            )}
            <Button
              className="w-full bg-black text-white hover:bg-gray-800"
              onClick={saveSnippet}
            >
              {editingSnippet ? "Edit snippet" : "Add snippet"}
            </Button>
            <div className="flex justify-between space-x-2 mt-4">
              <Button
                onClick={exportSnippets}
                className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <Download size={16} className="mr-2" />
                Export
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                <Upload size={16} className="mr-2" />
                Import
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="application/json"
                onChange={importSnippets}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default App;
