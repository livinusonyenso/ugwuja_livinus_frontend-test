import DocumentSigner from "@/components/document-signer"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto py-4 px-4">
          <h1 className="text-2xl font-bold">Document Signer & Annotation Tool</h1>
        </div>
      </header>
      <DocumentSigner />
    </main>
  )
}

