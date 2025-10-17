/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useEffect, useState } from "react";
import { useQuery } from '@tanstack/react-query'
import dynamic from "next/dynamic";
import Image from "next/image";
const PDFViewer = dynamic(() => import('@/components/pdf-viewer'), { ssr: false })


const fetchItems = async () => {
    const res = await fetch('/api/items');
    const data = await res.json();
    return data.data;
  };

export default function Detail() {
  const { data: files = [], isLoading } = useQuery({
    queryKey: ['files'],
    queryFn: fetchItems,
    retry: 1,
  })

  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const savedId = localStorage.getItem('selectedFileId')
        setSelectedId(savedId || null)
    }
  }, [])

  useEffect(() => {
    if (selectedId) {
      localStorage.setItem('selectedFileId', selectedId)
    }
  }, [selectedId])

  useEffect(() => {
    if (!isLoading && files.length > 0) {
      const savedId = localStorage.getItem('selectedFileId')
      const validSavedId =
        savedId && files.some((f:any) => String(f._id) === savedId) ? savedId : null

      if (!selectedId && !validSavedId) {
        setSelectedId(files[0]._id)
      } else if (validSavedId && selectedId !== validSavedId) {
        setSelectedId(validSavedId)
      }
    }
  }, [files, isLoading, selectedId])

  const selectedFile = files.find((f:any) => String(f._id) === selectedId)

  const handleNav = (direction: 'next' | 'prev') => {
    if (!files.length) return
    const currentIndex = files.findIndex((f:any) => String(f._id) === selectedId)
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
    if (newIndex < 0) newIndex = files.length - 1
    if (newIndex >= files.length) newIndex = 0
    setSelectedId(files[newIndex]._id)
  }


  if (isLoading) return <div className="p-4">Loading files...</div>
  if (!files.length) return <div className="p-4">No files uploaded yet.</div>
  if (!selectedFile) return <div className="p-4">Selecting file...</div>

  return (
    <div className="flex border-t h-full">
      {/* Sidebar List */}
      <div className="w-1/4 border-r">
        <h3 className="text-xl font-bold border-b py-3 px-2">Files List</h3>
        <ul className="h-full overflow-auto">
          {files.map((file:any) => (
            <li
              key={file._id}
              className={`cursor-pointer text-sm md:text-md px-2 py-1 border-b border-slate-200 break-words bg-slate-100 ${
                file._id === selectedId ? 'text-blue-600 font-semibold' : ''
              }`}
              onClick={() => setSelectedId(file._id)}
            >
              {file.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Viewer */}
      <div className="w-3/4 p-4 h-[calc(100vh-70px)] overflow-auto">
        <div className="flex justify-between mb-3">
          <button
            className="p-1 px-2 text-blue-600 border border-blue-600 rounded-md"
            onClick={() => handleNav('prev')}
          >
            Previous
          </button>
          <button
            className="p-1 px-2 text-blue-600 border border-blue-600 rounded-md"
            onClick={() => handleNav('next')}
          >
            Next
          </button>
        </div>

        <div
          className="border border-slate-200 p-2.5 flex-1 overflow-auto flex flex-col items-center gap-2.5"
        >
          {selectedFile?.type?.startsWith('image/') ? (
            <Image
              src={selectedFile.content}
              alt={selectedFile.name}
              style={{ maxWidth: '100%' }}
            />
          ) : selectedFile.type === 'application/pdf' ? (
            <>
            <PDFViewer file={selectedFile} />
            </>
          ) : (
            <div>Unsupported file type</div>
          )}
        </div>
      </div>
    </div>
  )
}
