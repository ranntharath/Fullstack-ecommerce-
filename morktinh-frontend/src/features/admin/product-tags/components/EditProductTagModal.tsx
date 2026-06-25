"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateProductTagMutation } from "../api/productTagsApi";
import { ProductTag } from "../types";

interface EditProductTagModalProps {
  productTag: ProductTag;
  open: boolean;
  onClose: () => void;
}

export default function EditProductTagModal({ productTag, open, onClose }: EditProductTagModalProps) {
  const [name, setName] = useState(productTag.name);
  const [isActive, setIsActive] = useState(productTag.is_active);
  const [updateProductTag, { isLoading }] = useUpdateProductTagMutation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await updateProductTag({
        id: productTag.id,
        data: { name: name.trim(), is_active: isActive },
      }).unwrap();
      onClose();
    } catch (error) {
      console.error("Failed to update product tag:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Product Tag</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-tag-name">Name</Label>
            <Input
              id="edit-tag-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="edit-tag-is-active"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="edit-tag-is-active">Active</Label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()} className="bg-primary-color text-white hover:bg-primary-color/90">
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
