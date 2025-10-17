/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { ArrowDownward, ArrowUpward } from "@mui/icons-material";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useRouter } from 'next/navigation'

interface FileItem {
  id: string;
  name: string;
  type: string;
  content: string;
  [key: string]: string | number;
}

const uploadFile = async (files: FileItem[]) => {
  const base64Promises = files?.map((file: any) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    })
  );

  const base64Contents = await Promise.all(base64Promises);


  const newFiles = base64Contents.map((base64, index) => ({
    name: files[index].name,
    uploadedDate: new Date().toISOString(),
    uploadedBy: "User",
    type: files[index].type,
    content: base64,
  }));

  
  const res = await fetch('/api/items',{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newFiles),}
  );
  const data = await res.json();
  return data.data;
};

const fetchItems = async () => {
  const res = await fetch('/api/items');
  const data = await res.json();
  return data.data;
};

export default function Home() {

  const router = useRouter()
  const queryClient = useQueryClient();
  const { data: files = [], isLoading } = useQuery({
    queryKey: ["files"],
    queryFn: fetchItems,
    retry:1
  });

  const mutation = useMutation({
    mutationFn: async (file: FileItem[]) => {
      return uploadFile(file);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["files"] }),
  });

  const [open, setOpen] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem("dashboardPagination") : JSON.stringify({ pageIndex: 0, pageSize: 10 }) ;
    return saved ? JSON.parse(saved) : { pageIndex: 0, pageSize: 10 };
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("dashboardPagination", JSON.stringify(pagination));
    }
  }, [pagination]);

  const columns = useMemo<ColumnDef<File>[]>(
    () => [
      { accessorKey: "_id", header: "S.NO", cell: (info) => info.row.index + 1, },
      {
        accessorKey: "name",
        header: "File Name",
        cell: ({ row } : any) => (
          <span
            style={{ cursor: "pointer", color: "blue" }}
            onClick={() => {
              localStorage.setItem("selectedFileId", row?.original._id);
              router.push("/detail");
            }}
          >
            {row.original.name}
          </span>
        ),
      },
      { accessorKey: "uploadedDate", header: "Uploaded Date" },
      { accessorKey: "uploadedBy", header: "Uploaded By" },
    ],
    [router]
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

    const validFiles: any = files.filter(
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
        console.log(error)
        alert(`Failed to upload some files. Check console for details.`);
      }

    }

    e.target.value = "";
    setOpen(false);
  };
  if (isLoading || mutation?.isPending) return <div>Loading...</div>;

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
