/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useCreateBrandMutation } from "../api/brandsApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud } from "lucide-react";

export default function AddBrandModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [createBrand, { isLoading }] = useCreateBrandMutation();

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

      await createBrand(formData).unwrap();
      setOpen(false);
      setName("");
      setIsActive(true);
      setImage(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Failed to create brand:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary-color text-white hover:bg-primary-color/90">Add Brand</Button>
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-[425px]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Add New Brand</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Image</Label>
            <div className="relative group">
              <input
                id="image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <label 
                htmlFor="image" 
                className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer transition-colors overflow-hidden ${previewUrl ? 'border-primary-color/50 bg-primary-color/5' : 'border-gray-300 hover:border-primary-color/50 hover:bg-gray-50 bg-gray-50/50'}`}
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
              id="is_active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading} className="bg-primary-color text-white hover:bg-primary-color/90">
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
