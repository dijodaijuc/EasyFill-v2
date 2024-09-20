import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Trash2, Edit } from "lucide-react";

interface Snippet {
  id: string;
  command: string;
  content: string;
  category: string;
}

interface SnippetCardProps {
  snippet: Snippet;
  triggerSymbol: string;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: () => void;
}

export const SnippetCard: React.FC<SnippetCardProps> = ({
  snippet,
  triggerSymbol,
  onEdit,
  onDelete,
  onCopy,
}) => (
  <Card className="bg-white rounded-md border shadow-none">
    <CardContent className="p-4 flex items-center justify-between">
      <div>
        <div className="font-semibold">
          {triggerSymbol}
          {snippet.command}
        </div>
        <div className="text-sm text-gray-500">
          {snippet.content.substring(0, 30)}...
        </div>
        <div className="text-xs text-gray-400">{snippet.category}</div>
      </div>
      <div className="flex space-x-2">
        <button className="text-gray-500" onClick={onCopy}>
          <Copy size={16} />
        </button>
        <button className="text-gray-500" onClick={onDelete}>
          <Trash2 size={16} />
        </button>
        <button className="text-gray-500" onClick={onEdit}>
          <Edit size={16} />
        </button>
      </div>
    </CardContent>
  </Card>
);
