"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { SensoryFingerprint } from "@/lib/types";
import { OrganiserStepUpload } from "./organiser/OrganiserStepUpload";
import { OrganiserStepLoading } from "./organiser/OrganiserStepLoading";
import { OrganiserStepReview } from "./organiser/OrganiserStepReview";
import { OrganiserStepCreated } from "./organiser/OrganiserStepCreated";

export type OrganiserStep = "upload" | "loading" | "review" | "created";

export interface OrganiserFormData {
  showTitle: string;
  venue: string;
  eventDate: string;
  eventType: string;
  scriptFile: File | null;
  riderFile: File | null;
  listingUrl: string;
}

interface OrganiserDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function OrganiserDrawer({ open, onClose }: OrganiserDrawerProps) {
  const [step, setStep] = useState<OrganiserStep>("upload");
  const [formData, setFormData] = useState<OrganiserFormData | null>(null);
  const [fingerprint, setFingerprint] = useState<SensoryFingerprint | null>(null);
  const [showTitle, setShowTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [passportId, setPassportId] = useState<string | null>(null);
  const [passportUrl, setPassportUrl] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [uploadError, setUploadError] = useState("");

  const handleStartLoading = (data: OrganiserFormData) => {
    setFormData(data);
    setUploadError("");
    setStep("loading");
  };

  const handleInferComplete = (fp: SensoryFingerprint, title: string, v: string) => {
    setFingerprint(fp);
    setShowTitle(title);
    setVenue(v);
    setStep("review");
  };

  const handleInferError = (message: string) => {
    setUploadError(message);
    setStep("upload");
  };

  const handleCreateComplete = (id: string, url: string, qr: string) => {
    setPassportId(id);
    setPassportUrl(url);
    setQrCode(qr);
    setStep("created");
  };

  const handleClose = () => {
    setStep("upload");
    setFormData(null);
    setFingerprint(null);
    setShowTitle("");
    setVenue("");
    setPassportId(null);
    setPassportUrl("");
    setQrCode("");
    setUploadError("");
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/30 transition-opacity"
        aria-hidden
        onClick={handleClose}
      />
      <div
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-stone-200 bg-surface shadow-xl sm:max-w-xl"
        role="dialog"
        aria-label="Submit your show"
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
          <h2 className="font-playfair text-lg font-semibold text-text-primary">
            Submit Your Show
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded p-2 text-text-secondary hover:bg-stone-100 focus:outline-none focus:ring-2 focus:ring-teal"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {step === "upload" && (
            <OrganiserStepUpload
              error={uploadError}
              onStartLoading={handleStartLoading}
            />
          )}
          {step === "loading" && formData && (
            <OrganiserStepLoading
              formData={formData}
              onInferComplete={handleInferComplete}
              onError={handleInferError}
            />
          )}
          {step === "review" && fingerprint && (
            <OrganiserStepReview
              fingerprint={fingerprint}
              showTitle={showTitle}
              venue={venue}
              onBack={() => setStep("upload")}
              onCreateComplete={handleCreateComplete}
            />
          )}
          {step === "created" && passportId && (
            <OrganiserStepCreated
              passportId={passportId}
              url={passportUrl}
              qrCode={qrCode}
              onClose={handleClose}
            />
          )}
        </div>
      </div>
    </>
  );
}
