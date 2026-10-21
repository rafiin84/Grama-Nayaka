"use client";
import { useEffect, useState } from "react";
import { getBlob } from "./blobStore";
import type { MediaRef } from "./types";

/** Resolves a media reference to a URL: a public path as-is, or an object URL for a file stored in this browser. */
export function useMediaUrl(m?: MediaRef): { url: string | null; missing: boolean } {
  const [state, setState] = useState<{ url: string | null; missing: boolean }>({ url: m?.path ?? null, missing: false });
  useEffect(() => {
    let revoked = false; let obj: string | null = null;
    if (!m) { setState({ url: null, missing: false }); return; }
    if (m.path) { setState({ url: m.path, missing: false }); return; }
    if (!m.blobId) { setState({ url: null, missing: true }); return; }
    getBlob(m.blobId).then((b) => { if (revoked) return; if (!b) return setState({ url: null, missing: true }); obj = URL.createObjectURL(b); setState({ url: obj, missing: false }); }).catch(() => !revoked && setState({ url: null, missing: true }));
    return () => { revoked = true; if (obj) URL.revokeObjectURL(obj); };
  }, [m?.path, m?.blobId]); // eslint-disable-line react-hooks/exhaustive-deps
  return state;
}
