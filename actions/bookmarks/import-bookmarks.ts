/**
 * @file import-bookmarks.ts
 * @description 북마크 가져오기 Server Action
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { logError, logInfo } from "@/lib/utils/logger";

interface ImportBookmarkPayload {
  contentId: string;
  folderName?: string;
  tags?: string[];
  note?: string;
  bookmarkedAt?: string;
}

export interface ImportBookmarksResult {
  success: boolean;
  importedCount?: number;
  skippedCount?: number;
  errors?: Array<{ contentId: string; reason: string }>;
  error?: string;
}

function parseJSONPayload(text: string): ImportBookmarkPayload[] {
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) {
    throw new Error("잘못된 JSON 형식입니다. 배열 형태여야 합니다.");
  }
  return parsed.map((item) => ({
    contentId: String(item.contentId || item.content_id || ""),
    folderName: typeof item.folderName === "string" ? item.folderName : item.folder_name,
    tags: Array.isArray(item.tags)
      ? item.tags.map((tag: unknown) => String(tag))
      : typeof item.tags === "string"
      ? item.tags.split(",").map((tag) => tag.trim())
      : [],
    note: typeof item.note === "string" ? item.note : undefined,
    bookmarkedAt: typeof item.bookmarkedAt === "string" ? item.bookmarkedAt : undefined,
  }));
}

function parseCSVPayload(text: string): ImportBookmarkPayload[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];

  const [headerLine, ...rows] = lines;
  const headers = headerLine.split(",");

  const records: ImportBookmarkPayload[] = [];
  rows.forEach((row) => {
    const cells = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"') {
        if (inQuotes && row[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        cells.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    cells.push(current);

    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = (cells[index] ?? "").trim();
    });

    records.push({
      contentId: record["contentId"] || record["content_id"] || "",
      folderName: record["folderName"] || record["folder_name"],
      tags: (record["tags"] || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      note: record["note"],
      bookmarkedAt: record["bookmarkedAt"] || record["bookmarked_at"],
    });
  });

  return records;
}

async function resolveFolderId(
  supabase: ReturnType<typeof createClerkSupabaseClient>,
  userId: string,
  folderName?: string
): Promise<string | null> {
  if (!folderName) return null;

  const trimmed = folderName.trim();
  if (!trimmed) return null;

  const { data: existingFolder } = await supabase
    .from("bookmark_folders")
    .select("id")
    .eq("user_id", userId)
    .ilike("name", trimmed)
    .maybeSingle();

  if (existingFolder?.id) return existingFolder.id;

  const { data: newFolder, error: createError } = await supabase
    .from("bookmark_folders")
    .insert({ user_id: userId, name: trimmed })
    .select("id")
    .single();

  if (createError) {
    console.error("[importBookmarks] 폴더 생성 실패:", createError);
    return null;
  }

  return newFolder?.id ?? null;
}

async function resolveTagIds(
  supabase: ReturnType<typeof createClerkSupabaseClient>,
  userId: string,
  tags: string[]
): Promise<string[]> {
  if (!tags || tags.length === 0) return [];

  const normalized = tags
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (normalized.length === 0) return [];

  const { data: existingTags } = await supabase
    .from("bookmark_tags")
    .select("id, name")
    .eq("user_id", userId)
    .in("name", normalized);

  const existingTagMap = new Map(
    (existingTags || []).map((tag) => [tag.name.toLowerCase(), tag.id])
  );

  const tagIds: string[] = [];

  for (const tag of normalized) {
    const existing = existingTagMap.get(tag.toLowerCase());
    if (existing) {
      tagIds.push(existing);
    } else {
      const { data: newTag, error: createTagError } = await supabase
        .from("bookmark_tags")
        .insert({ user_id: userId, name: tag })
        .select("id")
        .single();

      if (createTagError) {
        console.error("[importBookmarks] 태그 생성 실패:", createTagError);
        continue;
      }

      if (newTag?.id) {
        tagIds.push(newTag.id);
        existingTagMap.set(tag.toLowerCase(), newTag.id);
      }
    }
  }

  return tagIds;
}

export async function importBookmarks(formData: FormData): Promise<ImportBookmarksResult> {
  console.group("[importBookmarks] 북마크 가져오기 시작");

  try {
    const { userId } = await auth();
    if (!userId) {
      console.warn("[importBookmarks] 인증되지 않은 사용자");
      console.groupEnd();
      return { success: false, error: "인증되지 않은 사용자입니다." };
    }

    const supabase = createClerkSupabaseClient();

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userError || !userData) {
      console.error("[importBookmarks] 사용자 조회 실패:", userError);
      logError(
        "[importBookmarks] 사용자 조회 실패",
        userError instanceof Error ? userError : new Error(String(userError))
      );
      console.groupEnd();
      return { success: false, error: "사용자 정보를 찾을 수 없습니다." };
    }

    const file = formData.get("file");
    const format = (formData.get("format") as string)?.toLowerCase();

    if (!file || !(file instanceof File)) {
      console.warn("[importBookmarks] 업로드 파일 없음");
      console.groupEnd();
      return { success: false, error: "업로드된 파일이 없습니다." };
    }

    if (!format || !["json", "csv"].includes(format)) {
      console.warn("[importBookmarks] 지원하지 않는 포맷", format);
      console.groupEnd();
      return { success: false, error: "지원하지 않는 파일 형식입니다." };
    }

    const text = await file.text();
    let payload: ImportBookmarkPayload[] = [];

    if (format === "json") {
      payload = parseJSONPayload(text);
    } else {
      payload = parseCSVPayload(text);
    }

    if (payload.length === 0) {
      console.warn("[importBookmarks] 가져올 데이터 없음");
      console.groupEnd();
      return { success: false, error: "가져올 데이터가 없습니다." };
    }

    const errors: Array<{ contentId: string; reason: string }> = [];
    let importedCount = 0;
    let skippedCount = 0;

    for (const entry of payload) {
      try {
        if (!entry.contentId) {
          errors.push({ contentId: "", reason: "contentId 필드가 없습니다." });
          skippedCount++;
          continue;
        }

        const { data: travel } = await supabase
          .from("travels")
          .select("contentid")
          .eq("contentid", entry.contentId)
          .maybeSingle();

        if (!travel) {
          errors.push({
            contentId: entry.contentId,
            reason: "Supabase에 해당 여행지가 존재하지 않습니다.",
          });
          skippedCount++;
          continue;
        }

        const { data: existingBookmark } = await supabase
          .from("bookmarks")
          .select("id")
          .eq("user_id", userData.id)
          .eq("content_id", entry.contentId)
          .maybeSingle();

        if (existingBookmark?.id) {
          errors.push({
            contentId: entry.contentId,
            reason: "이미 동일한 북마크가 존재합니다.",
          });
          skippedCount++;
          continue;
        }

        const folderId = await resolveFolderId(
          supabase,
          userData.id,
          entry.folderName
        );
        const tagIds = await resolveTagIds(
          supabase,
          userData.id,
          entry.tags || []
        );

        const bookmarkedAt = entry.bookmarkedAt
          ? new Date(entry.bookmarkedAt)
          : new Date();

        const { data: newBookmark, error: insertError } = await supabase
          .from("bookmarks")
          .insert({
            user_id: userData.id,
            content_id: entry.contentId,
            folder_id: folderId,
            note: entry.note ?? null,
            note_updated_at: entry.note ? new Date().toISOString() : null,
            created_at: bookmarkedAt.toISOString(),
          })
          .select("id")
          .single();

        if (insertError || !newBookmark?.id) {
          throw insertError || new Error("북마크 생성 실패");
        }

        if (tagIds.length > 0) {
          const relations = tagIds.map((tagId) => ({
            bookmark_id: newBookmark.id,
            tag_id: tagId,
          }));

          const { error: relationError } = await supabase
            .from("bookmark_tag_relations")
            .insert(relations);

          if (relationError) {
            console.error(
              "[importBookmarks] 태그 관계 생성 실패:",
              relationError
            );
          }
        }

        importedCount++;
      } catch (entryError) {
        console.error(
          "[importBookmarks] 항목 처리 실패:",
          entry.contentId,
          entryError
        );
        errors.push({
          contentId: entry.contentId,
          reason:
            entryError instanceof Error
              ? entryError.message
              : String(entryError),
        });
        skippedCount++;
      }
    }

    logInfo("[importBookmarks] 가져오기 완료", {
      importedCount,
      skippedCount,
      errorCount: errors.length,
    });
    console.groupEnd();

    return {
      success: true,
      importedCount,
      skippedCount,
      errors,
    };
  } catch (error) {
    console.error("[importBookmarks] 가져오기 오류:", error);
    logError(
      "[importBookmarks] 가져오기 오류",
      error instanceof Error ? error : new Error(String(error))
    );
    console.groupEnd();
    return {
      success: false,
      error: "북마크 가져오기 중 오류가 발생했습니다.",
    };
  }
}

