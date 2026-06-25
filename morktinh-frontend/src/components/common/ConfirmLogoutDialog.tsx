"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function ConfirmLogoutDialog({ open, onOpenChange, onConfirm }: { open: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => void }) {
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-sm">
      <DialogHeader>
        <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-red-50 text-red-600"><LogOut className="size-5" /></div>
        <DialogTitle>Log out?</DialogTitle>
        <DialogDescription>You will need to sign in again to access your account.</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button type="button" variant="destructive" onClick={onConfirm}>Log out</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}
