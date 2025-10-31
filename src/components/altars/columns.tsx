"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

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
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const altar = row.original;
      const [showIdDialog, setShowIdDialog] = useState(false);

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowIdDialog(true)}>
                Ver ID del altar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={showIdDialog} onOpenChange={setShowIdDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>ID del Altar</DialogTitle>
                <DialogDescription>
                  Comparte este ID con otros para que puedan unirse como editores
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  readOnly
                  value={altar._id}
                  onClick={(e) => e.currentTarget.select()}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Haz clic en el campo para seleccionar y copiar
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
];
