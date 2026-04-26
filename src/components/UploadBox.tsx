import { FileCheck2, Upload } from "lucide-react";
import { formatFileSize } from "../lib/applicationEmail";

type UploadBoxProps = {
  id: string;
  label: string;
  file: File | null;
  onChange: (fileList: FileList | null) => void;
};

export function UploadBox({ id, label, file, onChange }: UploadBoxProps) {
  return (
    <label className={`upload-box ${file ? "has-file" : ""}`} htmlFor={id}>
      <input
        id={id}
        name={id}
        type="file"
        accept="image/*,.pdf"
        aria-required="true"
        onChange={(event) => onChange(event.currentTarget.files)}
      />
      <span className="upload-icon" aria-hidden="true">
        {file ? <FileCheck2 size={24} /> : <Upload size={24} />}
      </span>
      <span>
        <strong>{label}</strong>
        <em>{file ? `${file.name} • ${formatFileSize(file.size)}` : "Upload image or PDF"}</em>
      </span>
    </label>
  );
}
