"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  whatsappE164: string;
};

export function ContactForm({ whatsappE164 }: Props) {
  const t = useTranslations("contact");
  const [pending, setPending] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const message = String(form.get("message") || "").trim();

    if (!name || !phone || !message) {
      toast.error(t("required"));
      return;
    }

    setPending(true);
    const text = encodeURIComponent(
      `Bonjour Soukly,\n\nNom: ${name}\nTél: ${phone}\n\n${message}`,
    );
    const digits = whatsappE164.replace(/\D/g, "");
    window.open(`https://wa.me/${digits}?text=${text}`, "_blank", "noopener,noreferrer");
    toast.success(t("sent"));
    e.currentTarget.reset();
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">{t("name")}</Label>
          <Input id="name" name="name" required placeholder={t("namePlaceholder")} autoComplete="name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">{t("phone")}</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            placeholder="+212 6XX XXX XXX"
            autoComplete="tel"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">{t("message")}</Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder={t("messagePlaceholder")}
        />
      </div>
      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        <Send className="me-2 h-4 w-4" />
        {pending ? t("sending") : t("submit")}
      </Button>
      <p className="text-xs text-muted-foreground">{t("hint")}</p>
    </form>
  );
}
