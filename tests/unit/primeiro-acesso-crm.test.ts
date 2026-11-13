import { beforeEach, describe, expect, it, vi } from "vitest";

const { redirect, loadAuthUser, resolveActiveOrg, acessoFoiRevogado } = vi.hoisted(() => ({
  redirect: vi.fn((destino: string): never => { throw new Error(destino); }),
  loadAuthUser: vi.fn(),
  resolveActiveOrg: vi.fn(),
  acessoFoiRevogado: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/lib/auth/server", () => ({ loadAuthUser, resolveActiveOrg }));
vi.mock("@/lib/auth/vinculo-revogado", () => ({ acessoFoiRevogado }));

import AppLayout from "@/app/app/layout";

describe("entrada no CRM sem organização", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    resolveActiveOrg.mockResolvedValue(null);
    loadAuthUser.mockResolvedValue({ id: "usuario", is_platform_admin: false, support: null });
  });

  it("leva quem nunca teve organização ao primeiro acesso, não a um menu vazio", async () => {
    acessoFoiRevogado.mockResolvedValue(false);
    await expect(AppLayout({ children: null })).rejects.toThrow("/get-started");
    expect(redirect).toHaveBeenCalledWith("/get-started");
  });

  it("informa a revogação sem oferecer a criação de outro espaço", async () => {
    acessoFoiRevogado.mockResolvedValue(true);
    await expect(AppLayout({ children: null })).rejects.toThrow("/acesso-revogado");
    expect(redirect).toHaveBeenCalledWith("/acesso-revogado");
  });
});
