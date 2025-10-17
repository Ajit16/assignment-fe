import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import type { File } from "./types"; // Create types.ts for this
import { getFiles, updateData } from "./utils";

const fetchFiles = async () => {
  const data  = await getFiles();
  return data as any[];
};

const uploadFile = async (file: any, oldFiles: any[]) => {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      const base64 = reader.result as string;
      const newFile = {
        name: file.name,
        uploadedDate: new Date().toISOString(),
        uploadedBy: "User",
        content: base64,
        type: file.type,
      };
      const newFiles = [...oldFiles, newFile]
      const { data } = await updateData(newFiles);
      resolve(data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: files = [], isLoading } = useQuery({
    queryKey: ["files"],
    queryFn: fetchFiles,
    retry:2
  });

  const mutation = useMutation({
    mutationFn: async (file: any) => {
      return uploadFile(file, files);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["files"] }),
  });

  const [open, setOpen] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState(() => {
    const saved = localStorage.getItem("dashboardPagination");
    return saved ? JSON.parse(saved) : { pageIndex: 0, pageSize: 10 };
  });

  useEffect(() => {
    localStorage.setItem("dashboardPagination", JSON.stringify(pagination));
  }, [pagination]);

  const columns = useMemo<ColumnDef<File>[]>(
    () => [
      { accessorKey: "id", header: "S.NO" },
      {
        accessorKey: "name",
        header: "File Name",
        cell: ({ row }: any) => (
          <span
            style={{ cursor: "pointer", color: "blue" }}
            onClick={() => {
              localStorage.setItem("selectedFileId", row.original.id);
              navigate("/detail");
            }}
          >
            {row.original.name}
          </span>
        ),
      },
      { accessorKey: "uploadedDate", header: "Uploaded Date" },
      { accessorKey: "uploadedBy", header: "Uploaded By" },
    ],
    [navigate]
  );

  const table = useReactTable({
    data: files,
    columns,
    state: { globalFilter, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  //   handle upload files
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(
      (file) =>
        file.type === "application/pdf" || file.type.startsWith("image/")
    );

    const invalidFiles = files.filter((file) => !validFiles.includes(file));

    if (invalidFiles.length > 0) {
      const invalidNames = invalidFiles.map((f) => f.name).join(", ");
      alert(
        `Invalid files skipped: ${invalidNames}\nOnly PDF and images allowed!`
      );
      return;
    }

    if (validFiles.length > 0) {
      try{
      mutation.mutateAsync(validFiles);
      } catch (error) {
        alert(`Failed to upload some files. Check console for details.`);
      }
      // const uploadPromises = validFiles.map((file) =>
      //   mutation.mutateAsync(file)
      // );

      // try {
      //   await Promise.all(uploadPromises);
      //   // alert(`Uploaded ${validFiles.length} file(s) successfully!`);
      // } catch (error) {
      //   alert(`Failed to upload some files. Check console for details.`);
      // }
    }

    e.target.value = "";
    setOpen(false);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="px-4">
      <div className="flex justify-between items-center space-x-2 mb-4">
        <button
          className="bg-primary px-3 py-2 rounded-md text-white hover:bg-primary/60 cursor-pointer"
          onClick={() => setOpen(true)}
        >
          Upload File
        </button>
        <input
          className="border p-2 border-slate-200 rounded-md"
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search..."
        />
      </div>
      <div className="overflow-x-auto w-full">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="bg-black"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{
                      asc: <ArrowUpward fontSize="small" />,
                      desc: <ArrowDownward fontSize="small" />,
                    }[header.column.getIsSorted() as string] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 space-x-1">
        <button
          className="p-1 px-2 text-primary border border-primary rounded-md"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </button>
        <span>
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>
        <button
          className="p-1 px-2 text-primary border border-primary rounded-md"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </button>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Upload PDF or Image</DialogTitle>
        <DialogContent>
          <input
            type="file"
            multiple
            accept="application/pdf,image/*"
            onChange={handleUpload}
            className="border p-2 border-slate-200 rounded-md"
          />
        </DialogContent>
        <DialogActions>
          <button
            className="p-1 px-2 text-primary border border-primary rounded-md"
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
