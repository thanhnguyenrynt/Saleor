"use client";

import React, { useState } from 'react';
import { DesignDialog } from '@/components/DesignDialog';

interface DesignButtonProps {
  productImage: string;
  productName: string;
  isCustomizable?: boolean;
  onDesignSaved?: (designData: any) => void;
}

export function DesignButton({ 
  productImage, 
  productName, 
  isCustomizable = true,
  onDesignSaved 
}: DesignButtonProps) {
  const [showDesigner, setShowDesigner] = useState(false);
  const [designData, setDesignData] = useState<any>(null);

  // Xử lý khi lưu thiết kế
  const handleSaveDesign = (data: any) => {
    setDesignData(data);
    setShowDesigner(false);
    if (onDesignSaved) {
      onDesignSaved(data);
    }
  };

  if (!isCustomizable) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setShowDesigner(true)}
        className="flex items-center justify-center rounded-md border border-indigo-600 bg-white px-8 py-3 text-base font-medium text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Customize Design
      </button>

      {showDesigner && (
        <DesignDialog 
          isOpen={showDesigner}
          onClose={() => setShowDesigner(false)}
          productImage={productImage}
          productName={productName}
          onSaveDesign={handleSaveDesign}
        />
      )}
    </>
  );
}