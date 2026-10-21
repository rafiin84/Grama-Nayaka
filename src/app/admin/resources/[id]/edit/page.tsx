"use client";
import { useParams } from "next/navigation";
import { ResourceFormPage } from "@/components/ResourceForm";
export default function Page() { const { id } = useParams<{ id: string }>(); return <ResourceFormPage id={id} />; }
