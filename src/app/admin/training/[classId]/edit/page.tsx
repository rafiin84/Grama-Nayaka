"use client";
import { useParams } from "next/navigation";
import { SessionFormPage } from "@/components/SessionFormPage";
export default function Page() { const { classId } = useParams<{ classId: string }>(); return <SessionFormPage classId={classId} />; }
