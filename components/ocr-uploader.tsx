"use client"

import type React from "react"
import { config } from '../config';

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Loader2, AlertCircle, CheckCircle2, File } from "lucide-react"

interface OCRPage {
  pageNumber: number
  text: string
}

interface OCRResponse {
  success: boolean
  totalPages: number
  pages: OCRPage[]
}

export default function OCRUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<OCRResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const OCR_API_URL = config.OCR_API_URL!;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setError("Please select a PDF file")
        setFile(null)
        return
      }
      setFile(selectedFile)
      setError(null)
      setResult(null)
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(OCR_API_URL, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to process OCR request")
      }

      const data: OCRResponse = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">PDF OCR Extractor</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Upload a PDF to extract text using OCR technology
          </p>
        </div>

        {/* Form Card */}
        <Card className="p-6 sm:p-8 shadow-lg border border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Input */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground">Select PDF File</label>
              <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  aria-label="Upload PDF file"
                />
                <div className="border-2 border-dashed border-border rounded-lg p-6 sm:p-8 text-center hover:border-primary/50 transition-colors">
                  <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-foreground font-medium text-sm sm:text-base">Click to select or drag and drop</p>
                  <p className="text-muted-foreground text-xs sm:text-sm mt-1">PDF files only</p>
                </div>
              </div>

              {/* File Name Display */}
              {file && (
                <div className="flex items-center justify-between gap-2 mt-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 min-w-0">
                    <File className="w-4 h-4 text-primary flex-shrink-0" />
                    <p className="text-sm text-foreground truncate">{file.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="flex-shrink-0 p-1 hover:bg-primary/20 rounded transition-colors"
                    aria-label="Remove file"
                  >
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={!file || loading} className="w-full py-2 sm:py-3 text-base font-medium">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Submit for OCR"
              )}
            </Button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Results Section */}
          {result && (
            <div className="mt-6 space-y-4">
              {/* Success Banner */}
              <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-lg flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-300">OCR Processing Complete</p>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    {result.totalPages} page{result.totalPages !== 1 ? "s" : ""} processed successfully
                  </p>
                </div>
              </div>

              {/* Pages Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg border border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Pages</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground mt-2">{result.totalPages}</p>
                </div>
              </div>

              {/* Individual Pages */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground block">Extracted Pages</label>
                <div className="grid gap-4 max-h-96 overflow-y-auto">
                  {result.pages.map((page) => (
                    <Card key={page.pageNumber} className="p-4 border-border/50">
                      <CardHeader className="p-0 mb-3">
                        <CardTitle className="text-base">Page {page.pageNumber}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="bg-muted rounded p-3 text-sm text-foreground whitespace-pre-wrap break-words max-h-40 overflow-y-auto">
                          {page.text}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Reset Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFile(null)
                  setResult(null)
                  setError(null)
                  if (fileInputRef.current) fileInputRef.current.value = ""
                }}
                className="w-full"
              >
                Process Another PDF
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
