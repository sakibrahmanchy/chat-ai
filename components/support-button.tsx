"use client";

import { Button } from "@/components/ui/button";
import { LifeBuoy } from "lucide-react";
import { useState } from "react";
import { SupportDialog } from "./support-dialog";

const defaultRenderButton = (onClick: () => void) => (
  <Button 
    variant="outline" 
    size="sm" 
    className="fixed bottom-4 right-4 shadow-md hover:shadow-lg transition-shadow duration-200 gap-2 bg-white"
    onClick={onClick}
  >
    <LifeBuoy className="h-4 w-4" />
    Get Help
  </Button>
);

interface SupportButtonProps {
  children?: React.ReactNode;
  renderButton?: (onClick: () => void) => React.ReactNode;
}

export function SupportButton({ children, renderButton = defaultRenderButton }: SupportButtonProps) {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  return (
    <>
      {children ? (
        <div onClick={handleClick}>
          {children}
        </div>
      ) : (
        renderButton(handleClick)
      )}
      
      <SupportDialog 
        open={open} 
        onOpenChange={setOpen}
      />
    </>
  );
} 