"use client";

import { ItemRow } from "./ItemRow";
import type { UserItem } from "@/types/user-item";

interface ListViewProps {
  items: UserItem[];
  onDelete: (id: number, title: string) => void;
}

export function ListView({ items, onDelete }: ListViewProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <ItemRow key={item.id} item={item} onDelete={onDelete} />
      ))}
    </div>
  );
}

