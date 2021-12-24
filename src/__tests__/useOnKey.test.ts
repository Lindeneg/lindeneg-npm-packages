import { act, renderHook } from "@testing-library/react-hooks";
import useOnKey from "../useOnKey";

describe("Test Suite: useOnKey", () => {
  test("uses `keydown` as default type", () => {
    const fn = jest.fn();
    renderHook(() => useOnKey("k", fn));

    expect(fn).toHaveBeenCalledTimes(0);

    act(() => {
      const e = new KeyboardEvent("keydown", { key: "k" });
      dispatchEvent(e);
    });

    expect(fn).toHaveBeenCalledTimes(1);
  });
  test("handles specified `keydown` type", () => {
    const fn = jest.fn();
    renderHook(() => useOnKey("k", fn, "keydown"));

    expect(fn).toHaveBeenCalledTimes(0);

    act(() => {
      const e = new KeyboardEvent("keydown", { key: "k" });
      dispatchEvent(e);
    });

    expect(fn).toHaveBeenCalledTimes(1);
  });
  test("handles specified `keyup` type", () => {
    const fn = jest.fn();
    renderHook(() => useOnKey("k", fn, "keyup"));

    expect(fn).toHaveBeenCalledTimes(0);

    act(() => {
      const e = new KeyboardEvent("keyup", { key: "k" });
      dispatchEvent(e);
    });

    expect(fn).toHaveBeenCalledTimes(1);
  });
  test("handles specified `keypress` type", () => {
    const fn = jest.fn();
    renderHook(() => useOnKey("k", fn, "keypress"));

    expect(fn).toHaveBeenCalledTimes(0);

    act(() => {
      const e = new KeyboardEvent("keypress", { key: "k" });
      dispatchEvent(e);
    });

    expect(fn).toHaveBeenCalledTimes(1);
  });
  test("does not confuse types", () => {
    const fn = jest.fn();
    renderHook(() => useOnKey("k", fn, "keyup"));

    act(() => {
      const e = new KeyboardEvent("keydown", { key: "k" });
      dispatchEvent(e);
    });

    expect(fn).toHaveBeenCalledTimes(0);
  });
  test("callback receives event arg", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let arg: any = null;
    const fn = jest.fn((e) => {
      arg = e;
    });
    renderHook(() => useOnKey("k", fn, "keyup"));

    act(() => {
      const e = new KeyboardEvent("keyup", { key: "k" });
      dispatchEvent(e);
    });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(arg instanceof KeyboardEvent).toBe(true);
    expect(arg.type).toBe("keyup");
  });
});
