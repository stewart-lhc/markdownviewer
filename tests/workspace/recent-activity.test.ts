import {
  clearRecentActivity,
  createShareCopyRecentActivityItem,
  createShareRecentActivityItem,
  readRecentActivity,
  recentActivityStorageKey,
  removeRecentActivity,
  upsertRecentActivity,
  writeRecentActivity
} from "@/lib/workspace/recent-activity";

describe("recent activity", () => {
  it("returns an empty list when storage is empty", () => {
    expect(readRecentActivity(window.localStorage)).toEqual([]);
  });

  it("ignores invalid JSON, wrong versions, and malformed payloads", () => {
    window.localStorage.setItem(recentActivityStorageKey, "{not-json");
    expect(readRecentActivity(window.localStorage)).toEqual([]);

    window.localStorage.setItem(
      recentActivityStorageKey,
      JSON.stringify({ version: 99, items: [] })
    );
    expect(readRecentActivity(window.localStorage)).toEqual([]);

    window.localStorage.setItem(
      recentActivityStorageKey,
      JSON.stringify({ version: 1, items: {} })
    );
    expect(readRecentActivity(window.localStorage)).toEqual([]);
  });

  it("upserts by id and keeps the newest update first", () => {
    upsertRecentActivity(
      createShareRecentActivityItem({
        shareId: "one",
        title: "First",
        href: "/share/one",
        now: 100
      }),
      window.localStorage
    );
    upsertRecentActivity(
      createShareRecentActivityItem({
        shareId: "two",
        title: "Second",
        href: "/share/two",
        now: 200
      }),
      window.localStorage
    );
    upsertRecentActivity(
      createShareRecentActivityItem({
        shareId: "one",
        title: "First updated",
        href: "/share/one",
        now: 300
      }),
      window.localStorage
    );

    expect(readRecentActivity(window.localStorage).map((item) => item.id)).toEqual([
      "share-created:one",
      "share-created:two"
    ]);
    expect(readRecentActivity(window.localStorage)[0]).toMatchObject({
      title: "First updated",
      updatedAt: 300
    });
  });

  it("keeps at most twelve items by default", () => {
    for (let index = 0; index < 14; index += 1) {
      upsertRecentActivity(
        createShareCopyRecentActivityItem({
          shareId: `share-${index}`,
          title: `Share ${index}`,
          href: `/workspace?share=share-${index}&shareAction=copy`,
          now: index
        }),
        window.localStorage
      );
    }

    const items = readRecentActivity(window.localStorage);

    expect(items).toHaveLength(12);
    expect(items[0].id).toBe("share-copy:share-13");
    expect(items.at(-1)?.id).toBe("share-copy:share-2");
  });

  it("supports a read limit for compact continue panels", () => {
    writeRecentActivity(
      [
        createShareRecentActivityItem({ shareId: "one", title: "One", now: 100 }),
        createShareRecentActivityItem({ shareId: "two", title: "Two", now: 200 }),
        createShareRecentActivityItem({ shareId: "three", title: "Three", now: 300 }),
        createShareRecentActivityItem({ shareId: "four", title: "Four", now: 400 })
      ],
      window.localStorage
    );

    expect(readRecentActivity(window.localStorage, { limit: 3 }).map((item) => item.id)).toEqual([
      "share-created:four",
      "share-created:three",
      "share-created:two"
    ]);
  });

  it("removes a single recent item", () => {
    writeRecentActivity(
      [
        createShareRecentActivityItem({ shareId: "one", title: "One", now: 100 }),
        createShareRecentActivityItem({ shareId: "two", title: "Two", now: 200 })
      ],
      window.localStorage
    );

    removeRecentActivity("share-created:one", window.localStorage);

    expect(readRecentActivity(window.localStorage).map((item) => item.id)).toEqual([
      "share-created:two"
    ]);
  });

  it("clears recent activity", () => {
    upsertRecentActivity(
      createShareRecentActivityItem({ shareId: "one", title: "One", now: 100 }),
      window.localStorage
    );

    clearRecentActivity(window.localStorage);

    expect(readRecentActivity(window.localStorage)).toEqual([]);
  });

  it("falls back to an untitled label for blank titles", () => {
    expect(
      createShareRecentActivityItem({ shareId: "one", title: "   ", now: 100 }).title
    ).toBe("Untitled markdown");
  });
});
