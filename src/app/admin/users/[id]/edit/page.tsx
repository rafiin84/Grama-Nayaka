"use client";
import { useParams } from "next/navigation";
import { UserFormPage } from "@/components/UserForm";
export default function Page() { const { id } = useParams<{ id: string }>(); return <UserFormPage userId={id} />; }
