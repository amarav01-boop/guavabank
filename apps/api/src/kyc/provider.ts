export type KycProviderStatus = "APPROVED" | "REJECTED" | "MANUAL_REVIEW";

export type KycCheckStatus = "PASSED" | "FAILED" | "REVIEW";

export type KycCheckResult = {
  type: string;
  status: KycCheckStatus;
  reasonCode?: string;
};

export type KycDocumentInput = {
  type: "ID_FRONT" | "ID_BACK" | "SELFIE" | "PROOF_OF_ADDRESS";
  fileName: string;
  contentHash: string;
  mimeType: string;
  sizeBytes: number;
};

export type KycInput = {
  name: string;
  document: string;
  birthDate: string;
  evaluationDate: string;
  declaredDocumentName?: string;
  documents: KycDocumentInput[];
};

export type KycResult = {
  status: KycProviderStatus;
  checks: KycCheckResult[];
  reason?: string;
};

export interface KycProvider {
  evaluate(input: KycInput): Promise<KycResult>;
}
