import React, { useState } from 'react';
import { Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';

interface ContactPageProps { onNavigate: (page: any) => void; }

const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const [sent, setSent] = useState(false);
  const contactCards = [
    [Phone, 'Call us', '+265 999 323 805', 'tel:+2650999323805'],
    [MessageCircle, 'WhatsApp', 'Chat with our team', 'https://wa.me/265999323805'],
    [Mail, 'Email', 'ruthmhone8@gmail.com', 'mailto:ruthmhone8@gmail.com'],
    [MapPin, 'Visit', 'Lilongwe, Malawi', '#']
  ] as const;

  return <div className="bg-white px-6 py-16 text-[#172033] sm:px-10 lg:px-24">
    <div className="mx-auto max-w-7xl">
      <div className="max-w-2xl">
        <p className="text-xs font-black uppercase tracking-[.28em] text-[#2563EB]">Customer care</p>
        <h1 className="mt-4 text-5xl font-black tracking-[-.04em] sm:text-6xl">Let&apos;s get your question answered.</h1>
        <p className="mt-6 text-base leading-8 text-slate-600">Need help choosing an item, checking an order, or requesting something specific? Reach the Royal Hints team directly.</p>
      </div>

      <div className="mt-12 grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {contactCards.map(([Icon, title, value, href], index) => <a key={title} href={href} style={{ animationDelay: `${180 + index * 110}ms` }} className="group relative min-h-[170px] rounded-2xl border border-blue-100 bg-[#f8fafc] p-5 opacity-0 shadow-sm transition duration-500 animate-[contact-card-in_.65s_ease-out_forwards] hover:-translate-y-2 hover:border-[#2563EB] hover:bg-white hover:shadow-xl hover:shadow-blue-100/60">
          <span className="absolute right-5 top-5 font-mono text-[10px] font-bold text-[#2563EB]/50">0{index + 1}</span>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#2563EB] shadow-sm transition duration-500 group-hover:rotate-6 group-hover:bg-[#2563EB] group-hover:text-white"><Icon className="h-5 w-5" /></span>
          <h2 className="mt-7 text-base font-black">{title}</h2>
          <p className="mt-2 text-sm text-slate-500">{value}</p>
          <span className="absolute bottom-5 left-5 h-px w-8 bg-[#2563EB]/40 transition-all group-hover:w-14" />
        </a>)}
      </div>
      <style>{`@keyframes contact-card-in { from { opacity: 0; transform: translateY(22px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } } @media (prefers-reduced-motion: reduce) { .animate-\\[contact-card-in_\\.65s_ease-out_forwards\\] { animation: none; opacity: 1; } }`}</style>

      <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_.8fr]">
        <form onSubmit={(event) => { event.preventDefault(); setSent(true); }} className="border border-slate-200 p-6 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[.24em] text-[#2563EB]">Send a message</p>
          <h2 className="mt-3 text-3xl font-black">We&apos;ll follow up soon.</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <input required placeholder="Full name" className="rounded-lg border border-slate-200 px-4 py-4 text-sm outline-none focus:border-[#2563EB]" />
            <input required type="email" placeholder="Email address" className="rounded-lg border border-slate-200 px-4 py-4 text-sm outline-none focus:border-[#2563EB]" />
            <input placeholder="Phone number" className="rounded-lg border border-slate-200 px-4 py-4 text-sm outline-none focus:border-[#2563EB] sm:col-span-2" />
            <input required placeholder="Subject" className="rounded-lg border border-slate-200 px-4 py-4 text-sm outline-none focus:border-[#2563EB] sm:col-span-2" />
            <textarea required maxLength={500} placeholder="How can we help?" rows={6} className="resize-none rounded-lg border border-slate-200 px-4 py-4 text-sm outline-none focus:border-[#2563EB] sm:col-span-2" />
          </div>
          <button className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-6 py-4 text-xs font-black uppercase tracking-[.18em] text-white hover:bg-[#1d4ed8]"><Send className="h-4 w-4" /> Send message</button>
          {sent && <p className="mt-4 text-sm font-bold text-emerald-600">Message received. Our team will be in touch.</p>}
        </form>

        <div className="bg-[#eff6ff] p-7 sm:p-9">
          <p className="text-xs font-black uppercase tracking-[.24em] text-[#2563EB]">Important information</p>
          <h2 className="mt-3 text-3xl font-black">Before you write.</h2>
          <div className="mt-8 divide-y divide-blue-200">
            {[
              ['Delivery times', 'Standard delivery takes between 2 to 5 business days. Express orders take a day or 2 within major cities, and up to 3 days in remote areas.'],
              ['Finding unlisted items', 'We find items that are not listed on customer demand when the details are well presented.'],
              ['Payment methods', 'Mobile money, Airtel Money, PayChangu, and bank transfer.'],
              ['Tracking system', 'Every item comes with a sticker that can be used to track the geolocation of the item being transferred.']
            ].map(([title, information]) => <details key={title} className="py-5"><summary className="cursor-pointer text-sm font-black">{title}</summary><p className="mt-3 text-sm leading-6 text-slate-600">{information}</p></details>)}
          </div>
          <button onClick={() => onNavigate('OrderTracking')} className="mt-8 text-sm font-black text-[#2563EB] underline underline-offset-4">Track an existing order</button>
        </div>
      </div>
    </div>
  </div>;
};

export default ContactPage;
