"use client";

import { useState } from "react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="border border-gold-500/40 p-8 text-center">
        <p className="font-serif text-xl text-charcoal-900">Thank you</p>
        <p className="mt-3 text-sm text-charcoal-700">
          Your message has been noted. This is a design preview, so no email
          was actually sent — a live contact form will be connected before
          launch.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <label className="block">
          <span className="text-[11px] tracking-widest-plus text-charcoal-700/70">
            FULL NAME
          </span>
          <input
            required
            type="text"
            className="mt-2 w-full border-b border-charcoal-900/20 py-2 text-sm bg-transparent focus:outline-none focus:border-gold-500"
          />
        </label>
        <label className="block">
          <span className="text-[11px] tracking-widest-plus text-charcoal-700/70">
            EMAIL
          </span>
          <input
            required
            type="email"
            className="mt-2 w-full border-b border-charcoal-900/20 py-2 text-sm bg-transparent focus:outline-none focus:border-gold-500"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-[11px] tracking-widest-plus text-charcoal-700/70">
          SUBJECT
        </span>
        <input
          type="text"
          className="mt-2 w-full border-b border-charcoal-900/20 py-2 text-sm bg-transparent focus:outline-none focus:border-gold-500"
        />
      </label>
      <label className="block">
        <span className="text-[11px] tracking-widest-plus text-charcoal-700/70">
          MESSAGE
        </span>
        <textarea
          required
          rows={5}
          className="mt-2 w-full border-b border-charcoal-900/20 py-2 text-sm bg-transparent focus:outline-none focus:border-gold-500 resize-none"
        />
      </label>
      <button
        type="submit"
        className="bg-charcoal-900 hover:bg-charcoal-800 text-ivory-50 text-xs tracking-widest-plus px-8 py-3.5 transition-colors"
      >
        SEND MESSAGE
      </button>
    </form>
  );
}
