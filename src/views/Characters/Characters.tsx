import { Container } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { DataTable } from "@/components";
import { db } from "@/data/db";

const columns: GridColDef[] = [
  {
    field: "character_name",
    headerName: "Name",
    width: 220,
  },
  {
    field: "gender",
    headerName: "Gender",
    width: 80,
  },
  {
    field: "page",
    headerName: "Page",
    width: 80,
    type: "number",
  },
  {
    field: "role_notes",
    headerName: "Role",
    flex: 1,
    minWidth: 200,
  },
  {
    field: "friendly",
    headerName: "Friendly",
    width: 200,
    sortable: false,
    valueFormatter: (value: string[]) => value?.join(", ") ?? "",
  },
  {
    field: "hostile",
    headerName: "Hostile",
    width: 200,
    sortable: false,
    valueFormatter: (value: string[]) => value?.join(", ") ?? "",
  },
  {
    field: "familial_links",
    headerName: "Family",
    width: 200,
    sortable: false,
    valueFormatter: (value: string[]) => value?.join(", ") ?? "",
  },
];

export default function CharactersView() {
  return (
    <Container maxWidth="lg" sx={{ mb: 15 }}>
      <h1>Characters</h1>
      <DataTable
        rows={db}
        columns={columns}
        height="auto"
        getRowHeight={() => "auto"}
        showToolbar
      />
    </Container>
  );
}
