"use client";

import { useEditor, createShapeId } from "tldraw";
import { assetLibrary, getAssetsByCategory } from "@/lib/tldraw/assetLibrary";
import type { CustomAssetShape } from "@/lib/tldraw/CustomAssetShape";
import { useState } from "react";

export function AssetLibraryPanel() {
  const editor = useEditor();
  const [selectedCategory, setSelectedCategory] = useState<"backgrounds" | "decorations" | "all">("all");

  const handleAssetClick = (assetId: string) => {
    if (!editor) return;

    // Get the center of the viewport
    const { x, y } = editor.getViewportScreenCenter();

    // Create a new custom asset shape
    const shapeId = createShapeId();
    editor.createShape<CustomAssetShape>({
      id: shapeId,
      type: "custom-asset",
      x: x - 100, // Center the 200x200 default shape
      y: y - 100,
      props: {
        w: 200,
        h: 200,
        assetId,
      },
    });

    // Select the newly created shape
    editor.select(shapeId);
  };

  const filteredAssets = selectedCategory === "all"
    ? assetLibrary
    : getAssetsByCategory(selectedCategory);

  return (
    <div className="absolute top-4 right-4 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-[500]">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-sm text-gray-900">Asset Library</h3>
      </div>

      {/* Category Filter */}
      <div className="px-4 py-2 border-b border-gray-200 flex gap-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-2 py-1 text-xs rounded ${
            selectedCategory === "all"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setSelectedCategory("backgrounds")}
          className={`px-2 py-1 text-xs rounded ${
            selectedCategory === "backgrounds"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Backgrounds
        </button>
        <button
          onClick={() => setSelectedCategory("decorations")}
          className={`px-2 py-1 text-xs rounded ${
            selectedCategory === "decorations"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Decorations
        </button>
      </div>

      {/* Asset Grid */}
      <div className="max-h-96 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredAssets.map((asset) => (
            <button
              key={asset.id}
              onClick={() => handleAssetClick(asset.id)}
              className="group relative aspect-square bg-gray-50 rounded border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all overflow-hidden"
              title={asset.name}
            >
              <img
                src={asset.path}
                alt={asset.name}
                className="w-full h-full object-contain p-2"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                {asset.name}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
