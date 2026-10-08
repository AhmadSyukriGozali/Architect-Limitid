import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import MemberDirectory from "./member-directory";

type Role =
  | "guild_master"
  | "officer"
  | "member";

export default async function MembersPage() {
  const supabase = await createClient();

  // Ambil user yang sedang login.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Jika belum login, kembali ke login.
  if (!user) {
    redirect("/login");
  }

  // Ambil role user.
  const { data: roleData, error: roleError } =
    await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

  if (roleError || !roleData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070816] px-6 text-white">
        <div className="max-w-md rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <div className="mb-3 text-3xl">⚠️</div>

          <h1 className="font-bold">
            Role belum dikonfigurasi
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Akun Anda sudah login, tetapi belum
            mempunyai record pada tabel user_roles.
          </p>
        </div>
      </main>
    );
  }

  // Ambil seluruh member.
  const { data: members, error: membersError } =
    await supabase
      .from("members")
      .select(
        `
          id,
          user_id,
          character_name,
          character_class,
          join_date,
          status
        `
      )
      .order("status", {
        ascending: true,
      })
      .order("character_name", {
        ascending: true,
      });

  if (membersError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070816] px-6 text-white">
        <div className="max-w-md rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <div className="mb-3 text-3xl">⚠️</div>

          <h1 className="font-bold">
            Gagal memuat member
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {membersError.message}
          </p>
        </div>
      </main>
    );
  }

  return (
    <MemberDirectory
      members={members ?? []}
      role={roleData.role as Role}
      currentUserId={user.id}
    />
  );
}