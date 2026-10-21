"use client";
import { useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";
import { Button, DemoNote, Modal } from "@/components/ui";
import { useT } from "@/lib/useT";

/** Shows a one-time activation code. It cannot be shown again: the app keeps only its hash. */
export function ActivationCodeDialog({ open, code, name, userId, onClose }: { open: boolean; code: string; name: string; userId: string; onClose: () => void }) {
  const { tr } = useT(); const [copied, setCopied] = useState(false);
  return (
    <Modal open={open} onClose={onClose} title={tr("Account created", "ಖಾತೆ ರಚಿಸಲಾಗಿದೆ")} footer={<Button onClick={onClose}>{tr("I have noted it — continue", "ನೋಟ್ ಮಾಡಿದ್ದೇನೆ — ಮುಂದುವರಿಸಿ")}</Button>}>
      <p className="text-sm">{tr(`${name} now has user ID`, `${name} ಅವರ ಬಳಕೆದಾರ ಐಡಿ`)} <b className="font-mono">{userId}</b>.</p>
      <div className="rounded-2xl border border-primary/30 bg-accent-soft p-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">{tr("One-time activation code (7 days)", "ಒಂದು ಬಾರಿಯ ಸಕ್ರಿಯಗೊಳಿಸುವ ಕೋಡ್ (7 ದಿನ)")}</p>
        <p className="mt-1 select-all font-mono text-3xl font-bold tracking-widest text-primary" data-testid="activation-code">{code}</p>
        <Button size="sm" variant="secondary" className="mt-3" onClick={async () => { await navigator.clipboard?.writeText(code).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? <Check /> : <Copy />}{copied ? tr("Copied", "ನಕಲಿಸಲಾಗಿದೆ") : tr("Copy code", "ಕೋಡ್ ನಕಲಿಸಿ")}</Button>
      </div>
      <p className="text-sm text-muted">{tr("Share it with the person securely. They use it to set their own password. It will not be shown again; you can issue a new one from their profile.", "ಇದನ್ನು ವ್ಯಕ್ತಿಗೆ ಸುರಕ್ಷಿತವಾಗಿ ತಿಳಿಸಿ. ಅವರು ತಮ್ಮದೇ ಪಾಸ್‌ವರ್ಡ್ ಹೊಂದಿಸಲು ಇದನ್ನು ಬಳಸುತ್ತಾರೆ. ಇದು ಮತ್ತೆ ತೋರಿಸುವುದಿಲ್ಲ; ಅವರ ಪ್ರೊಫೈಲ್‌ನಿಂದ ಹೊಸದನ್ನು ನೀಡಬಹುದು.")}</p>
      <DemoNote>{tr("No password exists in this prototype. Only a hash of this code is stored, never the code or a password. A real deployment sends an activation link through its secure authentication system.", "ಈ ಮಾದರಿಯಲ್ಲಿ ಪಾಸ್‌ವರ್ಡ್ ಇಲ್ಲ. ಈ ಕೋಡ್‌ನ ಹ್ಯಾಶ್ ಮಾತ್ರ ಸಂಗ್ರಹವಾಗುತ್ತದೆ; ಕೋಡ್ ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್ ಅಲ್ಲ. ನಿಜವಾದ ಬಳಕೆಯಲ್ಲಿ ಸುರಕ್ಷಿತ ದೃಢೀಕರಣ ವ್ಯವಸ್ಥೆ ಸಕ್ರಿಯಗೊಳಿಸುವ ಲಿಂಕ್ ಕಳುಹಿಸುತ್ತದೆ.")}</DemoNote>
    </Modal>
  );
}
