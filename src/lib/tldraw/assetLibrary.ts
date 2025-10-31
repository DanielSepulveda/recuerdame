export interface AssetDefinition {
  id: string;
  name: string;
  path: string;
  category: "backgrounds" | "decorations";
}

export const assetLibrary: AssetDefinition[] = [
  // Backgrounds
  {
    id: "altar-1",
    name: "Altar Background",
    path: "/canvas-assets/altar-1.png",
    category: "backgrounds",
  },

  // AWS Decorations
  {
    id: "aws-decor-1",
    name: "AWS Decoration 1",
    path: "/canvas-assets/aws-decor-1.png",
    category: "decorations",
  },
  {
    id: "aws-decor-2",
    name: "AWS Decoration 2",
    path: "/canvas-assets/aws-decor-2.png",
    category: "decorations",
  },

  // Regular Decorations
  {
    id: "decor-1",
    name: "Decoration 1",
    path: "/canvas-assets/decor-1.png",
    category: "decorations",
  },
  {
    id: "decor-2",
    name: "Decoration 2",
    path: "/canvas-assets/decor-2.png",
    category: "decorations",
  },
  {
    id: "decor-3",
    name: "Decoration 3",
    path: "/canvas-assets/decor-3.png",
    category: "decorations",
  },
  {
    id: "decor-4",
    name: "Decoration 4",
    path: "/canvas-assets/decor-4.png",
    category: "decorations",
  },
  {
    id: "decor-5",
    name: "Decoration 5",
    path: "/canvas-assets/decor-5.png",
    category: "decorations",
  },
  {
    id: "decor-6",
    name: "Decoration 6",
    path: "/canvas-assets/decor-6.png",
    category: "decorations",
  },
  {
    id: "decor-7",
    name: "Decoration 7",
    path: "/canvas-assets/decor-7.png",
    category: "decorations",
  },
  {
    id: "decor-8",
    name: "Decoration 8",
    path: "/canvas-assets/decor-8.png",
    category: "decorations",
  },
  {
    id: "decor-9",
    name: "Decoration 9",
    path: "/canvas-assets/decor-9.png",
    category: "decorations",
  },
  {
    id: "decor-10",
    name: "Decoration 10",
    path: "/canvas-assets/decor-10.png",
    category: "decorations",
  },
  {
    id: "decor-11",
    name: "Decoration 11",
    path: "/canvas-assets/decor-11.png",
    category: "decorations",
  },
];

// Helper to get asset by ID
export function getAssetById(id: string): AssetDefinition | undefined {
  return assetLibrary.find((asset) => asset.id === id);
}

// Helper to get assets by category
export function getAssetsByCategory(category: AssetDefinition["category"]): AssetDefinition[] {
  return assetLibrary.filter((asset) => asset.category === category);
}
