import type {
  KycCheckResult,
  KycInput,
  KycProvider,
  KycResult
} from "./provider.js";

const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;
const SYNTHETIC_APPROVED_DOCUMENT = "11144477735";
const SYNTHETIC_REJECTED_DOCUMENT = "00000000000";
const SYNTHETIC_REVIEW_DOCUMENT = "22233344456";

function isValidDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function ageFromBirthDate(value: string, evaluationDate: string): number {
  const birthDate = new Date(`${value}T00:00:00.000Z`);
  const today = new Date(`${evaluationDate}T00:00:00.000Z`);
  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  const birthdayNotReached =
    today.getUTCMonth() < birthDate.getUTCMonth() ||
    (today.getUTCMonth() === birthDate.getUTCMonth() &&
      today.getUTCDate() < birthDate.getUTCDate());

  if (birthdayNotReached) age -= 1;
  return age;
}

function hasDocument(input: KycInput, type: KycInput["documents"][number]["type"]): boolean {
  return input.documents.some((document) => document.type === type);
}

export class SimulatedKycProvider implements KycProvider {
  async evaluate(input: KycInput): Promise<KycResult> {
    const checks: KycCheckResult[] = [];

    const hasRequiredData =
      input.name.trim().length >= 3 &&
      input.document.trim().length > 0 &&
      isValidDate(input.birthDate);
    checks.push({
      type: "DATA_COMPLETENESS",
      status: hasRequiredData ? "PASSED" : "FAILED",
      reasonCode: hasRequiredData ? undefined : "MISSING_OR_INVALID_DATA"
    });

    const documentsAreValid = input.documents.every(
      (document) =>
        document.fileName.trim().length > 0 &&
        document.contentHash.trim().length > 0 &&
        document.mimeType.startsWith("image/") &&
        document.sizeBytes > 0 &&
        document.sizeBytes <= MAX_DOCUMENT_SIZE_BYTES
    );
    checks.push({
      type: "DOCUMENT_METADATA",
      status: documentsAreValid ? "PASSED" : "FAILED",
      reasonCode: documentsAreValid ? undefined : "INVALID_DOCUMENT_METADATA"
    });

    const hasIdentityDocuments = hasDocument(input, "ID_FRONT") && hasDocument(input, "SELFIE");
    checks.push({
      type: "SYNTHETIC_DOCUMENT",
      status: hasIdentityDocuments ? "PASSED" : "FAILED",
      reasonCode: hasIdentityDocuments ? undefined : "IDENTITY_DOCUMENTS_REQUIRED"
    });

    const isAdult =
      isValidDate(input.birthDate) &&
      isValidDate(input.evaluationDate) &&
      ageFromBirthDate(input.birthDate, input.evaluationDate) >= 18;
    checks.push({
      type: "AGE",
      status: isAdult ? "PASSED" : "FAILED",
      reasonCode: isAdult ? undefined : "CUSTOMER_MUST_BE_ADULT"
    });

    const nameMatches =
      !input.declaredDocumentName ||
      input.declaredDocumentName.trim().toLocaleLowerCase() === input.name.trim().toLocaleLowerCase();
    checks.push({
      type: "NAME_MATCH",
      status: nameMatches ? "PASSED" : "REVIEW",
      reasonCode: nameMatches ? undefined : "NAME_REQUIRES_MANUAL_REVIEW"
    });

    if (input.document === SYNTHETIC_REJECTED_DOCUMENT) {
      checks.push({ type: "SYNTHETIC_DOCUMENT", status: "FAILED", reasonCode: "DOCUMENT_REJECTED" });
    } else if (input.document === SYNTHETIC_REVIEW_DOCUMENT) {
      checks.push({ type: "SYNTHETIC_DOCUMENT", status: "REVIEW", reasonCode: "DOCUMENT_REQUIRES_REVIEW" });
    } else if (input.document !== SYNTHETIC_APPROVED_DOCUMENT) {
      checks.push({ type: "SYNTHETIC_DOCUMENT", status: "FAILED", reasonCode: "UNSUPPORTED_DOCUMENT" });
    }

    if (checks.some((check) => check.status === "FAILED")) {
      return { status: "REJECTED", checks, reason: "One or more KYC checks failed" };
    }

    if (checks.some((check) => check.status === "REVIEW")) {
      return { status: "MANUAL_REVIEW", checks, reason: "One or more KYC checks require manual review" };
    }

    return { status: "APPROVED", checks };
  }
}
