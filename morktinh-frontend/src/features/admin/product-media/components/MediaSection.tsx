/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud, ImageIcon, Trash2 } from 'lucide-react';

import { MediaFile } from '../hooks/useProductMedia';

interface MediaSectionProps {
  mediaFiles: MediaFile[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeMedia: (index: number) => void;
}

export default function MediaSection({
  mediaFiles,
  fileInputRef,
  handleFileChange,
  removeMedia
}: MediaSectionProps) {
  return (
    <div className="bg-white p-6 rounded-md shadow-sm border">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Product Media</h2>
          <p className="text-sm text-slate-500">Upload images. First image is the thumbnail.</p>
        </div>
        <div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple />
          <Button type="button" onClick={() => fileInputRef.current?.click()} variant="outline">
            <UploadCloud className="w-4 h-4 mr-2" /> Select Images
          </Button>
        </div>
      </div>
      {mediaFiles.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-12 text-center text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No images selected yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {mediaFiles.map((media, index) => (
            <div key={index} className="relative group border rounded-md overflow-hidden aspect-square">
              <img src={media.preview} alt="preview" className="w-full h-full object-cover" />
              {index === 0 && <div className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full">Thumbnail</div>}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button type="button" variant="destructive" size="icon" onClick={() => removeMedia(index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
