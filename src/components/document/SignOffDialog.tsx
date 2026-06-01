// src/components/document/SignOffDialog.tsx
import React, { useState } from 'react';

interface SignOffDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comment: string) => Promise<void>;
  title: string;
  variant?: 'success' | 'danger'; // Added variant
  actionLabel?: string;
}

export const SignOffDialog: React.FC<SignOffDialogProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title,
  variant = 'success',
  actionLabel = "Confirm"
}) => {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  const handleConfirm = async () => {
    if (!comment.trim()) return;
    setLoading(true);
    try {
      await onConfirm(comment);
      setComment("");
      onClose();
    } catch (error) {
      console.error("Action failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        {/* Header color based on variant */}
        <div className={`px-6 py-4 border-b ${isDanger ? 'bg-red-50' : 'bg-green-50'}`}>
          <h2 className={`text-lg font-bold ${isDanger ? 'text-red-700' : 'text-green-700'}`}>
            {title}
          </h2>
        </div>

        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">
            {isDanger 
              ? "Please provide the reason for rejection. This will be sent back to the author for revision."
              : "By confirming, you are applying your electronic signature to verify this document version."}
          </p>

          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
            {isDanger ? "Reason for Rejection" : "Review Comments"}
          </label>
          <textarea
            autoFocus
            className="w-full p-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none bg-slate-50"
            placeholder={isDanger ? "Identify what needs to be corrected..." : "Comments..."}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <div className="mt-6 flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || !comment.trim()}
              className={`px-6 py-2 text-white text-sm font-bold rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50 ${
                isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? "Processing..." : actionLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};