
import { useState } from 'react';
import { uploadImageToSupabase } from '@/lib/uploadImageToSupabase';
import { X, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = 'Image',
  required = false,
  className = '',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleRemove = () => {
    onChange('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      setUploadError(null);
      try {
        // Upload to Supabase Storage bucket 'images'
        const url = await uploadImageToSupabase(file, 'images');
        console.log('ImageUpload onChange url:', url);
        onChange(url);
      } catch (err: any) {
        setUploadError('Failed to upload image: ' + (err?.message || JSON.stringify(err)));
      } finally {
        setUploading(false);
      }
      e.target.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </label>

      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Preview"
            className="h-24 w-24 rounded-xl object-cover border border-border"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <label className="h-24 w-full max-w-[200px] flex flex-col gap-1 rounded-xl border-dashed border-2 border-orange-300 items-center justify-center cursor-pointer text-muted-foreground">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <Link className="h-6 w-6" />
          <span className="text-xs">{uploading ? 'Uploading...' : 'Upload Picture'}</span>
          {uploadError && <span className="text-xs text-destructive">{uploadError}</span>}
        </label>
      )}
    </div>
  );
}
