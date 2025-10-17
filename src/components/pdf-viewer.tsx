'use client'

import { useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

export default function PDFViewer({ file }: { file: any }) {
  const [numPages, setNumPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const scrollRef = useRef<HTMLDivElement>(null)

  
  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= numPages) {
      setCurrentPage(pageNum)
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    }
  }
  return (
    <div ref={scrollRef}>
        <Document
                file={file.content}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={<div>Loading PDF page {currentPage}...</div>}
              >
                <Page
                  pageNumber={currentPage}
                  width={Math.min(600, window.innerWidth * 0.6)}
                  renderTextLayer
                  renderAnnotationLayer
                />
              </Document>

      <div>
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Prev
        </button>
        <span>
          {currentPage} / {numPages}
        </span>
        <button
          onClick={() => goToPage(currentPage <= numPages ? currentPage + 1 :1)}
          disabled={currentPage >= numPages}
        >
          Next
        </button>
      </div>
    </div>
  )
}
