import React from "react";
import { cn } from "~/lib/utils";

interface MenuItemProps {
  children: React.ReactNode;
  onClick: () => void;
}

export const MenuItem: React.FC<MenuItemProps> = ({ children, onClick }) => (
  <button
    className={cn(
      "w-full px-3 py-2 text-sm text-left",
      "hover:bg-accent hover:text-accent-foreground",
      "focus:outline-none focus:bg-accent focus:text-accent-foreground",
      "flex items-center"
    )}
    onClick={onClick}
  >
    {children}
  </button>
);
