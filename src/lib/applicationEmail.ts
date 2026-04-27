export const applicantTypes = ["Driver", "Owner Operator"] as const;

export type ApplicantType = (typeof applicantTypes)[number];

export type ApplicationFormFields = {
  name: string;
  phone: string;
  email: string;
  location: string;
  experience: string;
  equipment: string;
  lanes: string;
  startDate: string;
  message: string;
};

export type BuildApplicationEmailInput = {
  applicantType: ApplicantType;
  fields: ApplicationFormFields;
};

export function getPayLine(applicantType: ApplicantType) {
  return applicantType === "Driver"
    ? "Drivers are paid 30% from gross."
    : "Owner operators are paid 90% from gross.";
}

export function readApplicationFormFields(form: FormData): ApplicationFormFields {
  return {
    name: readFormValue(form, "name") || "Applicant",
    phone: readFormValue(form, "phone"),
    email: readFormValue(form, "email"),
    location: readFormValue(form, "location"),
    experience: readFormValue(form, "experience"),
    equipment: readFormValue(form, "equipment"),
    lanes: readFormValue(form, "lanes"),
    startDate: readFormValue(form, "startDate"),
    message: readFormValue(form, "message"),
  };
}

export function buildApplicationEmail({
  applicantType,
  fields,
}: BuildApplicationEmailInput) {
  const subject = `DM Express ${applicantType} Application - ${fields.name}`;
  const body = [
    `Applicant type: ${applicantType}`,
    `Pay option shown: ${getPayLine(applicantType)}`,
    `Name: ${fields.name}`,
    `Phone: ${fields.phone}`,
    `Email: ${fields.email}`,
    `City / State: ${fields.location}`,
    `CDL experience: ${fields.experience}`,
    `Equipment: ${fields.equipment}`,
    `Preferred lanes: ${fields.lanes}`,
    `Available start date: ${fields.startDate}`,
    "",
    `Message: ${fields.message}`,
  ].join("\n");

  return { subject, body };
}

export function createMailtoHref(to: string, subject: string, body: string) {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function formatFileSize(size: number) {
  if (!Number.isFinite(size) || size < 0) return "0 KB";
  const kb = size / 1024;
  const roundedKb = Math.round(kb);
  if (roundedKb < 1024) return `${Math.max(1, roundedKb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function readFormValue(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
}
