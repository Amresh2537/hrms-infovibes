"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
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

export function AttendanceActions({
  hasCheckedIn,
  employeeName,
  shiftStart,
  shiftEnd,
  officePosition,
}: {
  hasCheckedIn: boolean;
  employeeName?: string;
  shiftStart?: string;
  shiftEnd?: string;
  officePosition?: Position;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [isResolvingLocationName, setIsResolvingLocationName] = useState(false);
  const [isPending, startTransition] = useTransition();

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
        setLocationError(caughtError instanceof Error ? caughtError.message : "Could not fetch current location.");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const displayPosition = currentPosition ?? officePosition ?? null;
  const mapUrl = useMemo(() => {
    if (!displayPosition) return "";
    return getMapEmbedUrl(displayPosition);
  }, [displayPosition]);
  const displayLat = displayPosition?.lat;
  const displayLng = displayPosition?.lng;

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
            headers: {
              Accept: "application/json",
            },
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

  async function handleCheckIn() {
    setError(null);
    setMessage(null);

    try {
      const position = await getCurrentPosition();
      const response = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(position),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Attendance check-in failed.");
        return;
      }

      setMessage(`Check-in recorded with status ${data.attendance.status}.`);
      startTransition(() => router.refresh());
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Attendance check-in failed.");
    }
  }

  async function handleCheckOut() {
    setError(null);
    setMessage(null);

    const response = await fetch("/api/attendance/check-out", {
      method: "POST",
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Attendance check-out failed.");
      return;
    }

    setMessage("Check-out recorded successfully.");
    startTransition(() => router.refresh());
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#dbe5ef] bg-white shadow-sm">
      <div className="border-b border-[#e2e8f0] bg-[#f8fbff] px-4 py-2 text-center text-base font-bold text-[#1e293b]">
        Daily Attendance
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
        <div className="rounded-xl bg-[#f8fafc] px-3 py-3">
          <div className="text-center text-[13px] font-semibold text-[#111827]">
            Good Day {displayName}
          </div>
          <div className="mt-0.5 text-center text-xs text-[#64748b]">{today}</div>
        </div>

        <div>
          <div className="text-center text-sm font-semibold text-[#1e293b]">Location</div>
          <div className="mt-1 text-center text-xs leading-relaxed text-[#475569]">
            {displayPosition
              ? (isResolvingLocationName ? "Fetching location name..." : (locationName ?? "Location name unavailable"))
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

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCheckIn}
            disabled={isPending || hasCheckedIn}
            className="flex-1 rounded-lg bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d9488] disabled:opacity-50"
          >
            Punch In
          </button>
          <button
            type="button"
            onClick={handleCheckOut}
            disabled={isPending || !hasCheckedIn}
            className="flex-1 rounded-lg border border-[#e2e8f0] bg-white px-4 py-2.5 text-sm font-semibold text-[#374151] transition hover:bg-[#f8fafc] disabled:opacity-50"
          >
            Punch Out
          </button>
        </div>

        <div className="flex justify-center">
          <LiveClock variant="header" />
        </div>
      </div>
      {message ? <p className="mt-3 text-sm text-[#0f766e]">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-[#ef4444]">{error}</p> : null}
    </div>
  );
}