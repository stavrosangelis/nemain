import {
  DataGrid,
  GridToolbar,
  type GridColDef,
  type GridFilterModel,
  type GridPaginationModel,
  type GridRowModel,
  type GridSortModel,
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";

type Props = {
  height?: number | "auto";
  columns: GridColDef[];
  rows: { id: number; [key: string]: unknown }[];
  onCellEdit?: (params: { id: number; field: string; value: unknown }) => void;
  getRowHeight?: Parameters<typeof DataGrid>[0]["getRowHeight"];
  loading?: boolean;
  rowCount?: number;
  paginationModel?: GridPaginationModel;
  onPaginationModelChange?: (model: GridPaginationModel) => void;
  sortModel?: GridSortModel;
  onSortModelChange?: (model: GridSortModel) => void;
  filterModel?: GridFilterModel;
  onFilterModelChange?: (model: GridFilterModel) => void;
  showToolbar?: boolean;
};

const defaultPaginationModel: GridPaginationModel = { page: 0, pageSize: 25 };

export default function DataTable(props: Props) {
  const {
    height = 400,
    columns,
    rows,
    onCellEdit,
    getRowHeight,
    loading,
    rowCount,
    paginationModel,
    onPaginationModelChange,
    sortModel,
    onSortModelChange,
    filterModel,
    onFilterModelChange,
    showToolbar,
  } = props;

  const isAuto = height === "auto";
  const isServerPagination = rowCount !== undefined;
  const isServerSort = onSortModelChange !== undefined;
  const isServerFilter = onFilterModelChange !== undefined;

  const processRowUpdate = (newRow: GridRowModel) => {
    if (onCellEdit) {
      const oldRow = rows.find((r) => r.id === newRow.id);
      if (oldRow) {
        Object.keys(newRow).forEach((field) => {
          if (field !== "id" && oldRow[field] !== newRow[field]) {
            onCellEdit({
              id: newRow.id as number,
              field,
              value: newRow[field],
            });
          }
        });
      }
    }
    return newRow;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const virtualScroller = e.currentTarget.querySelector(
      ".MuiDataGrid-virtualScroller",
    ) as HTMLElement;
    if (!virtualScroller) return;
    const isScrollable =
      virtualScroller.scrollHeight > virtualScroller.clientHeight;
    if (!isScrollable) return;
    const isAtTop = virtualScroller.scrollTop === 0;
    const isAtBottom =
      virtualScroller.scrollTop + virtualScroller.clientHeight >=
      virtualScroller.scrollHeight - 1;
    const isScrollingUp = e.deltaY < 0;
    const isScrollingDown = e.deltaY > 0;
    if ((isScrollingUp && !isAtTop) || (isScrollingDown && !isAtBottom)) {
      e.stopPropagation();
    }
  };

  if (height === 0) return null;

  const controlledPaginationProps =
    paginationModel !== undefined
      ? { paginationModel, onPaginationModelChange }
      : {
          initialState: {
            pagination: { paginationModel: defaultPaginationModel },
          },
        };

  return (
    <Paper
      sx={{ height: isAuto ? "auto" : height, width: "100%" }}
      onWheel={handleWheel}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        processRowUpdate={processRowUpdate}
        getRowHeight={getRowHeight}
        autoHeight={isAuto}
        loading={loading}
        // Pagination
        paginationMode={isServerPagination ? "server" : "client"}
        rowCount={isServerPagination ? rowCount : undefined}
        pageSizeOptions={
          isServerPagination
            ? [10, 25, 50, 100]
            : [10, 25, 50, 100, { value: -1, label: "All" }]
        }
        {...controlledPaginationProps}
        // Sorting
        sortingMode={isServerSort ? "server" : "client"}
        {...(sortModel !== undefined ? { sortModel, onSortModelChange } : {})}
        // Filtering
        filterMode={isServerFilter ? "server" : "client"}
        {...(filterModel !== undefined
          ? { filterModel, onFilterModelChange }
          : {})}
        // Toolbar
        slots={showToolbar ? { toolbar: GridToolbar } : undefined}
        slotProps={
          showToolbar
            ? {
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 500 },
                },
              }
            : undefined
        }
        sx={{
          border: 0,
          "& .MuiDataGrid-cell": {
            padding: "8px",
          },
          '& .MuiDataGrid-cell[data-field="sources"]': {
            padding: "0",
          },
        }}
      />
    </Paper>
  );
}
