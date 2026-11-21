'use client';

import { Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';

/**
 * The site is fully static, so the form hands the message to the visitor's mail app.
 * To receive messages directly, point `onSubmit` at a form service or a Worker endpoint.
 */
export function ContactForm({
  email,
  labels,
}: {
  email: string;
  labels: { name: string; email: string; message: string; send: string; privacy: string };
}) {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get('name') ?? '');
    const from = String(data.get('email') ?? '');
    const message = String(data.get('message') ?? '');
    const subject = encodeURIComponent(`Hello from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} <${from}>`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <form className="relative space-y-5" onSubmit={onSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm text-foreground/70">
            {labels.name}
          </label>
          <input id="name" name="name" required autoComplete="name" className="input-dark w-full rounded-lg px-4 py-3 text-sm sm:text-base" />
        </div>
        <div>
          <label htmlFor="email" className="mb-2 block text-sm text-foreground/70">
            {labels.email}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="input-dark w-full rounded-lg px-4 py-3 text-sm sm:text-base"
          />
        </div>
      </div>
      <div>
        <label htmlFor="message" className="mb-2 block text-sm text-foreground/70">
          {labels.message}
        </label>
        <textarea id="message" name="message" required rows={6} className="input-dark w-full resize-none rounded-lg px-4 py-3 text-sm sm:text-base" />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-on-primary transition duration-200 hover:bg-primary-hover active:scale-[0.98] sm:text-base"
        >
          <span>{labels.send}</span>
          <Send size={16} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </button>
        {sent && <p className="text-sm text-[#56d298]">✓</p>}
      </div>
      <p className="text-xs leading-relaxed text-faint">{labels.privacy}</p>
    </form>
  );
}
