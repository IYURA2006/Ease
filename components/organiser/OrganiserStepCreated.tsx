"use client";

interface OrganiserStepCreatedProps {
  passportId: string;
  url: string;
  qrCode: string;
  onClose: () => void;
}

export function OrganiserStepCreated({
  url,
  qrCode,
  onClose,
}: OrganiserStepCreatedProps) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <p className="font-playfair text-lg text-text-primary">
        Your show is now listed on Threshold.
      </p>

      <div className="rounded-lg border border-stone-200 bg-stone-50/50 p-4">
        <p className="mb-2 text-sm font-medium text-text-primary">Passport URL</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-sm text-teal underline"
        >
          {url}
        </a>
      </div>

      <div className="flex justify-center">
        <img src={qrCode} alt="Passport QR code" width={200} height={200} />
      </div>

      <div className="flex flex-col gap-2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded bg-teal px-4 py-2 text-center text-sm font-medium text-white hover:bg-teal/90"
        >
          View your passport
        </a>
        <button
          type="button"
          onClick={onClose}
          className="rounded border border-stone-300 px-4 py-2 text-sm font-medium text-text-primary hover:bg-stone-100"
        >
          Close
        </button>
      </div>
    </div>
  );
}
