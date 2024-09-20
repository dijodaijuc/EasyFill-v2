import { useState, useEffect, useRef } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Edit, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Snippet {
  id: string;
  command: string;
  content: string;
}

function App() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [newCommand, setNewCommand] = useState("");
  const [newContent, setNewContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [autoDetect, setAutoDetect] = useState(false);
  const [activeTab, setActiveTab] = useState("snippets");
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [triggerSymbol, setTriggerSymbol] = useState("-");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportSnippets = () => {
    const dataStr = JSON.stringify(snippets, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "snippets.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSnippets = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedSnippets = JSON.parse(event.target?.result as string);
          if (Array.isArray(importedSnippets)) {
            setSnippets(importedSnippets);
            chrome.storage.local.set({ snippets: importedSnippets });
            alert("Snippets imported successfully!");
          } else {
            alert("Invalid file format");
          }
        } catch (error) {
          alert("Error reading file");
        }
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    // Load snippets, autoDetect, and triggerSymbol from Chrome storage when the component mounts
    chrome.storage.local.get(
      ["snippets", "autoDetect", "triggerSymbol"],
      (result) => {
        if (result.snippets) {
          setSnippets(result.snippets);
        }
        if (result.autoDetect !== undefined) {
          setAutoDetect(result.autoDetect);
        }
        if (result.triggerSymbol) {
          setTriggerSymbol(result.triggerSymbol);
        }
      }
    );
  }, []);

  useEffect(() => {
    // Save autoDetect status to Chrome storage whenever it changes
    chrome.storage.local.set({ autoDetect });
  }, [autoDetect]);

  useEffect(() => {
    // Save triggerSymbol to Chrome storage whenever it changes
    chrome.storage.local.set({ triggerSymbol });
  }, [triggerSymbol]);

  const saveSnippet = () => {
    if (newCommand && newContent) {
      // Check for duplicate command
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
        // Update existing snippet
        updatedSnippets = snippets.map((snippet) =>
          snippet.id === editingSnippet.id
            ? { ...snippet, command: newCommand, content: newContent }
            : snippet
        );
      } else {
        // Create new snippet
        const newSnippet: Snippet = {
          id: Date.now().toString(),
          command: newCommand,
          content: newContent,
        };
        updatedSnippets = [...snippets, newSnippet];
      }

      setSnippets(updatedSnippets);
      chrome.storage.local.set({ snippets: updatedSnippets });
      setNewCommand("");
      setNewContent("");
      setEditingSnippet(null);
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
    setActiveTab("add-snippets");
  };

  const filteredSnippets = snippets.filter(
    (snippet) =>
      snippet.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-80 h-[600px] px-4 py-4">
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

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Trigger Symbol
        </label>
        <Input
          type="text"
          value={triggerSymbol}
          onChange={(e) => setTriggerSymbol(e.target.value)}
          maxLength={1}
          className="mt-1"
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
                  </div>
                  <div className="flex space-x-2">
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
          <div className="absolute bottom-0 flex space-x-4 mb-4">
            <Button
              onClick={exportSnippets}
              className="bg-transparent text-gray-700 hover:bg-gray-200 w-full"
            >
              Export Snippets
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-transparent text-gray-700 hover:bg-gray-200 w-full"
            >
              Import Snippets
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="application/json"
              onChange={importSnippets}
            />
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
                Tip: Make it easy to remember. Use {triggerSymbol}command to
                trigger.
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
            <Button
              className="w-full bg-black text-white hover:bg-gray-800"
              onClick={saveSnippet}
            >
              {editingSnippet ? "Edit snippet" : "Add snippet"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default App;
