"use client";
import { useParams } from "next/navigation";
import { EventDetail } from "@/components/events";
export default function Page() { const { id } = useParams<{ id: string }>(); return <EventDetail id={id} />; }
