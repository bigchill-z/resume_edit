import { useState, useEffect } from "react";
import type { TextStyle } from "../types/index";

interface ListItem {
  id: string;
  [key: string]: any;
}

interface UseListEditorOptions<T extends ListItem> {
  initialData: T[];
  onUpdate: (data: T[]) => void;
  onUpdateItemStyles?: (id: string, styles: any) => void;
}

export function useListEditor<T extends ListItem>({
  initialData,
  onUpdate,
  onUpdateItemStyles,
}: UseListEditorOptions<T>) {
  const [items, setItems] = useState<T[]>(initialData);

  useEffect(() => {
    setItems(initialData);
  }, [initialData]);

  const handleChange = (id: string, field: keyof T, value: any) => {
    const newItems = items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setItems(newItems);
    onUpdate(newItems);
  };

  const handleAddItem = (newItem: Omit<T, "id">) => {
    const item: T = {
      ...newItem,
      id: Date.now().toString(),
    } as T;
    const newItems = [...items, item];
    setItems(newItems);
    onUpdate(newItems);
  };

  const handleRemoveItem = (id: string) => {
    const newItems = items.filter((item) => item.id !== id);
    setItems(newItems);
    onUpdate(newItems);
  };

  const handleStyleChange = (
    id: string,
    field: string,
    style: Partial<TextStyle>
  ) => {
    const newItems = items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          styles: {
            ...item.styles,
            [field]: {
              ...item.styles?.[field],
              ...style,
            },
          },
        };
      }
      return item;
    });
    setItems(newItems);
    const item = items.find((i) => i.id === id);
    onUpdateItemStyles?.(id, {
      ...item?.styles,
      [field]: {
        ...item?.styles?.[field],
        ...style,
      },
    });
  };

  return {
    items,
    setItems,
    handleChange,
    handleAddItem,
    handleRemoveItem,
    handleStyleChange,
  };
}
