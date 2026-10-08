import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Printer, RefreshCw, ReceiptText } from 'lucide-react';
import { apiClient } from '../backend/api-client';
import { ShipmentTracking } from '../types';

type PrintableReceipt = ShipmentTracking & { qrDataUrl: string };

const OrderReceipts: React.FC = () => {
  const [receipts, setReceipts] = useState<PrintableReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReceipts = async () => {
    setLoading(true);
    setError('');
    try {
      const paidReceipts = await apiClient.getPaidOrderReceipts();
      const withCodes = await Promise.all(paidReceipts.map(async receipt => {
        const scanUrl = `${window.location.origin}/delivery-confirmation/${receipt.scanToken}`;
        return { ...receipt, qrDataUrl: await QRCode.toDataURL(scanUrl, { width: 240, margin: 1, errorCorrectionLevel: 'H' }) };
      }));
      setReceipts(withCodes);
    } catch {
      setError('Unable to load paid order receipts. Sign in as an administrator and retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadReceipts(); }, []);

  return <section className="space-y-6">
    <div className="flex flex-col gap-4 border-b border-blue-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs font-black uppercase tracking-[.24em] text-[#2563EB]">Admin · Fulfilment</p><h2 className="mt-2 text-3xl font-black text-[#172033]">Paid order receipts</h2><p className="mt-2 text-sm text-slate-500">Each verified payment receives one permanent order ID and a unique delivery QR.</p></div>
      <div className="flex gap-2"><button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-[#1D4ED8]"><Printer className="h-4 w-4" /> Print receipts</button><button onClick={() => void loadReceipts()} className="flex h-11 w-11 items-center justify-center rounded-lg border border-blue-100 text-[#2563EB] hover:bg-blue-50" aria-label="Refresh receipts"><RefreshCw className="h-4 w-4" /></button></div>
    </div>
    {loading ? <p className="py-14 text-center text-sm text-slate-500">Loading receipts...</p> : error ? <p className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</p> : receipts.length === 0 ? <div className="rounded-2xl border border-dashed border-blue-200 bg-[#f8fafc] px-6 py-16 text-center"><ReceiptText className="mx-auto h-9 w-9 text-[#2563EB]" /><h3 className="mt-4 text-lg font-black text-[#172033]">No paid orders yet</h3><p className="mt-2 text-sm text-slate-500">Receipts appear here after PayChangu payment is verified.</p></div> : <div className="grid gap-4 xl:grid-cols-2">{receipts.map(receipt => <article key={receipt.id} className="receipt-print-card grid gap-5 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:grid-cols-[1fr_170px] sm:items-center">
      <div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#2563EB]">{receipt.status} · {receipt.paymentMethod}</p><h3 className="mt-2 break-all text-xl font-black text-[#172033]">{receipt.orderId}</h3><p className="mt-1 break-all font-mono text-xs text-slate-500">Tracking: {receipt.trackingNumber}</p><p className="mt-4 text-xs text-slate-500">Paid: {receipt.paidAt ? new Date(receipt.paidAt).toLocaleString() : receipt.orderDate}</p><p className="mt-1 text-xs text-slate-500">Payment ref: {receipt.paymentReference}</p><p className="mt-4 line-clamp-2 text-sm font-semibold text-slate-700">{receipt.items.map(item => `${item.name} × ${item.quantity}`).join(', ')}</p><p className="mt-1 truncate text-xs text-slate-500">Deliver to: {receipt.destination}</p><button onClick={() => window.print()} className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#2563EB] print:hidden"><Printer className="h-4 w-4" /> Print label</button></div>
      <div className="mx-auto w-fit border border-slate-200 bg-white p-2 text-center"><img src={receipt.qrDataUrl} alt={`Delivery QR for ${receipt.orderId}`} className="h-36 w-36" /><p className="mt-1 text-[9px] font-black uppercase tracking-wider text-slate-500">Scan on delivery</p></div>
    </article>)}</div>}
    <style>{`@media print { body * { visibility: hidden !important; } .receipt-print-card, .receipt-print-card * { visibility: visible !important; } .receipt-print-card { break-inside: avoid; box-shadow: none !important; border: 1px solid #94a3b8 !important; } }`}</style>
  </section>;
};

export default OrderReceipts;
