import React, { useState, useEffect } from "react";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastProps {
  message: string;
  isVisible: boolean;
  variant?: "success" | "error"; 
  onClose: () => void;
}

export default function Toast({ 
  message, 
  isVisible, 
  variant = "success", 
  onClose 
}: ToastProps) {
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isVisible) {
      // Auto-hide after 3 seconds
      timer = setTimeout(() => {
        onClose();
      }, 3000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "toast fixed bottom-5 right-5 z-50 bg-[#1E293B] border border-gray-700 text-white px-4 py-3 rounded-lg shadow-lg",
        "animate-in slide-in-from-bottom-full duration-300",
        "animate-out slide-out-to-bottom-full duration-300 delay-[2500ms]"
      )}
    >
      <div className="flex items-center">
        {variant === "success" ? (
          <Check className="text-[#10B981] mr-2 h-5 w-5" />
        ) : (
          <AlertCircle className="text-[#FB7185] mr-2 h-5 w-5" />
        )}
        <span>{message}</span>
      </div>
    </div>
  );
}
