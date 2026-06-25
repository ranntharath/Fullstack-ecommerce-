/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useUpdateBannerMutation } from "../api/bannersApi";
import { Banner } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud } from "lucide-react";

interface EditBannerModalProps {
  banner: Banner | null;
  open: boolean;
  onClose: () => void;
}

interface EditBannerFormProps {
  banner: Banner;
  onClose: () => void;
}

function EditBannerForm({ banner, onClose }: EditBannerFormProps) {
  const [title, setTitle] = useState(banner.title || "");
  const [description, setDescription] = useState(banner.description || "");
  const [buttonTitle, setButtonTitle] = useState(banner.button_title || "");
  const [buttonColor, setButtonColor] = useState(banner.button_color || "");
  const [order, setOrder] = useState(banner.order || 0);
  const [isActive, setIsActive] = useState(banner.is_active);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [updateBanner, { isLoading }] = useUpdateBannerMutation();

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
      formData.append("title", title);
      formData.append("description", description);
      formData.append("button_title", buttonTitle);
      formData.append("button_color", buttonColor);
      formData.append("order", order.toString());
      formData.append("is_active", isActive ? "true" : "false");
      if (image) {
        formData.append("banner_image", image);
      }

      await updateBanner({ id: banner.id, data: formData }).unwrap();
      onClose();
    } catch (error) {
      console.error("Failed to update banner:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Banner Image</Label>
        <div className="relative group">
          <input
            id="edit_banner_image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          <label
            htmlFor="edit_banner_image"
            className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors overflow-hidden ${previewUrl || banner.banner_image ? 'border-primary-color/50 bg-primary-color/5' : 'border-gray-300 hover:border-primary-color/50 hover:bg-gray-50 bg-gray-50/50'}`}
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
            ) : banner.banner_image ? (
              <div className="relative w-full h-full p-2 flex items-center justify-center">
                <img src={banner.banner_image} alt="Current" className="h-full w-full object-cover rounded-md" />
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-title">Title</Label>
          <Input
            id="edit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Optional banner title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-order">Order</Label>
          <Input
            id="edit-order"
            type="number"
            min="0"
            value={order}
            onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-description">Description</Label>
        <textarea
          id="edit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[80px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors focus-visible:border-primary-color focus-visible:ring-3 focus-visible:ring-primary-color/30 outline-none md:text-sm"
          placeholder="Optional description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-button_title">Button Title</Label>
          <Input
            id="edit-button_title"
            value={buttonTitle}
            onChange={(e) => setButtonTitle(e.target.value)}
            placeholder="e.g. Shop Now"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-button_color">Button Color</Label>
          <div className="flex items-center gap-2">
            <Input
              id="edit-button_color"
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

export default function EditBannerModal({ banner, open, onClose }: EditBannerModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent 
        className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Edit Banner</DialogTitle>
        </DialogHeader>
        {banner && <EditBannerForm key={banner.id} banner={banner} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}
