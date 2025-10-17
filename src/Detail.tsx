import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { getFiles } from "./utils";

// Set PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const fetchFiles = async () => {
  const data  = await getFiles();
  return data as any[];
};

export default function Detail() {
  const { data: files = [], isLoading } = useQuery({
    queryKey: ["files"],
    queryFn: fetchFiles,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedId = localStorage.getItem("selectedFileId");
    setSelectedId(savedId || null);
  }, []);

  useEffect(() => {
    if (selectedId) {
      localStorage.setItem("selectedFileId", selectedId);
    }
  }, [selectedId]);

  useEffect(() => {
    if (!isLoading && files.length > 0) {
      const savedId = localStorage.getItem("selectedFileId");
      const validSavedId =
        savedId && files.some((f) => f.id === savedId) ? savedId : null;

      if (!selectedId && !validSavedId) {
        setSelectedId(files[0].id);
      } else if (validSavedId && selectedId !== validSavedId) {
        setSelectedId(validSavedId);
      }
    }
  }, [files, isLoading, selectedId]);

  const selectedFile = files.find((f) => f.id === selectedId);

  const handleNav = (direction: "next" | "prev") => {
    if (!files.length) return;
    const currentIndex = files.findIndex((f) => f.id === selectedId);
    let newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex < 0) newIndex = files.length - 1;
    if (newIndex >= files.length) newIndex = 0;
    setSelectedId(files[newIndex].id);
  };

  useEffect(() => {
    if (selectedId) {
      setCurrentPage(1);
    }
  }, [selectedId]);
  const handleScroll = () => {
    console.log("dddd");
    if (!scrollRef.current || selectedFile?.type !== "application/pdf") return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 20; // 20px threshold

    if (scrolledToBottom && currentPage < numPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };
  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= numPages) {
      setCurrentPage(pageNum);
      // Auto-scroll to top of new page
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    }
  };

  if (isLoading) {
    return <div style={{ padding: "20px" }}>Loading files...</div>;
  }

  if (!files.length) {
    return <div style={{ padding: "20px" }}>No files uploaded yet.</div>;
  }

  if (!selectedFile) {
    return <div style={{ padding: "20px" }}>Selecting file...</div>;
  }
  return (
    <div className="flex border-t-[1px] h-full">
      <div className="w-1/4 border-r-[1px]">
        <h3 className="text-xl font-bold border-b-[1px] py-3 px-2">
          Files List
        </h3>
        <ul className="h-full overflow-auto">
          {files.map((file) => (
            <li
              key={file.id}
              className={`cursor-pointer text-sm md:text-md whitespace-nowrap overflow-ellipsis overflow-hidden px-2 ${
                file.id === selectedId ? "text-primary" : ""
              } break-words bg-slate-100 py-1 border-b-[1px] border-slate-200 `}
              onClick={() => setSelectedId(file.id)}
            >
              {file.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="w-3/4 p-4 h-[calc(100vh-70px)] overflow-auto">
        <div className="flex justify-between mb-3 ">
          <button
            className="p-1 px-2 text-primary border border-primary rounded-md"
            onClick={() => handleNav("prev")}
          >
            Previous
          </button>
          <button
            className="p-1 px-2 text-primary border border-primary rounded-md"
            onClick={() => handleNav("next")}
          >
            Next
          </button>
        </div>
        <div
          ref={scrollRef}
          className="border-[1px] border-slate-200 p-2.5 flex-1 overflow-auto flex flex-col items-center gap-2.5"
          onScroll={handleScroll}
        >
          {selectedFile.type.startsWith("image/") ? (
            <img
              src={selectedFile.content}
              alt={selectedFile.name}
              style={{ maxWidth: "100%" }}
            />
          ) : selectedFile.type === "application/pdf" ? (
            <>
              <Document
                file={selectedFile.content}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={<div>Loading PDF page {currentPage}...</div>}
              >
                <Page
                  pageNumber={currentPage}
                  width={Math.min(600, window.innerWidth * 0.6)}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              </Document>
              {/* PDF Page Navigation (Only show for PDFs) */}
              {selectedFile.type === "application/pdf" && (
                <div className="flex justify-center gap-2.5 mb-2.5 flex-wrap text-xs">
                  <button
                    className=""
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    ← Prev Page
                  </button>
                  <span>
                    Page {currentPage} of {numPages}
                  </span>
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= numPages}
                  >
                    Next Page →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div>Unsupported file type</div>
          )}
        </div>
      </div>
    </div>
  );
}
