"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateProductTagMutation } from "../api/productTagsApi";

export default function AddProductTagModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [createProductTag, { isLoading }] = useCreateProductTagMutation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await createProductTag({ name: name.trim(), is_active: isActive }).unwrap();
      setName("");
      setIsActive(true);
      setOpen(false);
    } catch (error) {
      console.error("Failed to create product tag:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary-color text-white hover:bg-primary-color/90">Add Product Tag</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Product Tag</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tag-name">Name</Label>
            <Input
              id="tag-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. New Arrival"
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="tag-is-active"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="tag-is-active">Active</Label>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading || !name.trim()} className="bg-primary-color text-white hover:bg-primary-color/90">
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
