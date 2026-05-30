'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

const ACCEPTED = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
};

export function FileUploader({ onFileSelect, selectedFile, onClear }: FileUploaderProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejected: any[]) => {
      setError(null);
      if (rejected.length > 0) {
        setError('Invalid file. Please upload a PDF or DOCX file under 10MB.');
        return;
      }
      if (accepted[0]) onFileSelect(accepted[0]);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  if (selectedFile) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-primary/30 bg-primary/5">
        <FileText className="w-8 h-8 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{selectedFile.name}</p>
          <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
        </div>
        <button
          onClick={onClear}
          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Remove file"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200',
          isDragActive
            ? 'border-primary bg-primary/10 scale-[1.01]'
            : 'border-gray-200 bg-gray-50/50 hover:border-primary/50 hover:bg-primary/5'
        )}
      >
        <input {...getInputProps()} />
        <div className={cn('p-4 rounded-full transition-colors', isDragActive ? 'bg-primary/20' : 'bg-gray-100')}>
          <UploadCloud className={cn('w-8 h-8 transition-colors', isDragActive ? 'text-primary' : 'text-gray-400')} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            or <span className="text-primary font-medium hover:underline">browse files</span>
          </p>
          <p className="text-xs text-muted-foreground mt-2">PDF, DOCX — max 10MB</p>
        </div>
      </div>
      {error && <p className="text-xs text-destructive mt-2 text-center">{error}</p>}
    </div>
  );
}
