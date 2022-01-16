import { act, renderHook } from "@testing-library/react-hooks";
import useSearch from "..";

function users() {
  return [
    {
      id: 1,
      name: "miles",
      email: "miles@example.com",
      activity: [
        {
          events: [
            {
              context: "scroll",
            },
          ],
        },
      ],
      interest: {
        name: "trumpet",
        info: {
          special: "solo",
        },
      },
      nested: {
        arr: [
          {
            name: "kind of blue",
          },
          {
            name: "sketches of spain",
          },
          {
            name: "porgy and bess",
          },
        ],
      },
      strings: ["something1", "something2", "something7"],
    },
    {
      id: 2,
      name: "davis",
      email: "davis@example.com",
      activity: [
        {
          events: [
            {
              context: "move",
            },
          ],
        },
      ],
      interest: {
        name: "trumpet",
        info: {
          special: "jam",
        },
      },
      nested: {
        arr: [
          {
            name: "walkin",
          },
          {
            name: "workin",
          },
          {
            name: "relaxin",
          },
        ],
      },
      strings: ["something3", "something4", "something5", "something 6"],
    },
    {
      id: 3,
      name: "bill",
      activity: [
        {
          events: [
            {
              context: "move",
            },
          ],
        },
      ],
      interest: {
        name: "piano",
        info: {
          special: "composing",
        },
      },
      nested: {
        arr: [
          {
            name: "explorations",
          },
          {
            name: "moonbeams",
          },
          {
            name: "sunday at the village vanguard",
          },
        ],
      },
      strings: ["something7", "something4", "something5", "something 6"],
    },
    {
      id: 4,
      name: "evans",
      activity: [
        {
          events: [
            {
              context: "composing",
            },
          ],
        },
      ],
      interest: {
        name: "jazz",
        info: {
          special: "listening",
        },
      },
      nested: {
        arr: [
          {
            name: "waltz for debby",
          },
          {
            name: "portrait of jazz",
          },
          {
            name: "kind of blue",
          },
        ],
      },
      strings: ["something3", "something4", "something8", "something 6"],
    },
  ];
}

describe("Test Suite: useSearch", () => {
  test("returns unfiltered on empty query", () => {
    const usrs = users();
    const { result } = renderHook(() => useSearch(usrs, ["email"]));

    const { filtered } = result.current;

    expect(filtered).toEqual(usrs);
  });
  test("returns filtered on single query", () => {
    const usrs = users();
    const { result } = renderHook(() => useSearch(usrs, ["email"]));

    act(() => result.current.onQueryChange("@example.com"));

    const { filtered } = result.current;

    expect(filtered.length).toEqual(2);
    expect(filtered[0]).toEqual(usrs[0]);
    expect(filtered[1]).toEqual(usrs[1]);
  });
  test("does not consider values in unspecified fields", () => {
    const { result } = renderHook(() => useSearch(users(), ["name"]));

    act(() => result.current.onQueryChange("@example.com"));

    const { filtered } = result.current;

    expect(filtered.length).toEqual(0);
  });
  test("returns filtered on single nested object query", () => {
    const usrs = users();
    const { result } = renderHook(() => useSearch(usrs, ["interest.name"]));

    act(() => result.current.onQueryChange("piano"));

    const { filtered } = result.current;

    expect(filtered.length).toEqual(1);
    expect(filtered[0]).toEqual(usrs[2]);
  });
  test("returns filtered on single nested array query", () => {
    const usrs = users();
    const { result } = renderHook(() =>
      useSearch(usrs, ["activity.n.events.n.context"])
    );

    act(() => result.current.onQueryChange("move"));

    const { filtered } = result.current;

    expect(filtered.length).toEqual(2);
    expect(filtered[0]).toEqual(usrs[1]);
    expect(filtered[1]).toEqual(usrs[2]);
  });
  test("returns filtered on multiple nested queries", () => {
    const usrs = users();
    const { result } = renderHook(() =>
      useSearch(usrs, ["activity.n.events.n.context", "interest.info.special"])
    );

    act(() => result.current.onQueryChange("composing"));

    const { filtered } = result.current;

    expect(filtered.length).toEqual(2);
    expect(filtered[0]).toEqual(usrs[2]);
    expect(filtered[1]).toEqual(usrs[3]);
  });
  test("returns filtered on nested array of objects", () => {
    const usrs = users();
    const { result } = renderHook(() => useSearch(usrs, ["nested.arr.n.name"]));

    act(() => result.current.onQueryChange("kind of blue"));

    const { filtered } = result.current;

    expect(filtered.length).toEqual(2);
    expect(filtered[0]).toEqual(usrs[0]);
    expect(filtered[1]).toEqual(usrs[3]);
  });
  test("returns filtered on nested array of strings with no n", () => {
    const usrs = users();
    const { result } = renderHook(() => useSearch(usrs, ["strings.n"]));

    act(() => result.current.onQueryChange("something7"));

    const { filtered } = result.current;

    expect(filtered.length).toEqual(2);
    expect(filtered[0]).toEqual(usrs[0]);
    expect(filtered[1]).toEqual(usrs[2]);
  });
  test("returns filtered on nested array of strings with n", () => {
    const usrs = users();
    const { result } = renderHook(() =>
      useSearch<typeof usrs>(usrs, ["strings.n"])
    );

    act(() => result.current.onQueryChange("something7"));

    const { filtered } = result.current;

    expect(filtered.length).toEqual(2);
    expect(filtered[0]).toEqual(usrs[0]);
    expect(filtered[1]).toEqual(usrs[2]);
  });
  test("returns filtered and sorted on multiple nested queries", () => {
    const usrs = users();
    const { result } = renderHook(() =>
      useSearch(
        usrs,
        ["activity.n.events.n.context", "interest.info.special"],
        (a, b) => b.id - a.id
      )
    );

    act(() => result.current.onQueryChange("composing"));

    const { filtered } = result.current;

    expect(filtered.length).toEqual(2);
    expect(filtered[0]).toEqual(usrs[3]);
    expect(filtered[1]).toEqual(usrs[2]);
  });
  test("returns filtered on specified predicate function", () => {
    const usrs = users();
    const { result } = renderHook(() =>
      useSearch(
        usrs,
        (query, item) => item.name === query || item.interest.name === query
      )
    );

    act(() => result.current.onQueryChange("piano"));

    const { filtered } = result.current;

    expect(filtered.length).toEqual(1);
    expect(filtered[0]).toEqual(usrs[2]);
  });
});
