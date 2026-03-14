"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface QRScannerProps {
  onClose: () => void;
  onScan?: () => void;
}

export function QRScanner({ onClose, onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setLoading(false);
      } catch {
        setError("Camera access is needed to scan QR codes.");
        setLoading(false);
      }
    }

    startCamera();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (loading || error || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const ctx2d = ctx;

    let id: number;
    let jsQRModule: typeof import("jsqr") | null = null;

    import("jsqr").then((m) => {
      jsQRModule = m;
    });

    function tick() {
      if (jsQRModule && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx2d.drawImage(video, 0, 0);
        const imageData = ctx2d.getImageData(0, 0, canvas.width, canvas.height);
        const result = jsQRModule.default(imageData.data, canvas.width, canvas.height);
        if (result?.data) {
          const url = result.data;
          if (url.includes("/passport/")) {
            const passportId = url.split("/passport/")[1]?.split("?")[0]?.split("/")[0];
            if (passportId) {
              onScan?.();
              router.push(`/passport/${passportId}`);
              return;
            }
          }
        }
      }
      id = requestAnimationFrame(tick);
    }
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [loading, error, router, onScan]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-captions-bg">
      <div className="flex items-center justify-between p-4">
        <h2 className="font-playfair text-lg font-semibold text-white">
          Scan passport QR code
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-2 text-white hover:bg-white/10"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="relative flex-1">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          muted
          playsInline
        />
        <canvas ref={canvasRef} className="hidden" />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <p className="text-white">Starting camera...</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-4">
            <p className="text-center text-white">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
