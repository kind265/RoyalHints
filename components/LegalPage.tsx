import React from 'react';
import { ArrowLeft, FileText, ShieldCheck } from 'lucide-react';

interface LegalPageProps {
  type: 'terms' | 'privacy';
  onNavigate: (page: any) => void;
}

const LegalPage: React.FC<LegalPageProps> = ({ type, onNavigate }) => {
  const isTerms = type === 'terms';
  return (
    <main className="min-h-[70vh] bg-[#eff6ff] px-6 py-16 sm:px-10 sm:py-24 lg:px-24">
      <div className="mx-auto max-w-4xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-lg shadow-blue-200">
          {isTerms ? <FileText className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
        </div>
        <p className="mt-8 text-xs font-black uppercase tracking-[.28em] text-[#2563EB]">Royal Hints legal information</p>
        <h1 className="mt-4 text-5xl font-black tracking-[-.04em] text-[#172033] sm:text-6xl">{isTerms ? 'Terms and Conditions' : 'Privacy Policy'}</h1>
        <p className="mt-5 text-sm text-slate-500">Last updated: September 10, 2026</p>

        <article className="mt-10 space-y-10 bg-white p-6 shadow-xl shadow-blue-900/5 sm:p-10">
          {isTerms ? (
            <>
              <section><h2 className="text-2xl font-black text-[#172033]">Use of the Royal Hints name and products</h2><p className="mt-3 text-sm leading-8 text-slate-600">It is prohibited to impersonate Royal Hints when purchasing, repurposing, reselling, or reusing products on the market without written permission. Anyone infringing the copyright or other intellectual property rights associated with Royal Hints will be contacted and asked to stop. If no civil response follows, legal action may be taken.</p></section>
              <section><h2 className="text-2xl font-black text-[#172033]">Orders and preorders</h2><p className="mt-3 text-sm leading-8 text-slate-600">Once payment is completed, products are processed for fulfilment. Preorders may not be cancelled after payment has been made, subject to any rights that cannot lawfully be excluded under applicable Malawi law.</p></section>
              <section><h2 className="text-2xl font-black text-[#172033]">Lost or delayed items</h2><p className="mt-3 text-sm leading-8 text-slate-600">Royal Hints cannot guarantee a specific delivery date. If you believe an item has been lost or delayed in transit, please contact our team through the Contact page. We are always happy to help investigate the delivery status.</p><button onClick={() => onNavigate('Contact')} className="mt-4 text-sm font-black text-[#2563EB] underline underline-offset-4">Contact Royal Hints support</button></section>
              <section><h2 className="text-2xl font-black text-[#172033]">Changes to these terms</h2><p className="mt-3 text-sm leading-8 text-slate-600">These Terms and Conditions may be updated from time to time. Updates will be published on this page and will reflect applicable Malawi requirements.</p></section>
            </>
          ) : (
            <>
              <section><h2 className="text-2xl font-black text-[#172033]">Information we collect</h2><p className="mt-3 text-sm leading-8 text-slate-600">When you visit and browse the site, we collect information about the products you view and your interactions with the site. When you attempt to purchase or purchase a product, we may collect information including your name, account details, delivery address, and payment-related information such as your phone number and card details, depending on the payment option you choose.</p></section>
              <section><h2 className="text-2xl font-black text-[#172033]">How we use your information</h2><p className="mt-3 text-sm leading-8 text-slate-600">We use this information to communicate with you, process orders, track orders, prevent potential risk and fraud, and improve our site and product listings.</p></section>
              <section><h2 className="text-2xl font-black text-[#172033]">When information may be shared</h2><p className="mt-3 text-sm leading-8 text-slate-600">We may share personal information when legally required to comply with laws and regulations, including when responding to a search warrant, subpoena, or other lawful request, and when necessary to protect our rights and the rights of our customers.</p></section>
              <section><h2 className="text-2xl font-black text-[#172033]">Changes and your rights</h2><p className="mt-3 text-sm leading-8 text-slate-600">This Privacy Policy may change from time to time. Updates will be published on this page. Your privacy rights remain important to us, and our practices are intended to reflect applicable Malawi requirements.</p></section>
            </>
          )}
        </article>
        <button onClick={() => onNavigate('Home')} className="mt-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-[#2563EB]"><ArrowLeft className="h-4 w-4" /> Back to Royal Hints</button>
      </div>
    </main>
  );
};

export default LegalPage;
