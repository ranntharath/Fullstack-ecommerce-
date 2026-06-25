/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useUpdateCategoryMutation } from "../api/categoriesApi";
import { Category } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud } from "lucide-react";

interface EditCategoryModalProps {
  category: Category | null;
  open: boolean;
  onClose: () => void;
}

interface EditCategoryFormProps {
  category: Category;
  onClose: () => void;
}

function EditCategoryForm({ category, onClose }: EditCategoryFormProps) {
  const [name, setName] = useState(category.name);
  const [isActive, setIsActive] = useState(category.is_active);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [updateCategory, { isLoading }] = useUpdateCategoryMutation();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setImage(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("is_active", isActive ? "true" : "false");
      if (image) {
        formData.append("image", image);
      }

      await updateCategory({ id: category.id, data: formData }).unwrap();
      onClose();
    } catch (error) {
      console.error("Failed to update category:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="edit-name">Name</Label>
        <Input
          id="edit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Image</Label>
        <div className="relative group">
          <input
            id="edit-image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          <label
            htmlFor="edit-image"
            className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer transition-colors overflow-hidden ${previewUrl || category.image ? 'border-primary-color/50 bg-primary-color/5' : 'border-gray-300 hover:border-primary-color/50 hover:bg-gray-50 bg-gray-50/50'}`}
          >
            {previewUrl ? (
              <div className="relative w-full h-full p-2 flex items-center justify-center">
                <img src={previewUrl} alt="Preview" className="h-full object-contain rounded-md" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg m-2">
                  <span className="text-white text-sm font-medium flex items-center gap-2">
                    <UploadCloud className="w-4 h-4" /> Change Image
                  </span>
                </div>
              </div>
            ) : category.image ? (
              <div className="relative w-full h-full p-2 flex items-center justify-center">
                <img src={category.image} alt="Current" className="h-full object-contain rounded-md" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg m-2">
                  <span className="text-white text-sm font-medium flex items-center gap-2">
                    <UploadCloud className="w-4 h-4" /> Change Image
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-gray-500">
                <UploadCloud className="w-8 h-8 mb-3 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">Click to upload image</p>
                <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or GIF</p>
              </div>
            )}
          </label>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="edit-is_active"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="edit-is_active">Active</Label>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-primary-color text-white hover:bg-primary-color/90">
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

export default function EditCategoryModal({ category, open, onClose }: EditCategoryModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent 
        className="sm:max-w-[425px]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>
        {category && <EditCategoryForm key={category.id} category={category} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}
