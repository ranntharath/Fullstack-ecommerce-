import { useState, useRef, useCallback } from 'react';
import { ProductMedia as ApiProductMedia } from '../types';

export interface MediaFile {
  file?: File;
  preview: string;
  id?: number;
  isExisting?: boolean;
}

export function useProductMedia() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [deletedMediaIds, setDeletedMediaIds] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setInitialMedia = useCallback((initialMedias: ApiProductMedia[]) => {
    const files: MediaFile[] = initialMedias.map(m => ({
      preview: m.image,
      id: m.id,
      isExisting: true
    }));
    setMediaFiles(files);
    setDeletedMediaIds([]);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        isExisting: false
      }));
      setMediaFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => {
      const newFiles = [...prev];
      const mediaToRemove = newFiles[index];
      
      if (mediaToRemove.isExisting && mediaToRemove.id) {
        setDeletedMediaIds(del => [...del, mediaToRemove.id!]);
      } else if (mediaToRemove.preview && !mediaToRemove.isExisting) {
        URL.revokeObjectURL(mediaToRemove.preview);
      }
      
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  return {
    mediaFiles,
    deletedMediaIds,
    fileInputRef,
    handleFileChange,
    removeMedia,
    setInitialMedia
  };
}
