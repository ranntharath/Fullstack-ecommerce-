/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useCreateBannerMutation } from "../api/bannersApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud } from "lucide-react";

export default function AddBannerModal() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [buttonTitle, setButtonTitle] = useState("");
  const [buttonColor, setButtonColor] = useState("");
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [createBanner, { isLoading }] = useCreateBannerMutation();

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
      if (title) formData.append("title", title);
      if (description) formData.append("description", description);
      if (buttonTitle) formData.append("button_title", buttonTitle);
      if (buttonColor) formData.append("button_color", buttonColor);
      formData.append("order", order.toString());
      formData.append("is_active", isActive ? "true" : "false");
      if (image) {
        formData.append("banner_image", image);
      } else {
        // Backend typically requires banner_image. You might want to handle this or let the backend return an error.
      }

      await createBanner(formData).unwrap();
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create banner:", error);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setButtonTitle("");
    setButtonColor("");
    setOrder(0);
    setIsActive(true);
    setImage(null);
    setPreviewUrl(null);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className="bg-primary-color text-white hover:bg-primary-color/90">Add Banner</Button>
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Add New Banner</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Banner Image <span className="text-red-500">*</span></Label>
            <div className="relative group">
              <input
                id="banner_image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                required
              />
              <label 
                htmlFor="banner_image" 
                className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors overflow-hidden ${previewUrl ? 'border-primary-color/50 bg-primary-color/5' : 'border-gray-300 hover:border-primary-color/50 hover:bg-gray-50 bg-gray-50/50'}`}
              >
                {previewUrl ? (
                  <div className="relative w-full h-full p-2 flex items-center justify-center">
                    <img src={previewUrl} alt="Preview" className="h-full w-full object-cover rounded-md" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg m-2">
                      <span className="text-white text-sm font-medium flex items-center gap-2">
                        <UploadCloud className="w-4 h-4" /> Change Image
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-gray-500">
                    <UploadCloud className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700">Click to upload banner image</p>
                    <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or GIF</p>
                  </div>
                )}
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Optional banner title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                type="number"
                min="0"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors focus-visible:border-primary-color focus-visible:ring-3 focus-visible:ring-primary-color/30 outline-none md:text-sm"
              placeholder="Optional description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="button_title">Button Title</Label>
              <Input
                id="button_title"
                value={buttonTitle}
                onChange={(e) => setButtonTitle(e.target.value)}
                placeholder="e.g. Shop Now"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="button_color">Button Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="button_color"
                  value={buttonColor}
                  onChange={(e) => setButtonColor(e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
                <input
                  type="color"
                  value={buttonColor || "#000000"}
                  onChange={(e) => setButtonColor(e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded-md border border-input p-1"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
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
            <Button type="submit" disabled={isLoading || !image} className="bg-primary-color text-white hover:bg-primary-color/90">
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
