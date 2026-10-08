"use client";

import "sonner/dist/styles.css";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

function ToastIconWrap({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: "success" | "error" | "warning" | "info" | "loading";
}) {
  return (
    <span className={`app-toast-icon app-toast-icon--${variant}`}>
      {children}
    </span>
  );
}

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="app-toaster"
      offset={16}
      gap={8}
      visibleToasts={3}
      expand
      icons={{
        success: (
          <ToastIconWrap variant="success">
            <CircleCheckIcon className="size-4" strokeWidth={2.5} />
          </ToastIconWrap>
        ),
        info: (
          <ToastIconWrap variant="info">
            <InfoIcon className="size-4" strokeWidth={2.5} />
          </ToastIconWrap>
        ),
        warning: (
          <ToastIconWrap variant="warning">
            <TriangleAlertIcon className="size-4" strokeWidth={2.5} />
          </ToastIconWrap>
        ),
        error: (
          <ToastIconWrap variant="error">
            <OctagonXIcon className="size-4" strokeWidth={2.5} />
          </ToastIconWrap>
        ),
        loading: (
          <ToastIconWrap variant="loading">
            <Loader2Icon className="size-4 animate-spin" strokeWidth={2.5} />
          </ToastIconWrap>
        ),
      }}
      toastOptions={{
        classNames: {
          toast: "app-toast",
          title: "app-toast-title",
          description: "app-toast-description",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
