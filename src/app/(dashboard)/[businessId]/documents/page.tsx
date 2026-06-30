'use client'

import { useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { useDataStore } from '@/stores/data-store'
import { formatDate } from '@/lib/utils'
import { FileText, Upload, File, FileImage, FileSpreadsheet, Trash2 } from 'lucide-react'
import type { Document } from '@/types'

function getFileIcon(fileType: string) {
  if (fileType.includes('image')) return FileImage
  if (fileType.includes('sheet') || fileType.includes('excel') || fileType.includes('csv')) return FileSpreadsheet
  return FileText
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const CATEGORY_STYLE: Record<string, string> = {
  invoice:  'bg-blue-100 text-blue-700',
  contract: 'bg-amber-100 text-amber-700',
  report:   'bg-green-100 text-green-700',
  other:    'bg-gray-100 text-gray-500',
}

function guessCategory(name: string): Document['category'] {
  const lower = name.toLowerCase()
  if (lower.includes('invoice') || lower.includes('inv')) return 'invoice'
  if (lower.includes('contract') || lower.includes('agreement')) return 'contract'
  if (lower.includes('report') || lower.includes('summary')) return 'report'
  return 'other'
}

export default function DocumentsPage() {
  const { businessId } = useParams<{ businessId: string }>()
  const { get, addDocument, removeDocument } = useDataStore()
  const { documents } = get(businessId)

  const onDrop = useCallback((files: File[]) => {
    files.forEach((file) => {
      addDocument(businessId, {
        id: Date.now().toString() + Math.random(),
        business_id: businessId,
        name: file.name,
        file_url: URL.createObjectURL(file),
        file_type: file.type || 'application/octet-stream',
        file_size: file.size,
        category: guessCategory(file.name),
        uploaded_by: 'owner',
        created_at: new Date().toISOString(),
      })
    })
  }, [businessId, addDocument])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
  })

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Documents</h1>
        <p className="text-sm text-gray-400">{documents.length} file{documents.length !== 1 ? 's' : ''} uploaded</p>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`mb-6 cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          isDragActive
            ? 'border-indigo-400 bg-indigo-50'
            : 'border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-3 h-8 w-8 text-gray-300" />
        {isDragActive ? (
          <p className="text-sm font-medium text-indigo-600">Drop files here</p>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-600">Drag & drop files, or click to browse</p>
            <p className="mt-1 text-xs text-gray-400">PDF, Word, Excel, CSV, Images</p>
          </>
        )}
      </div>

      {/* File list */}
      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-12 text-center">
          <File className="mb-3 h-8 w-8 text-gray-200" />
          <p className="text-sm text-gray-400">No documents uploaded yet</p>
          <p className="mt-1 text-xs text-gray-300">Upload invoices, contracts, reports — ask the AI about them</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {documents.map((doc) => {
            const Icon = getFileIcon(doc.file_type)
            return (
              <div key={doc.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                  <Icon className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{doc.name}</p>
                  <p className="text-xs text-gray-400">{formatSize(doc.file_size)} · {formatDate(doc.created_at)}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${CATEGORY_STYLE[doc.category] ?? CATEGORY_STYLE.other}`}>
                  {doc.category}
                </span>
                <button onClick={() => removeDocument(businessId, doc.id)} className="rounded p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
