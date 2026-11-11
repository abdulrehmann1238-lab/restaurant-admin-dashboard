import { useNavigate } from 'react-router-dom';
import { Building2, Check, Mail, ShieldCheck } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { ROLE_PERMISSIONS } from '../../data/mockStaff';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { RoleBadge } from '../ui/Badge';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const { activeRestaurant } = useRestaurant();
  const navigate = useNavigate();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="My Profile"
      subtitle="Account overview and demonstration permissions"
      maxWidthClass="max-w-md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={() => {
              onClose();
              navigate('/dashboard/settings');
            }}
          >
            Restaurant Settings
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-primary)] text-[15px] font-semibold text-white shrink-0">
            AR
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">
                Alex Rivera
              </h3>
              <RoleBadge role="Owner" />
            </div>
            <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-[var(--text-secondary)]">
              <Mail className="h-3.5 w-3.5" /> alex.rivera@theolivetable.com
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-color)] p-4 space-y-2">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[var(--text-primary)]">
            <Building2 className="h-4 w-4 text-[var(--brand-primary)]" />
            Active Restaurant Workspace
          </div>
          <p className="text-[14px] font-medium text-[var(--text-primary)]">
            {activeRestaurant.name}
          </p>
          <p className="text-[12.5px] text-[var(--text-secondary)]">
            {activeRestaurant.address}
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border-color)] p-4">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[var(--text-primary)] mb-2.5">
            <ShieldCheck className="h-4 w-4 text-[var(--brand-primary)]" />
            Role Access Summary (Demo Only)
          </div>
          <ul className="space-y-1.5">
            {ROLE_PERMISSIONS.Owner.map((perm) => (
              <li
                key={perm}
                className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]"
              >
                <Check className="h-3.5 w-3.5 text-[var(--status-success)] shrink-0" />
                {perm}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
}
