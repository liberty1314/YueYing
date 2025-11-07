"use client";

import { ItemCard } from "./ItemCard";
import type { UserItem } from "@/types/user-item";

interface GridViewProps {
  items: UserItem[];
  onDelete: (id: number, title: string) => void;
}

export function GridView({ items, onDelete }: GridViewProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} onDelete={onDelete} />
      ))}
    </div>
  );
}

