import React, { useState } from 'react';
import { BookOpen, CheckCircle2, HelpCircle, Keyboard, Mail } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface HelpSupportModalProps {
  open: boolean;
  onClose: () => void;
}

export function HelpSupportModal({ open, onClose }: HelpSupportModalProps) {
  const { showToast } = useToast();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setError('Please enter both a topic and details.');
      return;
    }
    setError('');
    setSent(true);
    showToast({
      title: 'Support request recorded',
      description: 'Demo support confirmation — our hospitality team responds within 2 hours.',
      variant: 'success',
    });
  };

  const handleClose = () => {
    setSent(false);
    setSubject('');
    setMessage('');
    setError('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Help & Support"
      subtitle="Operational guides, keyboard shortcuts, and concierge support."
      maxWidthClass="max-w-lg"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] p-3.5">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-[var(--text-primary)]">
              <Keyboard className="h-4 w-4 text-[var(--brand-primary)]" />
              Shortcuts
            </div>
            <ul className="mt-2 space-y-1.5 text-[12.5px] text-[var(--text-secondary)]">
              <li className="flex justify-between">
                <span>Quick search</span>
                <kbd className="rounded border border-[var(--border-color)] bg-[var(--bg-surface)] px-1.5 py-0.5 text-[11px] font-medium">
                  Ctrl + K
                </kbd>
              </li>
              <li className="flex justify-between">
                <span>Close modal / drawer</span>
                <kbd className="rounded border border-[var(--border-color)] bg-[var(--bg-surface)] px-1.5 py-0.5 text-[11px] font-medium">
                  Esc
                </kbd>
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] p-3.5">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-[var(--text-primary)]">
              <BookOpen className="h-4 w-4 text-[var(--warm-accent)]" />
              Quick Tips
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--text-secondary)]">
              Toggle dish availability directly from the Menu list without opening an edit form. Switch restaurants in the top header.
            </p>
          </div>
        </div>

        {sent ? (
          <div className="rounded-xl border border-[var(--status-success)]/25 bg-[var(--status-success-bg)] p-4 text-center">
            <CheckCircle2 className="mx-auto h-6 w-6 text-[var(--status-success)]" />
            <p className="mt-2 text-[14px] font-medium text-[var(--text-primary)]">
              Message received (Demo)
            </p>
            <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
              In production, this sends directly to Mise Operations Support (`support@miseops.io`).
            </p>
            <Button size="sm" variant="secondary" className="mt-3" onClick={handleClose}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 border-t border-[var(--border-color)] pt-4">
            <div className="flex items-center gap-2 text-[13.5px] font-medium text-[var(--text-primary)]">
              <HelpCircle className="h-4 w-4 text-[var(--brand-primary)]" />
              Send a Note to Support
            </div>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Topic (e.g., POS printer sync or shift handoff)"
              className="h-9 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 text-[13.5px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)] focus:outline-none"
            />
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe how we can assist your restaurant team..."
              className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] p-3 text-[13.5px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)] focus:outline-none resize-none"
            />
            {error && <p className="text-[12px] text-[var(--status-danger)]">{error}</p>}
            <div className="flex items-center justify-between pt-1">
              <span className="inline-flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)]">
                <Mail className="h-3.5 w-3.5" /> support@miseops.io
              </span>
              <Button type="submit" size="sm">
                Send Message
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
