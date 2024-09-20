import React from "react";
import { SnippetCard } from "./SnippetCard";

interface Snippet {
  id: string;
  command: string;
  content: string;
  category: string;
}

interface SnippetListProps {
  snippets: Snippet[];
  searchTerm: string;
  selectedCategory: string;
  triggerSymbol: string;
  onEdit: (snippet: Snippet) => void;
  onDelete: (id: string) => void;
  onCopy: (content: string) => void;
}

export const SnippetList: React.FC<SnippetListProps> = ({
  snippets,
  searchTerm,
  selectedCategory,
  triggerSymbol,
  onEdit,
  onDelete,
  onCopy,
}) => {
  const filteredSnippets = snippets.filter(
    (snippet) =>
      (selectedCategory === "all" || snippet.category === selectedCategory) &&
      (snippet.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
        snippet.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4 mt-4">
      {filteredSnippets.map((snippet) => (
        <SnippetCard
          key={snippet.id}
          snippet={snippet}
          triggerSymbol={triggerSymbol}
          onEdit={() => onEdit(snippet)}
          onDelete={() => onDelete(snippet.id)}
          onCopy={() => onCopy(snippet.content)}
        />
      ))}
    </div>
  );
};
