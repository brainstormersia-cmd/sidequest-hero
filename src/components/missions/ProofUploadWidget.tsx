import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Upload,
  X,
  Image as ImageIcon,
  File,
  CheckCircle2,
  AlertCircle,
  Camera
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
  status: "uploading" | "success" | "error";
  progress: number;
}

interface ProofUploadWidgetProps {
  missionId: string;
  onComplete: (files: UploadedFile[], notes: string) => Promise<void>;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  className?: string;
}

export const ProofUploadWidget = ({
  missionId,
  onComplete,
  maxFiles = 5,
  maxSizeMB = 10,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  className
}: ProofUploadWidgetProps) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [notes, setNotes] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles = Array.from(selectedFiles).slice(0, maxFiles - files.length);
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    newFiles.forEach((file) => {
      // Validate size
      if (file.size > maxSizeBytes) {
        alert(`Il file ${file.name} supera il limite di ${maxSizeMB}MB`);
        return;
      }

      // Validate type
      if (!acceptedTypes.includes(file.type)) {
        alert(`Il tipo di file ${file.type} non è supportato`);
        return;
      }

      const uploadedFile: UploadedFile = {
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        status: "uploading",
        progress: 0
      };

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFiles(prev =>
            prev.map(f =>
              f.id === uploadedFile.id
                ? { ...f, preview: e.target?.result as string }
                : f
            )
          );
        };
        reader.readAsDataURL(file);
      }

      setFiles(prev => [...prev, uploadedFile]);

      // Simulate upload progress
      simulateUpload(uploadedFile.id);
    });
  };

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setFiles(prev =>
        prev.map(f =>
          f.id === fileId
            ? {
                ...f,
                progress,
                status: progress === 100 ? "success" : "uploading"
              }
            : f
        )
      );

      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 200);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      alert("Carica almeno un file di prova");
      return;
    }

    const allUploaded = files.every(f => f.status === "success");
    if (!allUploaded) {
      alert("Attendi il completamento di tutti i caricamenti");
      return;
    }

    setIsSubmitting(true);
    try {
      await onComplete(files, notes.trim());
    } catch (error) {
      console.error("Error submitting proof:", error);
      alert("Errore nell'invio delle prove. Riprova.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Card className={cn("p-6 space-y-6", className)}>
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Carica le prove di completamento
        </h3>
        <p className="text-sm text-text-muted">
          Carica foto, video o documenti che dimostrano il completamento della missione
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-smooth cursor-pointer",
          isDragging
            ? "border-brand-primary bg-brand-primary/5"
            : "border-border-default hover:border-brand-primary/50 hover:bg-surface",
          files.length >= maxFiles && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => files.length < maxFiles && fileInputRef.current?.click()}
      >
        <Upload className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <p className="text-sm font-medium text-text-primary mb-1">
          Trascina i file qui o clicca per selezionare
        </p>
        <p className="text-xs text-text-muted">
          Max {maxFiles} file, {maxSizeMB}MB ciascuno. Formati: JPG, PNG, PDF
        </p>
        <div className="flex gap-2 justify-center mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            disabled={files.length >= maxFiles}
          >
            <Upload className="w-4 h-4 mr-2" />
            Scegli file
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // In production, this would trigger camera capture
              alert("Camera capture coming soon!");
            }}
            disabled={files.length >= maxFiles}
          >
            <Camera className="w-4 h-4 mr-2" />
            Scatta foto
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(",")}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-semibold">
            File caricati ({files.length}/{maxFiles})
          </Label>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-border-default"
              >
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-12 h-12 object-cover rounded flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded flex items-center justify-center flex-shrink-0">
                    {file.type.startsWith("image/") ? (
                      <ImageIcon className="w-6 h-6 text-text-muted" />
                    ) : (
                      <File className="w-6 h-6 text-text-muted" />
                    )}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-text-muted">
                    {formatFileSize(file.size)}
                  </p>
                  {file.status === "uploading" && (
                    <Progress value={file.progress} className="h-1 mt-2" />
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {file.status === "success" && (
                    <CheckCircle2 className="w-5 h-5 text-success-500" />
                  )}
                  {file.status === "error" && (
                    <AlertCircle className="w-5 h-5 text-error-500" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-semibold">
          Note aggiuntive (opzionale)
        </Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Aggiungi eventuali dettagli o spiegazioni sul lavoro completato..."
          className="min-h-[100px]"
          maxLength={500}
        />
        <p className="text-xs text-text-muted text-right">
          {notes.length}/500 caratteri
        </p>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={files.length === 0 || isSubmitting || files.some(f => f.status !== "success")}
        className="w-full bg-brand-primary text-white hover:bg-brand-primary/90 h-12 font-semibold"
      >
        {isSubmitting ? "Invio in corso..." : "Segna come completato"}
      </Button>

      <div className="bg-info-500/10 border border-info-500/20 rounded-lg p-4">
        <p className="text-xs text-text-muted leading-relaxed">
          💡 <span className="font-medium text-text-primary">Suggerimento:</span>{" "}
          Carica foto chiare che mostrano il lavoro completato. Questo aiuterà lo Giver ad approvare rapidamente il pagamento.
        </p>
      </div>
    </Card>
  );
};
