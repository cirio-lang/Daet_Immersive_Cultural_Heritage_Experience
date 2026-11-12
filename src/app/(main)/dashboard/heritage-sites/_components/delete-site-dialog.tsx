"use client";

import { AlertTriangle, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { HeritageSite } from "@/types/heritage";

interface DeleteSiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site: HeritageSite | null;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteSiteDialog({ open, onOpenChange, site, onConfirm, isDeleting }: DeleteSiteDialogProps) {
  if (!site) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-destructive/30 sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" />
            <AlertDialogTitle>Delete Heritage Site</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs leading-relaxed">
            Are you sure you want to permanently delete{" "}
            <strong className="text-foreground font-semibold">{site.title}</strong>? This will remove the site listing,
            its associated metadata, and public link
            <span className="font-mono text-xs"> /sites/{site.slug}</span>. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isDeleting}
            onClick={(e) => {
              e.preventDefault();
              void onConfirm();
            }}
            className="gap-1.5"
          >
            <Trash2 className="size-3.5" />
            <span>{isDeleting ? "Deleting..." : "Confirm Delete"}</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
