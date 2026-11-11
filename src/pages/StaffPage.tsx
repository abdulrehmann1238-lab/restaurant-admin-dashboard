import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Check,
  Pencil,
  Plus,
  Search,
  Shield,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react';
import { RoleBadge, StaffStatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Modal } from '../components/ui/Modal';
import { Switch } from '../components/ui/Switch';
import { useRestaurant } from '../context/RestaurantContext';
import { ROLE_PERMISSIONS } from '../data/mockStaff';
import type { StaffDepartment, StaffMember, StaffRole, StaffStatus } from '../types';
import { formatDateString } from '../utils/format';

const ROLES: StaffRole[] = ['Owner', 'Manager', 'Cashier', 'Kitchen Staff', 'Waiter'];
const DEPARTMENTS: StaffDepartment[] = ['Management', 'Front of House', 'Kitchen', 'Service'];

export function StaffPage() {
  const {
    staff,
    activeRestaurantId,
    settings,
    addStaffMember,
    editStaffMember,
    removeStaffMember,
  } = useRestaurant();
  const location = useLocation();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | StaffRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | StaffStatus>('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [permissionsTarget, setPermissionsTarget] = useState<StaffMember | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<StaffMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  // Modal Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<StaffRole | ''>('Waiter');
  const [department, setDepartment] = useState<StaffDepartment>('Service');
  const [status, setStatus] = useState<StaffStatus>('Active');
  const [onShift, setOnShift] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const state = location.state as { searchQuery?: string } | null;
    if (state?.searchQuery) setSearch(state.searchQuery);
  }, [location.state]);

  const summary = useMemo(() => {
    return {
      total: staff.length,
      active: staff.filter((s) => s.status === 'Active').length,
      managers: staff.filter((s) => s.role === 'Manager' || s.role === 'Owner').length,
      onShift: staff.filter((s) => s.status === 'Active' && s.onShift).length,
    };
  }, [staff]);

  const filteredStaff = useMemo(() => {
    const q = search.trim().toLowerCase();
    return staff.filter((m) => {
      if (roleFilter !== 'all' && m.role !== roleFilter) return false;
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (
        q &&
        !m.fullName.toLowerCase().includes(q) &&
        !m.email.toLowerCase().includes(q) &&
        !m.department.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [staff, search, roleFilter, statusFilter]);

  const openAddModal = () => {
    setEditingMember(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setRole('Waiter');
    setDepartment('Service');
    setStatus('Active');
    setOnShift(true);
    setErrors({});
    setFormOpen(true);
  };

  const openEditModal = (member: StaffMember) => {
    setEditingMember(member);
    setFullName(member.fullName);
    setEmail(member.email);
    setPhone(member.phone);
    setRole(member.role);
    setDepartment(member.department);
    setStatus(member.status);
    setOnShift(member.onShift);
    setErrors({});
    setFormOpen(true);
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!role) errs.role = 'Please select a role.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !validateForm() || !role) return;

    setSubmitting(true);
    try {
      if (editingMember) {
        await editStaffMember(editingMember.id, {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || '+1 (415) 555-0199',
          role,
          department,
          status,
          onShift: status === 'Active' ? onShift : false,
        });
      } else {
        await addStaffMember({
          restaurantId: activeRestaurantId,
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || '+1 (415) 555-0199',
          role,
          department,
          status,
          onShift: status === 'Active' ? onShift : false,
        });
      }
      setFormOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAccountStatus = (member: StaffMember) => {
    if (member.status === 'Active') {
      setDeactivateTarget(member);
    } else {
      void editStaffMember(member.id, { status: 'Active' });
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivateTarget) return;
    setConfirmBusy(true);
    try {
      await editStaffMember(deactivateTarget.id, {
        status: 'Inactive',
        onShift: false,
      });
      setDeactivateTarget(null);
    } finally {
      setConfirmBusy(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setConfirmBusy(true);
    try {
      await removeStaffMember(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setConfirmBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] sm:text-[26px] font-semibold tracking-tight text-[var(--text-primary)]">
            Staff Management
          </h2>
          <p className="mt-1 text-[14px] text-[var(--text-secondary)]">
            Manage your restaurant team and account permissions.
          </p>
        </div>

        <Button onClick={openAddModal} icon={<Plus className="h-4 w-4" />}>
          Add Staff Member
        </Button>
      </div>

      {/* Summary Cards */}
      <section aria-label="Staff overview summary" className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4">
          <p className="text-[12px] font-medium text-[var(--text-secondary)]">Total Staff</p>
          <p className="mt-1.5 text-[24px] font-semibold tabular-nums text-[var(--text-primary)]">
            {summary.total}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4">
          <p className="text-[12px] font-medium text-[var(--text-secondary)]">Active Accounts</p>
          <p className="mt-1.5 text-[24px] font-semibold tabular-nums text-[var(--status-success)]">
            {summary.active}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4">
          <p className="text-[12px] font-medium text-[var(--text-secondary)]">Managers &amp; Owners</p>
          <p className="mt-1.5 text-[24px] font-semibold tabular-nums text-[var(--warm-accent)]">
            {summary.managers}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4">
          <p className="text-[12px] font-medium text-[var(--text-secondary)]">Staff on Shift</p>
          <p className="mt-1.5 text-[24px] font-semibold tabular-nums text-[var(--brand-primary)]">
            {summary.onShift}
          </p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employees by name, email, or department..."
              aria-label="Search staff members"
              className="h-9 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] pl-9 pr-3 text-[13.5px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              aria-label="Filter by role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'all' | StaffRole)}
              className="h-9 rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3 text-[13px] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by account status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | StaffStatus)}
              className="h-9 rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] px-3 text-[13px] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </section>

      {/* Desktop Table */}
      <section className="hidden md:block rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-elevated)] text-[11.5px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                <th className="py-3.5 pl-5 pr-3">Employee</th>
                <th className="py-3.5 px-3">Email</th>
                <th className="py-3.5 px-3">Role</th>
                <th className="py-3.5 px-3">Department</th>
                <th className="py-3.5 px-3">Account Status</th>
                <th className="py-3.5 px-3">Date Added</th>
                <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-[13.5px]">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-[14px] text-[var(--text-secondary)]"
                  >
                    No team members match your filters.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-[var(--bg-hover)]/60 transition-colors"
                  >
                    <td className="py-3.5 pl-5 pr-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-subtle-green)] text-[12px] font-semibold text-[var(--brand-primary)] shrink-0">
                          {member.avatarInitials}
                        </span>
                        <div>
                          <p className="font-semibold text-[var(--text-primary)]">
                            {member.fullName}
                          </p>
                          <p className="text-[12px] text-[var(--text-secondary)]">
                            {member.onShift && member.status === 'Active'
                              ? 'On shift now'
                              : 'Off shift'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-[var(--text-secondary)] whitespace-nowrap">
                      {member.email}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <RoleBadge role={member.role} />
                    </td>

                    <td className="py-3.5 px-3 text-[var(--text-secondary)] whitespace-nowrap">
                      {member.department}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <StaffStatusBadge status={member.status} />
                    </td>

                    <td className="py-3.5 px-3 tabular-nums text-[12.5px] text-[var(--text-secondary)] whitespace-nowrap">
                      {formatDateString(member.dateAdded, settings.dateFormat)}
                    </td>

                    <td className="py-3.5 pl-3 pr-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPermissionsTarget(member)}
                          title="View role permissions"
                          aria-label={`View permissions for ${member.fullName}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
                        >
                          <Shield className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditModal(member)}
                          title="Edit employee"
                          aria-label={`Edit ${member.fullName}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleAccountStatus(member)}
                          title={
                            member.status === 'Active'
                              ? 'Deactivate account'
                              : 'Activate account'
                          }
                          aria-label={
                            member.status === 'Active'
                              ? `Deactivate ${member.fullName}`
                              : `Activate ${member.fullName}`
                          }
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
                        >
                          {member.status === 'Active' ? (
                            <UserX className="h-3.5 w-3.5 text-[var(--status-warning)]" />
                          ) : (
                            <UserCheck className="h-3.5 w-3.5 text-[var(--status-success)]" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(member)}
                          title="Remove employee"
                          aria-label={`Remove ${member.fullName}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-color)] text-[var(--status-danger)] hover:bg-[var(--status-danger-bg)] cursor-pointer transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Mobile Cards */}
      <section className="md:hidden space-y-3">
        {filteredStaff.map((member) => (
          <div
            key={member.id}
            className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-subtle-green)] text-[12px] font-semibold text-[var(--brand-primary)] shrink-0">
                  {member.avatarInitials}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--text-primary)] truncate">
                    {member.fullName}
                  </p>
                  <p className="text-[12.5px] text-[var(--text-secondary)] truncate">
                    {member.email}
                  </p>
                </div>
              </div>
              <StaffStatusBadge status={member.status} />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <RoleBadge role={member.role} />
                <span className="text-[12px] text-[var(--text-secondary)]">
                  {member.department}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPermissionsTarget(member)}
                  aria-label={`View permissions for ${member.fullName}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)]"
                >
                  <Shield className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => openEditModal(member)}
                  aria-label={`Edit ${member.fullName}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)]"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(member)}
                  aria-label={`Remove ${member.fullName}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-color)] text-[var(--status-danger)]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Add / Edit Staff Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingMember ? 'Edit Staff Member' : 'Add Staff Member'}
        subtitle={
          editingMember
            ? 'Update employee details, role, or account access.'
            : 'Create a team member profile for this restaurant.'
        }
        maxWidthClass="max-w-lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" form="staff-member-form" loading={submitting}>
              {editingMember ? 'Save Changes' : 'Add Staff Member'}
            </Button>
          </>
        }
      >
        <form id="staff-member-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="staff-name"
              className="block text-[13px] font-medium text-[var(--text-primary)] mb-1.5"
            >
              Full Name <span className="text-[var(--status-danger)]">*</span>
            </label>
            <input
              id="staff-name"
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors((p) => ({ ...p, fullName: '' }));
              }}
              placeholder="e.g. Jordan Alvarez"
              className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 text-[14px] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none"
            />
            {errors.fullName && (
              <p className="mt-1 text-[12px] text-[var(--status-danger)]">{errors.fullName}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="staff-email"
                className="block text-[13px] font-medium text-[var(--text-primary)] mb-1.5"
              >
                Email <span className="text-[var(--status-danger)]">*</span>
              </label>
              <input
                id="staff-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((p) => ({ ...p, email: '' }));
                }}
                placeholder="jordan@theolivetable.com"
                className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 text-[14px] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none"
              />
              {errors.email && (
                <p className="mt-1 text-[12px] text-[var(--status-danger)]">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="staff-phone"
                className="block text-[13px] font-medium text-[var(--text-primary)] mb-1.5"
              >
                Phone Number
              </label>
              <input
                id="staff-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (415) 555-0188"
                className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 text-[14px] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="staff-role"
                className="block text-[13px] font-medium text-[var(--text-primary)] mb-1.5"
              >
                Role <span className="text-[var(--status-danger)]">*</span>
              </label>
              <select
                id="staff-role"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value as StaffRole);
                  if (errors.role) setErrors((p) => ({ ...p, role: '' }));
                }}
                className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 text-[13.5px] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none"
              >
                <option value="">Select role</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="mt-1 text-[12px] text-[var(--status-danger)]">{errors.role}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="staff-dept"
                className="block text-[13px] font-medium text-[var(--text-primary)] mb-1.5"
              >
                Department
              </label>
              <select
                id="staff-dept"
                value={department}
                onChange={(e) => setDepartment(e.target.value as StaffDepartment)}
                className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 text-[13.5px] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="staff-status"
                className="block text-[13px] font-medium text-[var(--text-primary)] mb-1.5"
              >
                Account Status
              </label>
              <select
                id="staff-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as StaffStatus)}
                className="h-10 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] px-3 text-[13.5px] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border-color)] px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[13.5px] font-medium text-[var(--text-primary)]">
                Currently on shift
              </p>
              <p className="text-[12px] text-[var(--text-secondary)]">
                Included in active shift headcount
              </p>
            </div>
            <Switch
              checked={status === 'Active' ? onShift : false}
              disabled={status !== 'Active'}
              onChange={setOnShift}
              ariaLabel="Currently on shift"
            />
          </div>
        </form>
      </Modal>

      {/* Role Permissions Modal */}
      <Modal
        open={permissionsTarget !== null}
        onClose={() => setPermissionsTarget(null)}
        title={permissionsTarget ? `${permissionsTarget.fullName} — Permissions` : 'Permissions'}
        subtitle="Demonstration-only role capability preview"
        maxWidthClass="max-w-md"
        footer={
          <Button variant="secondary" onClick={() => setPermissionsTarget(null)}>
            Close
          </Button>
        }
      >
        {permissionsTarget && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] p-3.5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-subtle-green)] text-[12px] font-semibold text-[var(--brand-primary)]">
                  {permissionsTarget.avatarInitials}
                </span>
                <div>
                  <p className="text-[14px] font-semibold text-[var(--text-primary)]">
                    {permissionsTarget.fullName}
                  </p>
                  <p className="text-[12px] text-[var(--text-secondary)]">
                    {permissionsTarget.department}
                  </p>
                </div>
              </div>
              <RoleBadge role={permissionsTarget.role} />
            </div>

            <div className="rounded-xl border border-[var(--border-color)] p-4">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                {permissionsTarget.role} Permissions
              </p>
              <ul className="space-y-2">
                {ROLE_PERMISSIONS[permissionsTarget.role].map((perm) => (
                  <li
                    key={perm}
                    className="flex items-center gap-2.5 text-[13.5px] text-[var(--text-primary)]"
                  >
                    <Check className="h-4 w-4 text-[var(--status-success)] shrink-0" />
                    {perm}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-[12px] text-[var(--text-muted)]">
              Note: These permissions illustrate typical restaurant role boundaries for demonstration purposes and are not enforced by a backend authorization server.
            </p>
          </div>
        )}
      </Modal>

      {/* Deactivate Confirmation */}
      <ConfirmDialog
        open={deactivateTarget !== null}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={handleConfirmDeactivate}
        loading={confirmBusy}
        title={`Deactivate ${deactivateTarget?.fullName ?? 'account'}?`}
        message="Deactivating this account suspends shift access until reactivated by a manager."
        confirmLabel="Deactivate"
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={confirmBusy}
        title={`Remove ${deleteTarget?.fullName ?? 'employee'}?`}
        message="This will remove the employee from the team roster permanently in this demo workspace."
        confirmLabel="Remove Employee"
      />
    </div>
  );
}

