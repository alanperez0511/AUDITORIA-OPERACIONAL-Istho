import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Copy, MessageCircle, Send, X } from 'lucide-react';

const openWhatsApp = (text) => {
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

const copyToClipboard = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  return false;
};

const ModalContent = memo(function ModalContent({ onClose, title, subtitle, message }) {
  const [editable, setEditable] = useState(message ?? '');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(editable);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } else if (textareaRef.current) {
      textareaRef.current.select();
      document.execCommand?.('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [editable]);

  const handleSend = useCallback(() => openWhatsApp(editable), [editable]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-100 rounded-xl">
              <MessageCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{title}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <textarea
            ref={textareaRef}
            value={editable}
            onChange={(e) => setEditable(e.target.value)}
            rows={16}
            className="w-full font-mono text-[13px] leading-relaxed text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
            spellCheck={false}
          />
          <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
            <span>{editable.length} caracteres</span>
            <span>WhatsApp soporta *negrita*, _cursiva_, ~tachado~ y `código`.</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-slate-50/50 rounded-b-2xl">
          <button
            onClick={handleCopy}
            disabled={!editable}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all disabled:opacity-50"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ¡Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copiar al portapapeles
              </>
            )}
          </button>
          <button
            onClick={handleSend}
            disabled={!editable}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Abrir WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
});

export const WhatsAppShareModal = memo(function WhatsAppShareModal({
  open,
  onClose,
  title = 'Compartir resumen por WhatsApp',
  subtitle = 'Revise el mensaje, ajústelo si lo necesita y envíelo al grupo',
  message,
}) {
  if (!open) return null;
  return <ModalContent onClose={onClose} title={title} subtitle={subtitle} message={message} />;
});
