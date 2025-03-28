"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HexColorPicker } from "react-colorful"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  FileUp,
  Highlighter,
  Underline,
  MessageSquare,
  Pen,
  Download,
  Trash2,
  Check,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import { useDropzone } from "react-dropzone"
import { Document, Page, pdfjs } from "react-pdf"
import SignatureCanvas from "react-signature-canvas"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Initialize PDF.js worker
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
type Annotation = {
  id: string
  type: "highlight" | "underline" | "comment" | "signature"
  x: number
  y: number
  width?: number
  height?: number
  color?: string
  text?: string
  signatureData?: string
  pageNumber: number
}

export default function DocumentSigner() {
  const [file, setFile] = useState<File | null>(null)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [activeTab, setActiveTab] = useState<string>("upload")
  const [activeAnnotationTool, setActiveAnnotationTool] = useState<string | null>(null)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [color, setColor] = useState<string>("#ffcc00")
  const [commentText, setCommentText] = useState<string>("")
  const [commentPosition, setCommentPosition] = useState<{ x: number; y: number } | null>(null)
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false)
  const documentRef = useRef<HTMLDivElement>(null)
  const signatureRef = useRef<SignatureCanvas>(null)
  const [isAddingComment, setIsAddingComment] = useState<boolean>(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      if (file.type === "application/pdf") {
        setFile(file)
        setActiveTab("annotate")
        toast.success("PDF uploaded successfully")
      } else {
        toast.error("Please upload a PDF file")
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  })

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  const handleAnnotationClick = (tool: string) => {
    if (activeAnnotationTool === tool) {
      setActiveAnnotationTool(null)
    } else {
      setActiveAnnotationTool(tool)
      if (tool === "comment") {
        setIsAddingComment(true)
      } else {
        setIsAddingComment(false)
      }
    }
  }

  const handleDocumentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeAnnotationTool || !documentRef.current) return

    const rect = documentRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (activeAnnotationTool === "highlight" || activeAnnotationTool === "underline") {
      // Simulate text selection for highlight/underline
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: activeAnnotationTool as "highlight" | "underline",
        x,
        y,
        width: 100,
        height: 20,
        color,
        pageNumber,
      }
      setAnnotations([...annotations, newAnnotation])
      toast.success(`${activeAnnotationTool} added`)
    } else if (activeAnnotationTool === "comment" && isAddingComment) {
      setCommentPosition({ x, y })
      setIsAddingComment(false)
    } else if (activeAnnotationTool === "signature") {
      // Open signature pad at this position
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: "signature",
        x,
        y,
        pageNumber,
      }
      setAnnotations([...annotations, newAnnotation])
      toast.success("Signature added")
    }
  }

  const addComment = () => {
    if (commentPosition && commentText.trim()) {
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: "comment",
        x: commentPosition.x,
        y: commentPosition.y,
        text: commentText,
        color,
        pageNumber,
      }
      setAnnotations([...annotations, newAnnotation])
      setCommentText("")
      setCommentPosition(null)
      setActiveAnnotationTool(null)
      toast.success("Comment added")
    }
  }

  const cancelComment = () => {
    setCommentPosition(null)
    setCommentText("")
    setIsAddingComment(true)
  }

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear()
    }
  }

  const saveSignature = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      const signatureData = signatureRef.current.toDataURL()
      // Update the last signature annotation with the signature data
      const updatedAnnotations = annotations.map((ann) => {
        if (ann.type === "signature" && !ann.signatureData) {
          return { ...ann, signatureData }
        }
        return ann
      })
      setAnnotations(updatedAnnotations)
      setActiveAnnotationTool(null)
      toast.success("Signature saved")
    } else {
      toast.error("Please draw a signature first")
    }
  }

  const removeAnnotation = (id: string) => {
    setAnnotations(annotations.filter((ann) => ann.id !== id))
    toast.success("Annotation removed")
  }

  const exportPDF = () => {
    // In a real implementation, this would use a library to embed annotations into the PDF
    toast.success("PDF exported with annotations")
    // Simulate download
    const link = document.createElement("a")
    link.href = URL.createObjectURL(file!)
    link.download = "annotated-" + file!.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2.0))
  }

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.6))
  }

  return (
    <div className="flex-1 flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b">
          <div className="container mx-auto px-4">
            <TabsList className="my-2">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="annotate" disabled={!file}>
                Annotate
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="upload" className="flex-1 flex items-center justify-center p-4">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors max-w-xl w-full mx-auto",
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
            )}
          >
            <input {...getInputProps()} />
            <FileUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Drag & Drop your PDF here</h3>
            <p className="text-sm text-muted-foreground mb-4">or click to browse your files</p>
            <Button>Select PDF</Button>
          </div>
        </TabsContent>

        <TabsContent value="annotate" className="flex-1 flex flex-col">
          {file && (
            <>
              <div className="border-b">
                <div className="container mx-auto px-4 py-2 flex flex-wrap items-center gap-2">
                  <Button
                    variant={activeAnnotationTool === "highlight" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAnnotationClick("highlight")}
                  >
                    <Highlighter className="h-4 w-4 mr-2" />
                    Highlight
                  </Button>
                  <Button
                    variant={activeAnnotationTool === "underline" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAnnotationClick("underline")}
                  >
                    <Underline className="h-4 w-4 mr-2" />
                    Underline
                  </Button>
                  <Button
                    variant={activeAnnotationTool === "comment" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAnnotationClick("comment")}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Comment
                  </Button>
                  <Button
                    variant={activeAnnotationTool === "signature" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAnnotationClick("signature")}
                  >
                    <Pen className="h-4 w-4 mr-2" />
                    Signature
                  </Button>

                  {(activeAnnotationTool === "highlight" || activeAnnotationTool === "underline") && (
                    <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="ml-2">
                          <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: color }} />
                          Color
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-3">
                        <HexColorPicker color={color} onChange={setColor} />
                      </PopoverContent>
                    </Popover>
                  )}

                  <div className="ml-auto flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={zoomOut}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">{Math.round(scale * 100)}%</span>
                    <Button size="sm" variant="outline" onClick={zoomIn}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={exportPDF}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4 bg-muted/30">
                <div className="mx-auto max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
                  <div
                    ref={documentRef}
                    className="relative"
                    onClick={handleDocumentClick}
                    style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
                  >
                    <Document file={file} onLoadSuccess={onDocumentLoadSuccess} className="mx-auto">
                      <Page pageNumber={pageNumber} renderTextLayer={false} renderAnnotationLayer={false} />
                    </Document>

                    {/* Render annotations */}
                    {annotations
                      .filter((ann) => ann.pageNumber === pageNumber)
                      .map((annotation) => (
                        <div
                          key={annotation.id}
                          className="absolute"
                          style={{
                            left: `${annotation.x}px`,
                            top: `${annotation.y}px`,
                          }}
                        >
                          {annotation.type === "highlight" && (
                            <div
                              className="absolute opacity-50"
                              style={{
                                width: annotation.width,
                                height: annotation.height,
                                backgroundColor: annotation.color,
                              }}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-background shadow-sm opacity-0 hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeAnnotation(annotation.id)
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}

                          {annotation.type === "underline" && (
                            <div
                              className="absolute"
                              style={{
                                width: annotation.width,
                                height: "2px",
                                backgroundColor: annotation.color,
                                top: annotation.height,
                              }}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-background shadow-sm opacity-0 hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeAnnotation(annotation.id)
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}

                          {annotation.type === "comment" && (
                            <div className="absolute bg-yellow-100 p-2 rounded shadow-md w-48 border border-yellow-300">
                              <p className="text-xs">{annotation.text}</p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-background shadow-sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeAnnotation(annotation.id)
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}

                          {annotation.type === "signature" && (
                            <div className="absolute">
                              {annotation.signatureData ? (
                                <div className="relative">
                                  <img
                                    src={annotation.signatureData || "/placeholder.svg"}
                                    alt="Signature"
                                    className="max-w-[200px]"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-background shadow-sm opacity-0 hover:opacity-100"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      removeAnnotation(annotation.id)
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="bg-white border rounded shadow-md p-2">
                                  <div className="mb-2">
                                    <SignatureCanvas
                                      ref={signatureRef}
                                      canvasProps={{
                                        width: 300,
                                        height: 150,
                                        className: "border rounded",
                                      }}
                                      backgroundColor="white"
                                    />
                                  </div>
                                  <div className="flex justify-between">
                                    <Button size="sm" variant="outline" onClick={clearSignature}>
                                      Clear
                                    </Button>
                                    <Button size="sm" onClick={saveSignature}>
                                      Save
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}

                    {/* Comment input form */}
                    {commentPosition && (
                      <div
                        className="absolute bg-white p-3 rounded shadow-lg border"
                        style={{
                          left: `${commentPosition.x}px`,
                          top: `${commentPosition.y}px`,
                          width: "300px",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Label htmlFor="comment">Add Comment</Label>
                        <Textarea
                          id="comment"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="min-h-[100px] mb-2"
                          placeholder="Type your comment here..."
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={cancelComment}>
                            <X className="h-4 w-4 mr-1" /> Cancel
                          </Button>
                          <Button size="sm" onClick={addComment}>
                            <Check className="h-4 w-4 mr-1" /> Add
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t">
                <div className="container mx-auto px-4 py-2 flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                    disabled={pageNumber <= 1}
                  >
                    Previous
                  </Button>
                  <span>
                    Page {pageNumber} of {numPages || "--"}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageNumber(Math.min(numPages || 1, pageNumber + 1))}
                    disabled={pageNumber >= (numPages || 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

