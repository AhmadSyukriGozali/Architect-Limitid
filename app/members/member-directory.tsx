"use client";

import { useState } from "react";

import {
  createMember,
  deleteMember,
  updateMember,
} from "./actions";

type Member = {
  id: string;
  user_id: string | null;
  character_name: string;
  character_class: string | null;
  join_date: string;
  status: "active" | "inactive";
};

type Role = "guild_master" | "officer" | "member";

type Props = {
  members: Member[];
  role: Role;
  currentUserId: string;
};

export default function MemberDirectory({
  members,
  role,
  currentUserId,
}: Props) {
  const [search, setSearch] = useState("");

  const [editingMember, setEditingMember] =
    useState<Member | null>(null);

  const [showCreate, setShowCreate] = useState(false);

  /**
   * Hanya GM / Officer yang punya CRUD.
   */
  const canManageMembers =
    role === "guild_master" || role === "officer";

  /**
   * Filter berdasarkan nama karakter atau class.
   */
  const filteredMembers = members.filter((member) => {
    const keyword = search.toLowerCase();

    return (
      member.character_name.toLowerCase().includes(keyword) ||
      (member.character_class ?? "")
        .toLowerCase()
        .includes(keyword)
    );
  });

  return (
    <div className="min-h-screen bg-[#070816] text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-violet-600/10 blur-3xl" />

        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-2xl">⚔️</span>

              <span className="text-xs font-bold uppercase tracking-[0.25em] text-violet-300">
                Guild Management
              </span>
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Member Directory
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Kelola anggota guild dan informasi karakter.
            </p>
          </div>

          {canManageMembers && (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="min-h-12 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 font-bold shadow-lg shadow-violet-900/30 transition hover:-translate-y-0.5 hover:shadow-violet-700/30 active:translate-y-0"
            >
              + Tambah Member
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Total"
            value={members.length}
            icon="👥"
          />

          <StatCard
            label="Aktif"
            value={
              members.filter(
                (member) => member.status === "active"
              ).length
            }
            icon="🟢"
          />

          <StatCard
            label="Inactive"
            value={
              members.filter(
                (member) => member.status === "inactive"
              ).length
            }
            icon="⚫"
          />

          <StatCard
            label="Role Anda"
            value={formatRole(role)}
            icon="🛡️"
          />
        </div>

        {/* Search */}
        <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-xl backdrop-blur">
          <label
            htmlFor="member-search"
            className="sr-only"
          >
            Cari member
          </label>

          <div className="flex items-center gap-3">
            <span className="text-xl">🔎</span>

            <input
              id="member-search"
              type="search"
              placeholder="Cari nama karakter atau class..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className="w-full bg-transparent py-2 text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Empty state */}
        {filteredMembers.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-6 py-16 text-center">
            <div className="mb-3 text-4xl">🛡️</div>

            <h2 className="font-bold">
              Tidak ada member ditemukan
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Coba gunakan kata pencarian lain.
            </p>
          </div>
        )}

        {/* Desktop table */}
        {filteredMembers.length > 0 && (
          <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl md:block">
            <table className="w-full">
              <thead className="border-b border-white/10 bg-white/[0.04]">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Character
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Class
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Join Date
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {filteredMembers.map((member) => {
                  const isOwnProfile =
                    member.user_id === currentUserId;

                  const canEdit =
                    canManageMembers || isOwnProfile;

                  return (
                    <tr
                      key={member.id}
                      className="transition hover:bg-white/[0.035]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={member.character_name}
                          />

                          <div>
                            <div className="font-bold">
                              {member.character_name}
                            </div>

                            {isOwnProfile && (
                              <div className="mt-0.5 text-xs text-violet-300">
                                Profil Anda
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-300">
                        {member.character_class ||
                          "Belum diatur"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-400">
                        {formatDate(member.join_date)}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={member.status} />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() =>
                                setEditingMember(member)
                              }
                              className="min-h-10 rounded-lg border border-white/10 bg-white/[0.05] px-3 text-sm font-semibold transition hover:border-violet-500/40 hover:bg-violet-500/10"
                            >
                              ✏️ Edit
                            </button>
                          )}

                          {canManageMembers && (
                            <DeleteButton
                              member={member}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile cards */}
        {filteredMembers.length > 0 && (
          <div className="space-y-3 md:hidden">
            {filteredMembers.map((member) => {
              const isOwnProfile =
                member.user_id === currentUserId;

              const canEdit =
                canManageMembers || isOwnProfile;

              return (
                <div
                  key={member.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={member.character_name}
                      />

                      <div>
                        <div className="font-bold">
                          {member.character_name}
                        </div>

                        <div className="mt-1 text-sm text-slate-400">
                          {member.character_class ||
                            "Class belum diatur"}
                        </div>
                      </div>
                    </div>

                    <StatusBadge status={member.status} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-black/20 p-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Join Date
                      </div>

                      <div className="mt-1 text-sm text-slate-300">
                        {formatDate(member.join_date)}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Status
                      </div>

                      <div className="mt-1 text-sm text-slate-300">
                        {member.status === "active"
                          ? "Active"
                          : "Inactive"}
                      </div>
                    </div>
                  </div>

                  {(canEdit || canManageMembers) && (
                    <div className="mt-4 flex gap-2">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() =>
                            setEditingMember(member)
                          }
                          className="min-h-11 flex-1 rounded-xl border border-white/10 bg-white/[0.05] px-4 text-sm font-bold transition active:scale-[0.98]"
                        >
                          ✏️ Edit
                        </button>
                      )}

                      {canManageMembers && (
                        <DeleteButton
                          member={member}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create modal */}
      {showCreate && (
        <MemberModal
          mode="create"
          role={role}
          onClose={() => setShowCreate(false)}
        />
      )}

      {/* Edit modal */}
      {editingMember && (
        <MemberModal
          mode="edit"
          role={role}
          member={editingMember}
          currentUserId={currentUserId}
          onClose={() => setEditingMember(null)}
        />
      )}
    </div>
  );
}

/* ============================================================
   COMPONENT: STAT CARD
============================================================ */

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <span className="text-xl">{icon}</span>

        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </span>
      </div>

      <div className="mt-3 text-2xl font-black">
        {value}
      </div>
    </div>
  );
}

/* ============================================================
   COMPONENT: AVATAR
============================================================ */

function Avatar({ name }: { name: string }) {
  const letter = name.charAt(0).toUpperCase();

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 font-black shadow-lg shadow-violet-900/20">
      {letter}
    </div>
  );
}

/* ============================================================
   COMPONENT: STATUS
============================================================ */

function StatusBadge({
  status,
}: {
  status: "active" | "inactive";
}) {
  if (status === "active") {
    return (
      <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-300">
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-slate-500/20 bg-slate-500/10 px-2.5 py-1 text-xs font-bold text-slate-400">
      Inactive
    </span>
  );
}

/* ============================================================
   COMPONENT: DELETE BUTTON
============================================================ */

function DeleteButton({
  member,
}: {
  member: Member;
}) {
  const handleDelete = () => {
    const confirmed = window.confirm(
      `Hapus member "${member.character_name}"?`
    );

    if (!confirmed) {
      return;
    }

    const formData = new FormData();

    formData.set("member_id", member.id);

    void deleteMember(formData);
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="min-h-11 rounded-xl border border-red-500/20 bg-red-500/10 px-4 text-sm font-bold text-red-300 transition hover:bg-red-500/20 active:scale-[0.98]"
    >
      🗑️
    </button>
  );
}

/* ============================================================
   COMPONENT: MEMBER MODAL
============================================================ */

function MemberModal({
  mode,
  role,
  member,
  currentUserId,
  onClose,
}: {
  mode: "create" | "edit";
  role: Role;
  member?: Member;
  currentUserId?: string;
  onClose: () => void;
}) {
  const isCreate = mode === "create";

  const isOwnProfile =
    member?.user_id === currentUserId;

  const canManage =
    role === "guild_master" || role === "officer";

  const canEditAdminFields =
    canManage && !isOwnProfile
      ? true
      : canManage;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0b0d1d] shadow-2xl sm:max-w-lg sm:rounded-3xl">
        {/* Modal header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-[#0b0d1d]/95 px-5 py-4 backdrop-blur">
          <div>
            <div className="text-lg font-black">
              {isCreate
                ? "Tambah Member"
                : "Edit Member"}
            </div>

            <div className="mt-1 text-xs text-slate-500">
              {isCreate
                ? "Tambahkan anggota baru ke guild."
                : "Perbarui informasi karakter."}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form
          action={isCreate ? createMember : updateMember}
          onSubmit={() => {
            // Modal ditutup setelah browser mengirim form.
            // Data akan di-refresh oleh revalidatePath().
            setTimeout(onClose, 100);
          }}
          className="space-y-5 p-5"
        >
          {!isCreate && (
            <input
              type="hidden"
              name="member_id"
              value={member?.id ?? ""}
            />
          )}

          {/* Character name */}
          <div>
            <label
              htmlFor="character_name"
              className="mb-2 block text-sm font-bold"
            >
              Nama Karakter
            </label>

            <input
              id="character_name"
              name="character_name"
              defaultValue={member?.character_name ?? ""}
              required
              maxLength={50}
              className="min-h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10"
              placeholder="Contoh: Arthas"
            />
          </div>

          {/* Class */}
          <div>
            <label
              htmlFor="character_class"
              className="mb-2 block text-sm font-bold"
            >
              Class / Role In-Game
            </label>

            <input
              id="character_class"
              name="character_class"
              defaultValue={
                member?.character_class ?? ""
              }
              maxLength={50}
              className="min-h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10"
              placeholder="Contoh: Tank / Warrior"
            />
          </div>

          {/* Create-only fields */}
          {isCreate && canManage && (
            <>
              <div>
                <label
                  htmlFor="join_date"
                  className="mb-2 block text-sm font-bold"
                >
                  Tanggal Join
                </label>

                <input
                  id="join_date"
                  name="join_date"
                  type="date"
                  defaultValue={
                    new Date()
                      .toISOString()
                      .slice(0, 10)
                  }
                  className="min-h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-white outline-none focus:border-violet-500/60"
                />
              </div>

              <div>
                <label
                  htmlFor="user_id"
                  className="mb-2 block text-sm font-bold"
                >
                  User ID Supabase Auth
                  <span className="ml-2 text-xs font-normal text-slate-500">
                    optional
                  </span>
                </label>

                <input
                  id="user_id"
                  name="user_id"
                  className="min-h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 font-mono text-xs text-white outline-none focus:border-violet-500/60"
                  placeholder="uuid user dari auth.users"
                />

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Kosongkan jika akun Supabase Auth
                  member belum dibuat.
                </p>
              </div>
            </>
          )}

          {/* Admin-only status */}
          {!isCreate && canEditAdminFields && (
            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-bold"
              >
                Status
              </label>

              <select
                id="status"
                name="status"
                defaultValue={member?.status ?? "active"}
                className="min-h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-white outline-none focus:border-violet-500/60"
              >
                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>
            </div>
          )}

          {!isCreate && !canManage && (
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 text-xs leading-5 text-slate-400">
              Anda sedang mengedit profil sendiri.
              Field administrasi seperti status,
              tanggal join, dan poin tidak dapat
              diubah.
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-12 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 font-bold text-slate-300 transition hover:bg-white/[0.08]"
            >
              Batal
            </button>

            <button
              type="submit"
              className="min-h-12 flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 font-bold shadow-lg shadow-violet-900/20 transition hover:-translate-y-0.5"
            >
              {isCreate
                ? "Tambah Member"
                : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   HELPERS
============================================================ */

function formatRole(role: Role) {
  if (role === "guild_master") {
    return "Guild Master";
  }

  if (role === "officer") {
    return "Officer";
  }

  return "Member";
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}