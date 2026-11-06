"use client";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="label bg-crimson px-4 py-2 hover:opacity-85">
      Download / Print
    </button>
  );
}
