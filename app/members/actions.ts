"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type MemberRole = "guild_master" | "officer" | "member";

/**
 * Mengambil user yang sedang login.
 */
async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Anda harus login terlebih dahulu.");
  }

  return {
    supabase,
    user,
  };
}

/**
 * Mengambil role aplikasi user.
 */
async function getCurrentRole(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<MemberRole> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    throw new Error("Role user tidak ditemukan.");
  }

  return data.role as MemberRole;
}

/**
 * Validasi nama karakter.
 */
function validateCharacterName(value: string) {
  const name = value.trim();

  if (!name) {
    throw new Error("Nama karakter wajib diisi.");
  }

  if (name.length < 2) {
    throw new Error("Nama karakter minimal 2 karakter.");
  }

  if (name.length > 50) {
    throw new Error("Nama karakter maksimal 50 karakter.");
  }

  return name;
}

/**
 * Validasi class.
 */
function validateCharacterClass(value: string) {
  const characterClass = value.trim();

  if (characterClass.length > 50) {
    throw new Error("Class maksimal 50 karakter.");
  }

  return characterClass || null;
}

/**
 * Menambahkan member baru.
 *
 * Hanya Guild Master dan Officer yang boleh menjalankan.
 */
export async function createMember(formData: FormData) {
  const { supabase, user } = await getCurrentUser();

  const role = await getCurrentRole(supabase, user.id);

  if (role !== "guild_master" && role !== "officer") {
    throw new Error("Anda tidak memiliki izin menambah member.");
  }

  const characterName = validateCharacterName(
    String(formData.get("character_name") ?? "")
  );

  const characterClass = validateCharacterClass(
    String(formData.get("character_class") ?? "")
  );

  const joinDateValue = String(
    formData.get("join_date") ?? ""
  );

  const joinDate = joinDateValue || new Date().toISOString().slice(0, 10);

  const userIdValue = String(
    formData.get("user_id") ?? ""
  ).trim();

  const userId = userIdValue || null;

  const { error } = await supabase.from("members").insert({
    character_name: characterName,
    character_class: characterClass,
    join_date: joinDate,
    user_id: userId,
    status: "active",
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/members");
}

/**
 * Mengubah data member.
 *
 * Officer / GM:
 *   boleh mengubah data administrasi.
 *
 * Member:
 *   hanya boleh mengubah profile miliknya sendiri.
 */
export async function updateMember(formData: FormData) {
  const { supabase, user } = await getCurrentUser();

  const role = await getCurrentRole(supabase, user.id);

  const memberId = String(
    formData.get("member_id") ?? ""
  ).trim();

  if (!memberId) {
    throw new Error("Member ID tidak ditemukan.");
  }

  const characterName = validateCharacterName(
    String(formData.get("character_name") ?? "")
  );

  const characterClass = validateCharacterClass(
    String(formData.get("character_class") ?? "")
  );

  /**
   * Member biasa:
   * hanya boleh mengubah profile miliknya sendiri.
   */
  if (role === "member") {
    const { error } = await supabase
      .from("members")
      .update({
        character_name: characterName,
        character_class: characterClass,
      })
      .eq("id", memberId)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Officer / GM:
   * boleh mengubah data member.
   */
  if (role === "officer" || role === "guild_master") {
    const status = String(
      formData.get("status") ?? "active"
    );

    if (status !== "active" && status !== "inactive") {
      throw new Error("Status member tidak valid.");
    }

    const joinDateValue = String(
      formData.get("join_date") ?? ""
    );

    const joinDate = joinDateValue || undefined;

    const updateData: {
      character_name: string;
      character_class: string | null;
      status: "active" | "inactive";
      join_date?: string;
    } = {
      character_name: characterName,
      character_class: characterClass,
      status,
    };

    if (joinDate) {
      updateData.join_date = joinDate;
    }

    const { error } = await supabase
      .from("members")
      .update(updateData)
      .eq("id", memberId);

    if (error) {
      throw new Error(error.message);
    }
  }

  revalidatePath("/members");
}

/**
 * Menghapus member.
 *
 * Hanya Officer / GM.
 */
export async function deleteMember(formData: FormData) {
  const { supabase, user } = await getCurrentUser();

  const role = await getCurrentRole(supabase, user.id);

  if (role !== "guild_master" && role !== "officer") {
    throw new Error("Anda tidak memiliki izin menghapus member.");
  }

  const memberId = String(
    formData.get("member_id") ?? ""
  ).trim();

  if (!memberId) {
    throw new Error("Member ID tidak ditemukan.");
  }

  const { error } = await supabase
    .from("members")
    .delete()
    .eq("id", memberId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/members");
}