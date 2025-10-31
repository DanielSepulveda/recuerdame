"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type AltarRow = {
  _id: string;
  _creationTime: number;
  title: string;
  description?: string;
  ownerId: string;
  createdAt: number;
  updatedAt: number;
  roomId: string;
  tags?: string[];
  culturalElements?: string[];
  userRole: "owner" | "editor" | "viewer";
};

export const columns: ColumnDef<AltarRow>[] = [
  {
    accessorKey: "title",
    header: "Título",
    cell: ({ row }) => {
      const roomId = row.original.roomId;
      const title = row.getValue("title") as string;
      return (
        <Link
          href={`/app/altar/${roomId}`}
          className="font-medium hover:underline"
        >
          {title}
        </Link>
      );
    },
  },
  {
    accessorKey: "userRole",
    header: "Rol",
    cell: ({ row }) => {
      const role = row.getValue("userRole") as "owner" | "editor";
      return (
        <Badge variant={role === "owner" ? "default" : "secondary"}>
          {role === "owner" ? "Propietario" : "Editor"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-0 hover:bg-transparent"
        >
          Fecha de Creación
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <span className="text-muted-foreground">
          {date.toLocaleDateString("es-MX", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      );
    },
  },
];
