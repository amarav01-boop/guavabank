import { describe, expect, it } from "vitest";
import { SimulatedKycProvider } from "./simulated-provider.js";
import type { KycInput } from "./provider.js";

const validInput: KycInput = {
  name: "Maria da Silva",
  document: "11144477735",
  birthDate: "1990-05-20",
  evaluationDate: "2026-11-02",
  declaredDocumentName: "Maria da Silva",
  documents: [
    { type: "ID_FRONT", fileName: "id-front.png", contentHash: "hash-front", mimeType: "image/png", sizeBytes: 1000 },
    { type: "SELFIE", fileName: "selfie.png", contentHash: "hash-selfie", mimeType: "image/png", sizeBytes: 1000 }
  ]
};

describe("SimulatedKycProvider", () => {
  const provider = new SimulatedKycProvider();

  it("aprova um cadastro sintético válido", async () => {
    await expect(provider.evaluate(validInput)).resolves.toMatchObject({ status: "APPROVED" });
  });

  it("rejeita dados incompletos", async () => {
    await expect(provider.evaluate({ ...validInput, name: "A" })).resolves.toMatchObject({
      status: "REJECTED",
      reason: "One or more KYC checks failed"
    });
  });

  it("manda divergência de nome para revisão manual", async () => {
    await expect(
      provider.evaluate({ ...validInput, declaredDocumentName: "Maria Souza" })
    ).resolves.toMatchObject({ status: "MANUAL_REVIEW" });
  });

  it("rejeita o documento sintético explicitamente inválido", async () => {
    await expect(provider.evaluate({ ...validInput, document: "00000000000" })).resolves.toMatchObject({
      status: "REJECTED"
    });
  });

  it("rejeita documentos não suportados", async () => {
    await expect(provider.evaluate({ ...validInput, document: "11144477736" })).resolves.toMatchObject({
      status: "REJECTED"
    });
  });

  it("mantém a idade determinística na data de aniversário", async () => {
    const input = { ...validInput, birthDate: "2008-11-03" };
    const beforeBirthday = await provider.evaluate({ ...input, evaluationDate: "2026-11-02" });
    const onBirthday = await provider.evaluate({ ...input, evaluationDate: "2026-11-03" });

    expect(beforeBirthday.status).toBe("REJECTED");
    expect(onBirthday.status).toBe("APPROVED");
  });

  it("produz o mesmo resultado para o mesmo input", async () => {
    const first = await provider.evaluate(validInput);
    const second = await provider.evaluate(validInput);
    expect(second).toEqual(first);
  });
});
