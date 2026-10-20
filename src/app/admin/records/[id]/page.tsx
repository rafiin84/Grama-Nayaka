"use client";
import { useParams } from "next/navigation";
import { ResidentProfile } from "@/components/records";
export default function Page() { const { id } = useParams<{ id: string }>(); return <ResidentProfile id={id} admin />; }
