import React, { useEffect, useState } from 'react';
import { Bell, Check, Mail, X } from 'lucide-react';
import { apiClient } from '../backend/api-client';

const VISITOR_NOTICE_KEY = 'royal_hints_new_item_notice';

const NewItemNotifications: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'choice' | 'email' | 'success'>('choice');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(VISITOR_NOTICE_KEY)) return;

    const timer = window.setTimeout(() => setIsOpen(true), 900);
    return () => window.clearTimeout(timer);
  }, []);

  const closeNotice = () => {
    window.localStorage.setItem(VISITOR_NOTICE_KEY, 'dismissed');
    setIsOpen(false);
  };

  const handleEmailSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    const subscribed = await apiClient.subscribeToNewItems(normalizedEmail);
    setIsSubmitting(false);

    if (!subscribed) {
      setError('We could not save your request. Please try again.');
      return;
    }

    window.localStorage.setItem(VISITOR_NOTICE_KEY, 'subscribed');
    setStep('success');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="new-items-title">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl shadow-blue-950/20">
        <div className="h-1.5 bg-[#2563EB]" />
        <button type="button" onClick={closeNotice} aria-label="Close notification signup" className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 sm:p-8">
          {step === 'success' ? (
            <div className="py-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Check className="h-7 w-7" />
              </div>
              <h2 className="mt-5 text-2xl font-black text-[#172033]">You&apos;re on the list.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">We&apos;ll send new Royal Hints listings to your inbox as they are posted.</p>
              <button type="button" onClick={closeNotice} className="mt-6 rounded-lg bg-[#2563EB] px-5 py-3 text-xs font-black uppercase tracking-[.16em] text-white transition hover:bg-[#1d4ed8]">Continue shopping</button>
            </div>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]"><Bell className="h-5 w-5" /></div>
              <p className="mt-6 text-[10px] font-black uppercase tracking-[.24em] text-[#2563EB]">Royal Hints updates</p>
              <h2 id="new-items-title" className="mt-2 text-2xl font-black tracking-tight text-[#172033]">Hear about new items first.</h2>
              {step === 'choice' ? (
                <>
                  <p className="mt-3 text-sm leading-6 text-slate-600">Would you like to receive an email when new items are posted?</p>
                  <div className="mt-7 grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setStep('email')} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-3 text-xs font-black uppercase tracking-[.14em] text-white transition hover:bg-[#1d4ed8]"><Mail className="h-4 w-4" /> Yes, notify me</button>
                    <button type="button" onClick={closeNotice} className="rounded-lg border border-slate-200 px-4 py-3 text-xs font-black uppercase tracking-[.14em] text-slate-600 transition hover:border-slate-300 hover:bg-slate-50">No, thanks</button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleEmailSubmit} className="mt-5">
                  <label htmlFor="new-item-email" className="text-xs font-bold text-slate-700">Email address</label>
                  <input id="new-item-email" autoFocus required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#2563EB]" />
                  {error && <p className="mt-2 text-xs font-bold text-red-600">{error}</p>}
                  <button type="submit" disabled={isSubmitting} className="mt-4 w-full rounded-lg bg-[#2563EB] px-4 py-3 text-xs font-black uppercase tracking-[.14em] text-white transition hover:bg-[#1d4ed8] disabled:cursor-wait disabled:opacity-60">{isSubmitting ? 'Saving...' : 'Send me new items'}</button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewItemNotifications;
