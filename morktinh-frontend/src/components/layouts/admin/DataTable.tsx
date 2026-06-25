"use client";

import { DataGrid, GridColDef, GridPaginationModel, GridRowsProp } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";

interface DataTableProps {
  rows: GridRowsProp;
  columns: GridColDef[];
  loading?: boolean;
  checkboxSelection?: boolean;
  paginationMode?: "client" | "server";
  rowCount?: number;
  paginationModel?: GridPaginationModel;
  onPaginationModelChange?: (model: GridPaginationModel) => void;
}

export default function DataTable({
  rows,
  columns,
  loading,
  checkboxSelection = true,
  paginationMode = "client",
  rowCount,
  paginationModel,
  onPaginationModelChange,
}: DataTableProps) {
  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        autoHeight
        getRowHeight={() => 'auto'}
        disableColumnResize
        disableRowSelectionOnClick
        checkboxSelection={checkboxSelection}
        paginationMode={paginationMode}
        rowCount={rowCount}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={[5, 10, 25]}
        slotProps={{
          basePagination: {
            material: {
              slotProps: {
                select: { native: true },
              },
            },
          },
        }}
        initialState={{
          pagination: {
            paginationModel: {
              page: 0,
              pageSize: 10,
            },
          },
        }}
        sx={{
          border: 0,
          "& .MuiDataGrid-cell": {
            display: "flex",
            alignItems: "center",
          },
          "& .MuiDataGrid-cell:focus": {
            outline: "none",
          },
          "& .MuiDataGrid-cell:focus-within": {
            outline: "none",
          },
          "& .MuiDataGrid-columnHeader:focus": {
            outline: "none",
          },
          "& .MuiDataGrid-columnHeader:focus-within": {
            outline: "none",
          },
        }}
      />
    </Paper>
  );
}
