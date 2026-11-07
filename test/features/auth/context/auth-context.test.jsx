import { act, render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider } from "../../../../src/features/auth/context/AuthProvider";
import { useAuth } from "../../../../src/features/auth/context/useAuth";

function fakeApi() {
  let listener;
  const unsubscribe = vi.fn();
  return {
    api: {
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthChange: vi.fn((callback) => {
        listener = callback;
        return unsubscribe;
      }),
    },
    emit: (user) => act(() => listener(user)),
    unsubscribe,
  };
}

function Probe() {
  const { user, loading } = useAuth();
  return <p>{loading ? "loading" : (user?.email ?? "anonymous")}</p>;
}

describe("AuthProvider", () => {
  it("starts loading and exposes the user once Firebase answers", () => {
    const { api, emit } = fakeApi();
    render(
      <AuthProvider api={api}>
        <Probe />
      </AuthProvider>,
    );
    expect(screen.getByText("loading")).toBeInTheDocument();
    emit({ uid: "u1", email: "a@b.co" });
    expect(screen.getByText("a@b.co")).toBeInTheDocument();
    emit(null);
    expect(screen.getByText("anonymous")).toBeInTheDocument();
  });

  it("exposes the api operations", () => {
    const { api } = fakeApi();
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider api={api}>{children}</AuthProvider>,
    });
    expect(result.current.signIn).toBe(api.signIn);
    expect(result.current.signUp).toBe(api.signUp);
    expect(result.current.signOut).toBe(api.signOut);
  });

  it("stops listening when it unmounts", () => {
    const { api, unsubscribe } = fakeApi();
    const { unmount } = render(
      <AuthProvider api={api}>
        <Probe />
      </AuthProvider>,
    );
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it("uses the real authApi by default (anonymous without Firebase config)", async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    expect(await screen.findByText("anonymous")).toBeInTheDocument();
  });
});

describe("useAuth", () => {
  it("fails outside an AuthProvider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow(
      "useAuth must be used inside an AuthProvider",
    );
  });
});
