"use client";
import { useParams } from "next/navigation";
import { GrievanceDetail } from "@/components/grievance";
export default function Page() { const { id } = useParams<{ id: string }>(); return <GrievanceDetail id={id} admin />; }
