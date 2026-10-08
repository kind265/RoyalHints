import React, { useEffect, useState } from 'react';
import { CheckCircle2, LoaderCircle, PackageCheck, XCircle } from 'lucide-react';
import { apiClient } from '../backend/api-client';

interface DeliveryQrConfirmationProps { token: string; }

const DeliveryQrConfirmation: React.FC<DeliveryQrConfirmationProps> = ({ token }) => {
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirming delivery...');
  const [receipt, setReceipt] = useState<{ orderId: string; trackingNumber: string; status: string } | null>(null);

  useEffect(() => {
    let active = true;
    apiClient.confirmDeliveryByQr(token).then(result => {
      if (!active) return;
      if (!result) {
        setState('error');
        setMessage('This delivery code could not be confirmed. Please contact Royal Hints support.');
        return;
      }
      setReceipt(result);
      setState('success');
      setMessage(result.status === 'Delivered' ? 'Delivery has been confirmed.' : 'Your order has been marked delivered.');
    });
    return () => { active = false; };
  }, [token]);

  const SuccessIcon = state === 'loading' ? LoaderCircle : state === 'success' ? CheckCircle2 : XCircle;
  return <main className="flex min-h-[70vh] items-center justify-center bg-[#eff6ff] px-5 py-16"><section className="w-full max-w-lg rounded-2xl border border-blue-100 bg-white p-8 text-center shadow-xl shadow-blue-900/5"><div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${state === 'error' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-[#2563EB]'}`}><SuccessIcon className={`h-7 w-7 ${state === 'loading' ? 'animate-spin' : ''}`} /></div><div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[.24em] text-[#2563EB]"><PackageCheck className="h-4 w-4" /> Royal Hints delivery</div><h1 className="mt-3 text-2xl font-black text-[#172033]">{state === 'success' ? 'Delivery confirmed' : state === 'error' ? 'Could not confirm delivery' : 'Verifying delivery'}</h1><p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>{receipt && <div className="mt-6 rounded-xl bg-[#f8fafc] p-4 text-left"><p className="text-xs text-slate-500">Order ID</p><p className="mt-1 font-black text-[#172033]">{receipt.orderId}</p><p className="mt-3 text-xs text-slate-500">Tracking ID</p><p className="mt-1 break-all font-mono text-sm font-bold text-[#2563EB]">{receipt.trackingNumber}</p></div>}</section></main>;
};

export default DeliveryQrConfirmation;
