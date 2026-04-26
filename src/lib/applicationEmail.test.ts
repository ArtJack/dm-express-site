import { describe, expect, it } from "vitest";
import {
  applicantTypes,
  buildApplicationEmail,
  createMailtoHref,
  formatFileSize,
  getPayLine,
  readApplicationFormFields,
} from "./applicationEmail";

describe("application email helpers", () => {
  it("uses the correct pay line for each applicant type", () => {
    expect(getPayLine("Driver")).toContain("30%");
    expect(getPayLine("Owner Operator")).toContain("90%");
  });

  it("builds a driver application email body with license file reminders", () => {
    const email = buildApplicationEmail({
      applicantType: "Driver",
      fields: {
        name: "Alex Driver",
        phone: "9165550100",
        email: "alex@example.com",
        location: "Lincoln, CA",
        experience: "3-5 years",
        equipment: "Dry van",
        lanes: "Dedicated lanes",
        startDate: "2026-05-01",
        message: "Ready to start.",
      },
      licenseFrontName: "front.pdf",
      licenseBackName: "back.pdf",
    });

    expect(email.subject).toBe("DM Express Driver Application - Alex Driver");
    expect(email.body).toContain("Applicant type: Driver");
    expect(email.body).toContain("Pay option shown: Drivers are paid 30% from gross.");
    expect(email.body).toContain("License front file selected: front.pdf");
    expect(email.body).toContain("attach the selected driver license front and back files");
  });

  it("encodes mailto subject and body safely", () => {
    const href = createMailtoHref("hello@dmexpress.example.com", "DM Express Application", "Line 1\nLine 2");

    expect(href).toContain("mailto:hello@dmexpress.example.com");
    expect(href).toContain("subject=DM%20Express%20Application");
    expect(href).toContain("body=Line%201%0ALine%202");
  });
});

// EQ — Equivalence Partitioning
// ApplicantType has exactly two valid partitions; getPayLine should be a total function over them.
describe("EQ: getPayLine partitions", () => {
  it("covers every applicantTypes member with a non-empty pay line containing a percentage", () => {
    for (const type of applicantTypes) {
      const line = getPayLine(type);
      expect(line.length).toBeGreaterThan(0);
      expect(line).toMatch(/\d+%/);
    }
  });
});

// EQ — readApplicationFormFields treats string and non-string FormData entries differently
describe("EQ: readApplicationFormFields", () => {
  function makeForm(entries: Record<string, FormDataEntryValue>): FormData {
    const form = new FormData();
    for (const [key, value] of Object.entries(entries)) {
      form.append(key, value);
    }
    return form;
  }

  it("returns empty strings for missing keys", () => {
    const fields = readApplicationFormFields(makeForm({}));
    expect(fields.phone).toBe("");
    expect(fields.email).toBe("");
    expect(fields.message).toBe("");
  });

  it('falls back to "Applicant" only when name is missing or empty', () => {
    expect(readApplicationFormFields(makeForm({})).name).toBe("Applicant");
    expect(readApplicationFormFields(makeForm({ name: "" })).name).toBe("Applicant");
    expect(readApplicationFormFields(makeForm({ name: "Jane" })).name).toBe("Jane");
  });

  it("treats File entries as empty string (non-string partition)", () => {
    const blob = new Blob(["hello"], { type: "text/plain" });
    const form = makeForm({});
    form.append("name", new File([blob], "ignored.txt"));
    expect(readApplicationFormFields(form).name).toBe("Applicant");
  });
});

// BVA — formatFileSize rolls KB into MB precisely at the unit boundary
describe("BVA: formatFileSize unit boundaries", () => {
  it.each([
    [-1, "0 KB"],
    [Number.NaN, "0 KB"],
    [Number.POSITIVE_INFINITY, "0 KB"],
    [0, "1 KB"],
    [1, "1 KB"],
    [1023, "1 KB"],
    [1024, "1 KB"],
    [1024 * 512, "512 KB"],
    [1024 * 1023, "1023 KB"],
    [1024 * 1024 - 1, "1.0 MB"],
    [1024 * 1024, "1.0 MB"],
    [1024 * 1024 + 1, "1.0 MB"],
    [1024 * 1024 * 5, "5.0 MB"],
    [1024 * 1024 * 5.45, "5.5 MB"],
  ])("formatFileSize(%i) -> %s", (input, expected) => {
    expect(formatFileSize(input)).toBe(expected);
  });
});

// BVA — buildApplicationEmail handles empty and very long input boundaries
describe("BVA: buildApplicationEmail field length boundaries", () => {
  const baseFields = {
    name: "Tester",
    phone: "",
    email: "",
    location: "",
    experience: "",
    equipment: "",
    lanes: "",
    startDate: "",
    message: "",
  };

  it("renders body even when every optional field is empty", () => {
    const { subject, body } = buildApplicationEmail({
      applicantType: "Driver",
      fields: baseFields,
      licenseFrontName: "f.png",
      licenseBackName: "b.png",
    });
    expect(subject).toBe("DM Express Driver Application - Tester");
    expect(body).toContain("Phone: ");
    expect(body).toContain("Email: ");
    expect(body).toContain("Available start date: ");
  });

  it("preserves a very long message verbatim", () => {
    const longMessage = "x".repeat(10_000);
    const { body } = buildApplicationEmail({
      applicantType: "Owner Operator",
      fields: { ...baseFields, message: longMessage },
      licenseFrontName: "f.png",
      licenseBackName: "b.png",
    });
    expect(body).toContain(longMessage);
  });

  it("does not crash on multi-line message with newlines and tabs", () => {
    const tricky = "Line A\nLine B\tcol2\r\nLine C";
    const { body } = buildApplicationEmail({
      applicantType: "Driver",
      fields: { ...baseFields, message: tricky },
      licenseFrontName: "f.png",
      licenseBackName: "b.png",
    });
    expect(body).toContain(tricky);
  });
});

// DT — Decision table for the email subject and pay line
describe("DT: subject and pay line by applicantType", () => {
  const fields = {
    name: "QA",
    phone: "",
    email: "",
    location: "",
    experience: "",
    equipment: "",
    lanes: "",
    startDate: "",
    message: "",
  };
  it.each([
    ["Driver" as const, "DM Express Driver Application - QA", "Drivers are paid 30%"],
    ["Owner Operator" as const, "DM Express Owner Operator Application - QA", "Owner operators are paid 90%"],
  ])("applicantType=%s -> subject=%s, pay=%s", (type, expectedSubject, expectedPay) => {
    const { subject, body } = buildApplicationEmail({
      applicantType: type,
      fields,
      licenseFrontName: "f",
      licenseBackName: "b",
    });
    expect(subject).toBe(expectedSubject);
    expect(body).toContain(expectedPay);
  });
});

// STT — createMailtoHref state transitions on encoding
describe("STT: createMailtoHref input transitions", () => {
  it("encodes spaces, ampersands, and slashes in subject and body", () => {
    const href = createMailtoHref("a@b.com", "Hello & welcome / hi", "first&second/third");
    expect(href).toContain("subject=Hello%20%26%20welcome%20%2F%20hi");
    expect(href).toContain("body=first%26second%2Fthird");
  });

  it("preserves a raw @ in the recipient address", () => {
    const href = createMailtoHref("hello@dmexpress.example.com", "s", "b");
    expect(href.startsWith("mailto:hello@dmexpress.example.com?")).toBe(true);
  });

  it("survives empty subject and body without dropping required separators", () => {
    const href = createMailtoHref("a@b.com", "", "");
    expect(href).toBe("mailto:a@b.com?subject=&body=");
  });
});
