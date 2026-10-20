"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { EventForm } from "@/components/events";
function Inner() { const sp = useSearchParams(); return <EventForm editId={sp.get("edit") ?? undefined} />; }
export default function Page() { return <Suspense><Inner /></Suspense>; }
