"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

type ResponsiveModalProps = {
  children: React.ReactNode;
  title: string;
  description?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  className?: string;
  trigger: React.ReactNode;
};

export function ResponsiveModal({
  children,
  title,
  description,
  open,
  setOpen,
  className,
  trigger,
}: ResponsiveModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Drawer open={open} onOpenChange={setOpen} direction="right">
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className={className}>
          <DrawerHeader className={cn("text-left", className)}>
            <DrawerTitle>{title}</DrawerTitle>
            {description && (
              <DrawerDescription>{description}</DrawerDescription>
            )}
          </DrawerHeader>
          {children}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="bottom">
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className={className}>
        <DrawerHeader className={cn("text-left", className)}>
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        {children}
      </DrawerContent>
    </Drawer>
  );
}
