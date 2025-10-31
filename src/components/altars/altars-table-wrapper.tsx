"use client";

import { useQuery } from "convex/react";
import { useQueryStates, parseAsInteger, parseAsString } from "nuqs";
import { api } from "@/convex/_generated/api";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export function AltarsTableWrapper() {
  // Fetch data from Convex
  const altars = useQuery(api.altars.listMyAltarsAndCollaborations);

  // URL state management with nuqs
  const [state, setState] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(20),
      search: parseAsString.withDefault(""),
      role: parseAsString.withDefault("all"),
      sortBy: parseAsString.withDefault("createdAt"),
      sortOrder: parseAsString.withDefault("desc"),
    },
    {
      history: "push",
    },
  );

  // Loading state
  if (altars === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Cargando altares...</div>
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={altars}
      page={state.page}
      pageSize={state.pageSize}
      search={state.search}
      roleFilter={state.role}
      sortBy={state.sortBy}
      sortOrder={state.sortOrder}
      onPageChange={(page) => setState({ page })}
      onPageSizeChange={(pageSize) => setState({ pageSize, page: 1 })}
      onSearchChange={(search) => setState({ search, page: 1 })}
      onRoleFilterChange={(role) => setState({ role, page: 1 })}
      onSortChange={(sortBy, sortOrder) => setState({ sortBy, sortOrder })}
    />
  );
}
