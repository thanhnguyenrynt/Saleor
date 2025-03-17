"use client";

import React, {  } from 'react';
import dynamic from 'next/dynamic';

// Import Designer component với dynamic import để tránh lỗi SSR
const Designer = dynamic(
  () => import('@/components/Designer'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[500px] bg-gray-100 rounded-lg animate-pulse">
        <p className="text-gray-500">Loading designer...</p>
      </div>
    )
  }
);

interface DesignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productImage: string;
  productName: string;
  onSaveDesign: (designData: any) => void;
}

export function DesignDialog({ 
  isOpen, 
  onClose, 
  // productImage, 
  productName, 
  // onSaveDesign 
}: DesignDialogProps) {
  // Kiểm tra nếu dialog không mở thì không render gì cả
  if (!isOpen) return null;

  // const handleSaveDesign = (designData: any) => {
  //   onSaveDesign(designData);
  // };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Customize {productName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="h-full min-h-[500px]">
            <Designer />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}