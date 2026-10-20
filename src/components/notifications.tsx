"use client";
import Link from "next/link";
import { useState } from "react";
import { Badge, Button, Empty, PageHeader, QState, Tabs, Card } from "@/components/ui";
import { api, useAct, useMock } from "@/lib/api";
import { getDb } from "@/lib/db";
import { useT } from "@/lib/useT";

export function Notifications() {
  const { tr, loc } = useT(); const act = useAct(); const [tab, setTab] = useState("All"); const q = useMock(["notifs"], () => getDb().notifications);
  const tabs = [["All", tr("All", "ಎಲ್ಲಾ")], ["Learning", tr("Learning", "ಕಲಿಕೆ")], ["Training", tr("Training", "ತರಬೇತಿ")], ["Community", tr("Community", "ಸಮುದಾಯ")], ["Rewards", tr("Rewards", "ಪುರಸ್ಕಾರ")], ["System", tr("System", "ವ್ಯವಸ್ಥೆ")]];
  return (<div className="space-y-4"><PageHeader title={tr("Notifications", "ಅಧಿಸೂಚನೆಗಳು")} actions={<Button variant="secondary" onClick={() => act(() => api.notifications.readAll(), tr("All marked read", "ಎಲ್ಲವೂ ಓದಲಾಗಿದೆ"))}>{tr("Mark all read", "ಎಲ್ಲಾ ಓದಲಾಗಿದೆ")}</Button>} />
    <Tabs tabs={tabs.map(([id, label]) => ({ id, label }))} value={tab} onChange={setTab} />
    <QState q={q} isEmpty={(d) => d.filter((n) => tab === "All" || n.tab === tab).length === 0} empty={<Empty title={tr("Nothing here", "ಇಲ್ಲಿ ಏನೂ ಇಲ್ಲ")} />}>{(d) => <ul className="space-y-2">{d.filter((n) => tab === "All" || n.tab === tab).map((n) => <li key={n.id}><Link href={n.href} onClick={() => api.notifications.read(n.id)}><Card className={`flex items-start gap-3 ${n.read ? "" : "border-primary/50 bg-accent-soft"}`}>{!n.read && <span aria-label="unread" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}<div className="flex-1"><p className="font-medium">{loc(n.title)}</p><p className="text-sm text-muted">{loc(n.body)}</p><p className="text-xs text-muted">{n.at}</p></div><Badge>{n.tab}</Badge></Card></Link></li>)}</ul>}</QState></div>);
}
