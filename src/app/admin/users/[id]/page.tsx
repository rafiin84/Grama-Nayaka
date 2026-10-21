"use client";
import { useParams } from "next/navigation";
import { UserProfile } from "@/components/UserProfile";
export default function Page() { const { id } = useParams<{ id: string }>(); return <UserProfile id={id} />; }
