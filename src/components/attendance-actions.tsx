"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LiveClock } from "@/components/live-clock";

type Position = {
  lat: number;
  lng: number;
};

type ReverseGeoResponse = {
  display_name?: string;
};

function getMapEmbedUrl(position: Position) {
  const pad = 0.01;
  const left = position.lng - pad;
  const right = position.lng + pad;
  const top = position.lat + pad;
  const bottom = position.lat - pad;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${position.lat}%2C${position.lng}`;
}

function getCurrentPosition() {
  return new Promise<Position>((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation is not supported in this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => reject(new Error("Location access was denied.")),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  });
}

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? "Upload failed.");
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}

export function AttendanceActions({
  hasCheckedIn,
  isWFHToday,
  employeeName,
  shiftStart,
  shiftEnd,
  officePosition,
}: {
  hasCheckedIn: boolean;
  isWFHToday?: boolean;
  employeeName?: string;
  shiftStart?: string;
  shiftEnd?: string;
  officePosition?: Position;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [isResolvingLocationName, setIsResolvingLocationName] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Selfie state
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreviewUrl, setSelfiePreviewUrl] = useState<string | null>(null);
  const [isUploadingSelfie, setIsUploadingSelfie] = useState(false);

  // WFH mode toggle (only relevant before first check-in)
  const [wfhMode, setWfhMode] = useState(false);

  // Geolocation on mount
  useEffect(() => {
    let isMounted = true;

    getCurrentPosition()
      .then((position) => {
        if (!isMounted) return;
        setCurrentPosition(position);
        setLocationError(null);
      })
      .catch((caughtError) => {
        if (!isMounted) return;
        setLocationError(
          caughtError instanceof Error ? caughtError.message : "Could not fetch current location.",
        );
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // WFH heartbeat — POST every 2 minutes when checked in as WFH
  useEffect(() => {
    if (!hasCheckedIn || !isWFHToday) return;

    const INTERVAL_MS = 2 * 60 * 1000;

    async function sendHeartbeat() {
      await fetch("/api/attendance/heartbeat", { method: "POST" }).catch(() => undefined);
    }

    sendHeartbeat(); // immediate ping on mount
    const timerId = setInterval(sendHeartbeat, INTERVAL_MS);
    return () => clearInterval(timerId);
  }, [hasCheckedIn, isWFHToday]);

  const displayPosition = currentPosition ?? officePosition ?? null;
  const mapUrl = useMemo(() => {
    if (!displayPosition) return "";
    return getMapEmbedUrl(displayPosition);
  }, [displayPosition]);
  const displayLat = displayPosition?.lat;
  const displayLng = displayPosition?.lng;

  // Reverse geocoding
  useEffect(() => {
    if (displayLat == null || displayLng == null) {
      setLocationName(null);
      return;
    }

    const controller = new AbortController();
    const lat = displayLat.toFixed(6);
    const lng = displayLng.toFixed(6);

    async function resolveLocationName() {
      setIsResolvingLocationName(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          {
            signal: controller.signal,
            headers: { Accept: "application/json" },
          },
        );

        if (!response.ok) {
          setLocationName(null);
          return;
        }

        const data = (await response.json()) as ReverseGeoResponse;
        setLocationName(data.display_name?.trim() || null);
      } catch {
        if (!controller.signal.aborted) {
          setLocationName(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsResolvingLocationName(false);
        }
      }
    }

    resolveLocationName();

    return () => {
      controller.abort();
    };
  }, [displayLat, displayLng]);

  const today = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());

  const displayName = (employeeName ?? "Employee").toUpperCase();
  const displayShiftStart = shiftStart ?? "09:00";
  const displayShiftEnd = shiftEnd ?? "18:00";

  // Selfie capture handler
  const handleSelfieChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      setSelfieFile(file);
      if (selfiePreviewUrl) URL.revokeObjectURL(selfiePreviewUrl);
      setSelfiePreviewUrl(file ? URL.createObjectURL(file) : null);
    },
    [selfiePreviewUrl],
  );

  // Upload selfie and return URL, or null if no selfie selected
  async function getUploadedSelfieUrl(): Promise<string | null> {
    if (!selfieFile) return null;
    setIsUploadingSelfie(true);
    try {
      return await uploadFile(selfieFile);
    } finally {
      setIsUploadingSelfie(false);
    }
  }

  async function handleCheckIn() {
    setError(null);
    setMessage(null);

    try {
      const selfieUrl = await getUploadedSelfieUrl();

      if (wfhMode) {
        // WFH check-in — no geo required
        const response = await fetch("/api/attendance/check-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isWFH: true, ...(selfieUrl ? { selfieUrl } : {}) }),
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.error ?? "WFH check-in failed.");
          return;
        }
        setMessage("WFH check-in recorded.");
        startTransition(() => router.refresh());
        return;
      }

      // Office check-in — geo required
      const position = await getCurrentPosition();
      const response = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...position, ...(selfieUrl ? { selfieUrl } : {}) }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Attendance check-in failed.");
        return;
      }

      setMessage(`Check-in recorded with status ${data.attendance.status}.`);
      startTransition(() => router.refresh());
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Attendance check-in failed.",
      );
    }
  }

  async function handleCheckOut() {
    setError(null);
    setMessage(null);

    try {
      const selfieUrl = await getUploadedSelfieUrl();
      const response = await fetch("/api/attendance/check-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selfieUrl ? { selfieUrl } : {}),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Attendance check-out failed.");
        return;
      }

      setMessage("Check-out recorded successfully.");
      startTransition(() => router.refresh());
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Attendance check-out failed.",
      );
    }
  }

  const isLoading = isPending || isUploadingSelfie;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#dbe5ef] bg-white shadow-sm">
      <div className="border-b border-[#e2e8f0] bg-[#f8fbff] px-4 py-2 text-center text-base font-bold text-[#1e293b]">
        Daily Attendance
        {(isWFHToday || wfhMode) && (
          <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
            WFH
          </span>
        )}
      </div>

      <div className="relative h-44 w-full border-b border-[#e2e8f0] bg-[#eef2f7]">
        {mapUrl ? (
          <iframe
            title="Current location map"
            src={mapUrl}
            className="h-full w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#64748b]">
            Map unavailable
          </div>
        )}
      </div>

      <div className="space-y-4 p-4">
        {/* Greeting */}
        <div className="rounded-xl bg-[#f8fafc] px-3 py-3">
          <div className="text-center text-[13px] font-semibold text-[#111827]">
            Good Day {displayName}
          </div>
          <div className="mt-0.5 text-center text-xs text-[#64748b]">{today}</div>
        </div>

        {/* Location */}
        <div>
          <div className="text-center text-sm font-semibold text-[#1e293b]">Location</div>
          <div className="mt-1 text-center text-xs leading-relaxed text-[#475569]">
            {displayPosition
              ? isResolvingLocationName
                ? "Fetching location name..."
                : (locationName ?? "Location name unavailable")
              : "Current location not available"}
          </div>
          {displayPosition ? (
            <div className="mt-1 text-center text-[11px] text-[#64748b]">
              Lat {displayPosition.lat.toFixed(5)}, Lng {displayPosition.lng.toFixed(5)}
            </div>
          ) : null}
          {locationError ? (
            <div className="mt-1 text-center text-[11px] text-[#b45309]">{locationError}</div>
          ) : null}
        </div>

        {/* Shift times */}
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-[#e2e8f0] p-3">
          <div>
            <div className="text-xs text-[#64748b]">Shift In Time</div>
            <div className="mt-0.5 text-sm font-semibold text-[#111827]">{displayShiftStart}</div>
          </div>
          <div>
            <div className="text-xs text-[#64748b]">Shift Out Time</div>
            <div className="mt-0.5 text-sm font-semibold text-[#111827]">{displayShiftEnd}</div>
          </div>
        </div>

        {/* WFH toggle — only shown before first check-in */}
        {!hasCheckedIn && (
          <div className="flex items-center justify-between rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2.5">
            <div>
              <div className="text-sm font-medium text-[#1e293b]">Work From Home</div>
              <div className="text-xs text-[#64748b]">Skip location check, mark as WFH</div>
            </div>
            <button
              type="button"
              onClick={() => setWfhMode((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                wfhMode ? "bg-blue-500" : "bg-[#cbd5e1]"
              }`}
              aria-pressed={wfhMode}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                  wfhMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        )}

        {/* Selfie capture */}
        <div className="rounded-xl border border-[#e2e8f0] p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-medium text-[#1e293b]">Selfie Proof</div>
              <div className="text-xs text-[#64748b]">Optional — photo for attendance proof</div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs font-medium text-[#374151] transition hover:bg-[#f8fafc]"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              {selfieFile ? "Retake" : "Camera"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={handleSelfieChange}
            />
          </div>
          {selfiePreviewUrl && (
            <div className="mt-3 flex flex-col items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selfiePreviewUrl}
                alt="Selfie preview"
                className="h-28 w-28 rounded-xl object-cover shadow-sm"
              />
              <button
                type="button"
                onClick={() => {
                  setSelfieFile(null);
                  if (selfiePreviewUrl) URL.revokeObjectURL(selfiePreviewUrl);
                  setSelfiePreviewUrl(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-xs text-[#ef4444] hover:underline"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Punch In / Out buttons */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCheckIn}
            disabled={isLoading || hasCheckedIn}
            className="flex-1 rounded-lg bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d9488] disabled:opacity-50"
          >
            {isUploadingSelfie ? "Uploading..." : "Punch In"}
          </button>
          <button
            type="button"
            onClick={handleCheckOut}
            disabled={isLoading || !hasCheckedIn}
            className="flex-1 rounded-lg border border-[#e2e8f0] bg-white px-4 py-2.5 text-sm font-semibold text-[#374151] transition hover:bg-[#f8fafc] disabled:opacity-50"
          >
            {isUploadingSelfie ? "Uploading..." : "Punch Out"}
          </button>
        </div>

        <div className="flex justify-center">
          <LiveClock variant="header" />
        </div>
      </div>

      {message ? <p className="px-4 pb-4 text-sm text-[#0f766e]">{message}</p> : null}
      {error ? <p className="px-4 pb-4 text-sm text-[#ef4444]">{error}</p> : null}
    </div>
  );
}
