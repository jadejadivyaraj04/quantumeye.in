import { createContext, useContext, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2, Upload, X } from "lucide-react";
import type { Field, SectionSpec } from "./schema";
import type { Uploaded } from "./upload";

/**
 * Uploading needs the token and the record being edited, neither of which the
 * field components should know about - so the one function that does lives in
 * context, supplied by the dashboard.
 */
export interface UploadContext {
  upload: (file: File, hint: string, wide: boolean) => Promise<Uploaded>;
}

const Uploads = createContext<UploadContext | null>(null);

export function UploadProvider({
  value,
  children,
}: {
  value: UploadContext;
  children: React.ReactNode;
}) {
  return <Uploads.Provider value={value}>{children}</Uploads.Provider>;
}

/**
 * Every form in the dashboard, generated from the section specs.
 *
 * One editor rather than nine hand-written ones: a field added to the schema
 * appears here immediately, and no section can quietly fall behind the data it
 * is supposed to edit.
 */

type Rec = Record<string, unknown>;

const labelCls = "label-mono mb-1.5 block text-ink-faint";
const inputCls =
  "h-11 w-full rounded-lg border border-rule bg-ground px-3 text-[0.92rem] outline-none focus:border-ink";
const areaCls =
  "w-full rounded-lg border border-rule bg-ground p-3 text-[0.92rem] leading-relaxed outline-none focus:border-ink";
const helpCls = "mt-1.5 text-[0.78rem] leading-relaxed text-ink-faint";
const ghostBtn =
  "label-mono flex h-9 items-center gap-1.5 rounded-full border border-rule px-3 transition-colors hover:border-ink";

/* ────────────────────────────────────────────────────────── fields ──── */

function FieldInput({
  field,
  value,
  onChange,
  hint = "capture",
  wide = false,
}: {
  field: Field;
  value: unknown;
  onChange: (next: unknown) => void;
  /** Names uploaded files after the record they belong to. */
  hint?: string;
  /** Browser captures keep more width than phone screens. */
  wide?: boolean;
}) {
  switch (field.kind) {
    case "text":
      return (
        <input
          className={inputCls}
          value={(value as string | null) ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
        />
      );

    case "textarea":
      return (
        <textarea
          className={areaCls}
          rows={field.rows ?? 3}
          value={(value as string | null) ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
        />
      );

    case "number":
      return (
        <input
          type="number"
          className={`${inputCls} tnum`}
          value={value === null || value === undefined ? "" : String(value)}
          onChange={(e) =>
            onChange(e.target.value === "" ? undefined : Number(e.target.value))
          }
        />
      );

    case "bool":
      return (
        <label className="flex h-11 items-center gap-2.5 text-[0.92rem] text-ink-soft">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 accent-[var(--c-accent)]"
          />
          {field.label}
        </label>
      );

    case "select":
      return (
        <select
          className={inputCls}
          value={(value as string) ?? field.options[0]}
          onChange={(e) => onChange(e.target.value)}
        >
          {field.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );

    /* One line per entry: it is faster to edit prose this way than through a
       row of inputs, and it survives paste from anywhere. */
    case "list":
      return (
        <textarea
          className={areaCls}
          rows={Math.max(3, ((value as string[]) ?? []).length + 1)}
          placeholder={field.placeholder ?? "One per line"}
          value={((value as string[]) ?? []).join("\n")}
          onChange={(e) =>
            onChange(
              e.target.value
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean),
            )
          }
        />
      );

    case "media":
      return (
        <MediaField
          value={(value as Shot[]) ?? []}
          onChange={onChange}
          hint={hint}
          wide={wide}
        />
      );

    case "links":
      return <LinksField value={(value as Rec) ?? {}} onChange={onChange} />;

    default:
      return null;
  }
}

interface Shot {
  src: string;
  alt: string;
}

function MediaField({
  value,
  onChange,
  hint,
  wide,
}: {
  value: Shot[];
  onChange: (next: Shot[]) => void;
  hint: string;
  wide: boolean;
}) {
  const uploads = useContext(Uploads);
  const picker = useRef<HTMLInputElement>(null);
  const [working, setWorking] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const set = (i: number, patch: Partial<Shot>) =>
    onChange(value.map((s, j) => (i === j ? { ...s, ...patch } : s)));

  const move = (i: number, by: number) => {
    const next = [...value];
    const target = i + by;
    if (target < 0 || target >= next.length) return;
    [next[i], next[target]] = [next[target], next[i]];
    onChange(next);
  };

  const pick = async (files: FileList | null) => {
    if (!files?.length || !uploads) return;
    setFailed(null);
    setSaved(null);

    const added: Shot[] = [];
    let savedBytes = 0;

    for (const file of Array.from(files)) {
      setWorking(file.name);
      try {
        const result = await uploads.upload(file, hint, wide);
        savedBytes += result.originalBytes - result.bytes;
        // Alt text is left empty on purpose: publishing refuses a capture
        // without it, which is the only reliable moment to ask for one.
        added.push({ src: result.url, alt: "" });
      } catch (err) {
        setFailed((err as Error).message);
        break;
      }
    }

    setWorking(null);
    if (added.length) {
      onChange([...value, ...added]);
      setSaved(
        `${added.length} added, ${(savedBytes / 1024).toFixed(0)}KB smaller than the originals.`,
      );
    }
    if (picker.current) picker.current.value = "";
  };

  return (
    <div className="space-y-3">
      {value.map((shot, i) => (
        <div key={i} className="rounded-lg border border-rule p-3">
          <div className="flex gap-3">
            {shot.src && (
              <img
                src={shot.src}
                alt=""
                className="h-16 w-16 shrink-0 rounded border border-rule object-cover object-top"
              />
            )}
            <div className="min-w-0 flex-1 space-y-2">
              <input
                className={`${inputCls} font-mono text-[0.8rem]`}
                placeholder="/work/example.jpg"
                value={shot.src}
                onChange={(e) => set(i, { src: e.target.value })}
              />
              <input
                className={`${inputCls} ${shot.alt.trim() ? "" : "border-accent/50"}`}
                placeholder="Alt text — describe what the screen shows"
                value={shot.alt}
                onChange={(e) => set(i, { alt: e.target.value })}
              />
            </div>
            <div className="flex shrink-0 flex-col gap-1">
              <button type="button" onClick={() => move(i, -1)} aria-label="Move up" className="rounded p-1 text-ink-faint hover:text-ink">
                <ChevronUp size={15} />
              </button>
              <button type="button" onClick={() => move(i, 1)} aria-label="Move down" className="rounded p-1 text-ink-faint hover:text-ink">
                <ChevronDown size={15} />
              </button>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                aria-label="Remove capture"
                className="rounded p-1 text-ink-faint hover:text-accent-text"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </div>
      ))}

      <input
        ref={picker}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => void pick(e.target.files)}
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => picker.current?.click()}
          disabled={working !== null}
          className="label-mono flex h-9 items-center gap-1.5 rounded-full bg-ink px-3.5 text-ground disabled:opacity-50"
        >
          <Upload size={13} strokeWidth={2.4} />
          {working ? `Uploading ${working}…` : "Upload from this Mac"}
        </button>
        <button
          type="button"
          className={ghostBtn}
          onClick={() => onChange([...value, { src: "", alt: "" }])}
        >
          <Plus size={13} strokeWidth={2.4} />
          Add by path
        </button>
      </div>

      {failed && (
        <p className="text-[0.82rem] leading-relaxed text-accent-text">{failed}</p>
      )}
      {saved && <p className={helpCls}>{saved}</p>}

      <p className={helpCls}>
        Pick a screenshot and it is resized to {wide ? "1100" : "600"}px wide,
        encoded as JPEG and committed straight away. The first capture is the
        one used on the card, and every capture needs alt text before the
        content can be published.
      </p>
    </div>
  );
}

const LINK_KEYS = [
  { key: "store", label: "App Store" },
  { key: "play", label: "Google Play" },
  { key: "site", label: "Website" },
  { key: "repo", label: "Repository" },
];

function LinksField({
  value,
  onChange,
}: {
  value: Rec;
  onChange: (next: Rec) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {LINK_KEYS.map(({ key, label }) => (
        <div key={key}>
          <span className={labelCls}>{label}</span>
          <input
            className={`${inputCls} font-mono text-[0.8rem]`}
            value={(value[key] as string) ?? ""}
            onChange={(e) => {
              const next = { ...value };
              if (e.target.value) next[key] = e.target.value;
              else delete next[key];
              onChange(next);
            }}
          />
        </div>
      ))}
    </div>
  );
}

/** A list of small objects inside a record - capability items. */
function ItemsField({
  field,
  value,
  onChange,
}: {
  field: Extract<Field, { kind: "items" }>;
  value: Rec[];
  onChange: (next: Rec[]) => void;
}) {
  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div
          key={i}
          className="flex flex-wrap items-end gap-3 rounded-lg border border-rule p-3"
        >
          {field.fields.map((f) => (
            <div key={f.key} className={f.kind === "number" ? "w-24" : "min-w-[10rem] flex-1"}>
              <span className={labelCls}>{f.label}</span>
              <FieldInput
                field={f}
                value={item[f.key]}
                onChange={(next) =>
                  onChange(
                    value.map((it, j) =>
                      i === j
                        ? next === undefined || next === null || next === ""
                          ? Object.fromEntries(
                              Object.entries(it).filter(([k]) => k !== f.key),
                            )
                          : { ...it, [f.key]: next }
                        : it,
                    ),
                  )
                }
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            aria-label="Remove"
            className="mb-1 rounded p-2 text-ink-faint hover:text-accent-text"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      <button type="button" className={ghostBtn} onClick={() => onChange([...value, {}])}>
        <Plus size={13} strokeWidth={2.4} />
        Add
      </button>
    </div>
  );
}

/* ───────────────────────────────────────────────────────── records ──── */

export function RecordForm({
  fields,
  record,
  onChange,
}: {
  fields: Field[];
  record: Rec;
  onChange: (next: Rec) => void;
}) {
  const set = (key: string, next: unknown) => {
    const updated = { ...record };
    if (next === undefined) delete updated[key];
    else updated[key] = next;
    onChange(updated);
  };

  // Uploaded files are named after the record, and browser captures keep more
  // width than phone screens.
  const hint = String(record.slug ?? record.title ?? "capture");
  const wide = record.mediaLayout === "wide";

  return (
    <div className="space-y-5">
      {fields.map((field) => {
        if (field.kind === "group") {
          return (
            <fieldset key={field.key} className="rounded-lg border border-rule p-4">
              <legend className="label-mono px-1 text-ink-faint">{field.label}</legend>
              <div className="space-y-4">
                <RecordForm
                  fields={field.fields}
                  record={(record[field.key] as Rec) ?? {}}
                  onChange={(next) => set(field.key, next)}
                />
              </div>
            </fieldset>
          );
        }

        if (field.kind === "items") {
          return (
            <div key={field.key}>
              <span className={labelCls}>{field.label}</span>
              <ItemsField
                field={field}
                value={(record[field.key] as Rec[]) ?? []}
                onChange={(next) => set(field.key, next)}
              />
              {field.help && <p className={helpCls}>{field.help}</p>}
            </div>
          );
        }

        return (
          <div key={field.key}>
            {field.kind !== "bool" && (
              <label className={labelCls}>
                {field.label}
                {"required" in field && field.required && (
                  <span className="ml-1 text-accent-text">*</span>
                )}
              </label>
            )}
            <FieldInput
              field={field}
              value={record[field.key]}
              onChange={(next) => set(field.key, next)}
              hint={hint}
              wide={wide}
            />
            {"help" in field && field.help && <p className={helpCls}>{field.help}</p>}
          </div>
        );
      })}
    </div>
  );
}

/** A whole section: one form, or a list with add, reorder and delete. */
export function SectionEditor({
  spec,
  value,
  onChange,
}: {
  spec: SectionSpec;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  if (spec.shape === "single") {
    return (
      <RecordForm
        fields={spec.fields}
        record={(value as Rec) ?? {}}
        onChange={onChange}
      />
    );
  }

  const records = (value as Rec[]) ?? [];

  const move = (i: number, by: number) => {
    const target = i + by;
    if (target < 0 || target >= records.length) return;
    const next = [...records];
    [next[i], next[target]] = [next[target], next[i]];
    onChange(next);
    setOpen(open === i ? target : open === target ? i : open);
  };

  return (
    <div className="space-y-3">
      {records.map((record, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="rounded-xl border border-rule">
            <div className="flex items-center gap-2 p-3">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="min-w-0 flex-1 text-left"
              >
                <span className="block truncate text-[0.95rem]">
                  {String(record[spec.titleKey ?? "title"] ?? "Untitled")}
                </span>
                <span className="block truncate text-[0.8rem] text-ink-faint">
                  {String(record[spec.subtitleKey ?? ""] ?? "")}
                </span>
              </button>

              <button type="button" onClick={() => move(i, -1)} aria-label="Move up" className="rounded p-1.5 text-ink-faint hover:text-ink">
                <ChevronUp size={15} />
              </button>
              <button type="button" onClick={() => move(i, 1)} aria-label="Move down" className="rounded p-1.5 text-ink-faint hover:text-ink">
                <ChevronDown size={15} />
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(i)}
                aria-label="Delete"
                className="rounded p-1.5 text-ink-faint hover:text-accent-text"
              >
                <Trash2 size={15} />
              </button>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-label={isOpen ? "Collapse" : "Expand"}
                className="rounded p-1.5 text-ink-faint hover:text-ink"
              >
                {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
            </div>

            {confirmDelete === i && (
              <div className="flex flex-wrap items-center gap-3 border-t border-rule bg-surface/60 px-3 py-2.5">
                <span className="text-[0.85rem] text-ink-soft">
                  Delete “{String(record[spec.titleKey ?? "title"] ?? "this")}”? It
                  stays recoverable in the repository history.
                </span>
                <button
                  type="button"
                  className="label-mono ml-auto rounded-full bg-ink px-3 py-1.5 text-ground"
                  onClick={() => {
                    onChange(records.filter((_, j) => j !== i));
                    setConfirmDelete(null);
                    setOpen(null);
                  }}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className={ghostBtn}
                  onClick={() => setConfirmDelete(null)}
                >
                  Keep
                </button>
              </div>
            )}

            {isOpen && (
              <div className="border-t border-rule p-4">
                <RecordForm
                  fields={spec.fields}
                  record={record}
                  onChange={(next) =>
                    onChange(records.map((r, j) => (i === j ? next : r)))
                  }
                />
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        className={ghostBtn}
        onClick={() => {
          onChange([...records, spec.blank?.() ?? {}]);
          setOpen(records.length);
        }}
      >
        <Plus size={13} strokeWidth={2.4} />
        Add {spec.label.replace(/s$/, "").toLowerCase()}
      </button>
    </div>
  );
}
