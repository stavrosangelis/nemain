import { Box, Container, Typography } from "@mui/material";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Link } from "react-router";
import { DataTable } from "@/components";
import { db } from "@/data/db";
import type { Source } from "@/types";

const columns: GridColDef[] = [
  {
    field: "character_name",
    headerName: "Name",
    width: 220,
    renderCell: (params: GridRenderCellParams) => {
      const { id, character_name } = params.row;
      return <Link to={`/characters/${id}`}>{character_name}</Link>;
    },
  },
  {
    field: "gender",
    headerName: "Gender",
    width: 70,
  },
  {
    field: "faction",
    headerName: "Faction",
    width: 80,
  },
  {
    field: "allegiance",
    headerName: "Allegiance",
    width: 100,
  },
  {
    field: "sources",
    headerName: "Sources",
    minWidth: 400,
    sortable: false,
    renderCell: (params: GridRenderCellParams) => {
      return (
        <Box sx={{ maxHeight: "140px", overflowY: "auto", p: 0 }}>
          {params.row.sources.map((source: Source, index: number) => {
            const { name, page, role_notes } = source;
            return (
              <Box
                sx={{ py: 1, maxHeight: "100px", overflowY: "auto" }}
                key={`${index}.${page}.${name}`}
              >
                <Link to={`/characters/?source=${name}`}>
                  {name} [{page}]
                </Link>
                {role_notes && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 0.25 }}
                  >
                    {role_notes}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      );
    },
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
