/**
 * @file bookmark-export.ts
 * @description 북마크 내보내기 유틸리티 함수 모음
 */

import type { BookmarkWithTravel } from "@/actions/bookmarks/get-bookmarks";

interface ExportBookmarkRecord {
  contentId: string;
  title: string;
  address: string;
  areaCode: string;
  sigunguCode: string;
  contentTypeId: string;
  folderName: string;
  tags: string;
  note: string;
  bookmarkedAt: string;
}

function sanitizeField(value: string | null | undefined): string {
  return (value ?? "").replace(/\r?\n|\r/g, " ").trim();
}

function createExportRecord(
  bookmark: BookmarkWithTravel,
  folderName: string | undefined
): ExportBookmarkRecord {
  return {
    contentId: bookmark.contentid ?? "",
    title: sanitizeField(bookmark.title),
    address: sanitizeField(
      [bookmark.addr1, bookmark.addr2].filter(Boolean).join(" ") || ""
    ),
    areaCode: bookmark.areacode ?? "",
    sigunguCode: bookmark.sigungucode ?? "",
    contentTypeId: bookmark.contenttypeid ?? "",
    folderName: sanitizeField(folderName),
    tags: (bookmark.tags || [])
      .map((tag) => sanitizeField(tag.name))
      .filter(Boolean)
      .join(", "),
    note: sanitizeField(bookmark.note),
    bookmarkedAt: bookmark.bookmarkedAt,
  };
}

export function buildExportPayload(
  bookmarks: BookmarkWithTravel[],
  folderNameMap: Map<string, string>
) {
  return bookmarks.map((bookmark) =>
    createExportRecord(
      bookmark,
      bookmark.folderId ? folderNameMap.get(bookmark.folderId) : undefined
    )
  );
}

export function convertBookmarksToJSON(records: ExportBookmarkRecord[]): string {
  return JSON.stringify(records, null, 2);
}

export function convertBookmarksToCSV(records: ExportBookmarkRecord[]): string {
  const header = [
    "contentId",
    "title",
    "address",
    "areaCode",
    "sigunguCode",
    "contentTypeId",
    "folderName",
    "tags",
    "note",
    "bookmarkedAt",
  ];

  const escapeCSVField = (value: string): string => {
    if (value.includes(",") || value.includes("\"")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const rows = records.map((record) =>
    [
      record.contentId,
      record.title,
      record.address,
      record.areaCode,
      record.sigunguCode,
      record.contentTypeId,
      record.folderName,
      record.tags,
      record.note,
      record.bookmarkedAt,
    ]
      .map((field) => escapeCSVField(field))
      .join(",")
  );

  return [header.join(","), ...rows].join("\n");
}

export type { ExportBookmarkRecord };

