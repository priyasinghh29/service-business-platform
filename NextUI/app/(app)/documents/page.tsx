"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "@/lib/api-client";

interface VaultFile {
  id: number;
  name: string;
  folder: string;
  file_type: string | null;
  size: string | null;
  uploaded_by: string | null;
  uploaded_on: string | null;
  status: string;
  due_at: string | null;
  booking_id: number | null;
  download_url: string | null;
  has_file: boolean;
}

interface VaultPayload {
  storage: {
    used_bytes: number;
    plan_bytes: number;
    used_label: string;
    plan_label: string;
    used_percent: number;
  };
  folders: Array<{ name: string; count: number }>;
  pending_requests: VaultFile[];
  files: VaultFile[];
  all_files: VaultFile[];
  activity: Array<{ id: string; actor: string; action: string; timestamp: string }>;
  bookings: Array<{ id: number; label: string }>;
}

type ModalMode = "upload" | "folder" | "request" | "share" | null;

export default function DocumentsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const fulfillRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<VaultPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionOk, setActionOk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [modal, setModal] = useState<ModalMode>(null);

  const [uploadFolder, setUploadFolder] = useState("General");
  const [uploadBookingId, setUploadBookingId] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const [folderName, setFolderName] = useState("");
  const [requestName, setRequestName] = useState("");
  const [requestFolder, setRequestFolder] = useState("General");
  const [requestDue, setRequestDue] = useState("");
  const [fulfillId, setFulfillId] = useState<number | null>(null);

  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareDocName, setShareDocName] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/documents/vault");
      const payload = (response.data?.data ?? response.data) as VaultPayload;
      setData(payload);
    } catch (err) {
      setError(
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ||
          (err as { message?: string })?.message ||
          "Failed to load documents"
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const folderOptions = useMemo(() => {
    const names = new Set<string>(["General"]);
    data?.folders.forEach((f) => names.add(f.name));
    return Array.from(names).sort();
  }, [data?.folders]);

  const visibleFiles = useMemo(() => {
    const list = showAll ? data?.all_files ?? [] : data?.files ?? [];
    if (!selectedFolder) return list;
    return list.filter((f) => f.folder === selectedFolder);
  }, [data, selectedFolder, showAll]);

  const flash = (ok?: string, err?: string) => {
    setActionOk(ok ?? null);
    setActionError(err ?? null);
  };

  const doUpload = async (file: File, requestId?: number | null, folder?: string) => {
    setBusy(true);
    flash();
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", folder || uploadFolder || "General");
      if (uploadBookingId) form.append("booking_id", uploadBookingId);
      if (requestId) form.append("request_id", String(requestId));

      await apiClient.post("/documents", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setModal(null);
      setUploadFile(null);
      setFulfillId(null);
      flash(requestId ? "Request fulfilled" : "File uploaded");
      await load();
    } catch (err) {
      flash(
        undefined,
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Upload failed"
      );
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
      if (fulfillRef.current) fulfillRef.current.value = "";
    }
  };

  const createFolder = async () => {
    if (!folderName.trim()) return;
    setBusy(true);
    flash();
    try {
      await apiClient.post("/documents/folders", { name: folderName.trim() });
      setModal(null);
      setFolderName("");
      setSelectedFolder(folderName.trim());
      flash("Folder created");
      await load();
    } catch (err) {
      flash(
        undefined,
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Could not create folder"
      );
    } finally {
      setBusy(false);
    }
  };

  const createRequest = async () => {
    if (!requestName.trim()) return;
    setBusy(true);
    flash();
    try {
      await apiClient.post("/documents/requests", {
        name: requestName.trim(),
        folder: requestFolder || "General",
        due_at: requestDue || undefined,
        booking_id: uploadBookingId ? Number(uploadBookingId) : undefined,
      });
      setModal(null);
      setRequestName("");
      setRequestDue("");
      flash("Document request created");
      await load();
    } catch (err) {
      flash(
        undefined,
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Could not create request"
      );
    } finally {
      setBusy(false);
    }
  };

  const downloadFile = async (doc: VaultFile) => {
    if (!doc.has_file) {
      flash(undefined, "No file available to download");
      return;
    }
    setBusy(true);
    flash();
    try {
      const response = await apiClient.get(`/documents/${doc.id}/download`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.name;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      flash(undefined, "Download failed");
    } finally {
      setBusy(false);
    }
  };

  const deleteFile = async (doc: VaultFile) => {
    if (!window.confirm(`Delete “${doc.name}”?`)) return;
    setBusy(true);
    flash();
    try {
      await apiClient.delete(`/documents/${doc.id}`);
      flash("Document deleted");
      await load();
    } catch (err) {
      flash(
        undefined,
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Delete failed"
      );
    } finally {
      setBusy(false);
    }
  };

  const shareFile = async (doc: VaultFile) => {
    setBusy(true);
    flash();
    try {
      const response = await apiClient.post(`/documents/${doc.id}/share`);
      const payload = response.data?.data ?? response.data;
      setShareDocName(doc.name);
      const path = (payload.share_path as string) || (payload.share_url as string);
      const absolute =
        path.startsWith("http")
          ? path
          : `${window.location.origin}${path.startsWith("/") ? path : `/${path}`}`;
      setShareUrl(absolute);
      setModal("share");
    } catch (err) {
      flash(
        undefined,
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Could not create share link"
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-body-md text-on-surface-variant">Loading document vault…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-8 text-center shadow-sm">
        <h1 className="font-display text-headline-md text-on-surface">Couldn’t load documents</h1>
        <p className="mt-2 text-body-sm text-on-surface-variant">{error ?? "Unknown error"}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-5 rounded-lg bg-primary-container px-4 py-2 text-label-md font-medium text-on-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-headline-lg font-semibold text-on-surface">Document Vault</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Securely store, request, and share files with your Oknitech Serve team.
          </p>
        </div>
        <div className="w-full max-w-xs rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-sm sm:w-64">
          <div className="mb-1.5 flex items-center justify-between text-label-sm text-on-surface-variant">
            <span>Storage Used</span>
            <span>
              {data.storage.used_label} / {data.storage.plan_label}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
            <div
              className="h-full rounded-full bg-primary-container"
              style={{ width: `${data.storage.used_percent}%` }}
            />
          </div>
        </div>
      </div>

      {(actionOk || actionError) && (
        <div
          className={`rounded-lg border px-4 py-3 text-body-sm ${
            actionOk
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {actionOk || actionError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: "upload", label: "Upload File", mode: "upload" as const },
          { icon: "add", label: "New Folder", mode: "folder" as const },
          { icon: "mail", label: "Request Document", mode: "request" as const },
          {
            icon: "folder_shared",
            label: "Share Access",
            mode: null,
            onClick: () => {
              const first = data.files.find((f) => f.has_file);
              if (!first) {
                flash(undefined, "Upload a file first to create a share link");
                return;
              }
              void shareFile(first);
            },
          },
        ].map((action) => (
          <button
            key={action.label}
            type="button"
            disabled={busy}
            onClick={() => {
              if (action.onClick) {
                action.onClick();
                return;
              }
              setModal(action.mode);
              if (action.mode === "upload") {
                setUploadFolder(selectedFolder || "General");
              }
              if (action.mode === "request") {
                setRequestFolder(selectedFolder || "General");
              }
            }}
            className="flex flex-col items-center gap-2 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 text-center shadow-sm hover:bg-surface-container-low disabled:opacity-60"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-fixed text-primary">
              
            </div>
            <span className="text-label-md font-medium text-on-surface">{action.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-headline-sm font-semibold text-on-surface">Common Folders</h2>
              {selectedFolder && (
                <button
                  type="button"
                  onClick={() => setSelectedFolder(null)}
                  className="text-label-sm font-medium text-primary hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {data.folders.map((folder) => (
                <button
                  key={folder.name}
                  type="button"
                  onClick={() =>
                    setSelectedFolder((prev) => (prev === folder.name ? null : folder.name))
                  }
                  className={`flex flex-col items-start gap-2 rounded-lg border p-3.5 text-left transition-colors ${
                    selectedFolder === folder.name
                      ? "border-primary-container bg-primary-fixed"
                      : "border-outline-variant/40 hover:bg-surface-container-low"
                  }`}
                >
                  
                  <span className="text-body-sm font-medium text-on-surface">{folder.name}</span>
                  <span className="text-label-sm text-on-surface-variant">{folder.count} files</span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-4 text-headline-sm font-semibold text-on-surface">Pending Requests</h2>
            {data.pending_requests.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">No pending document requests.</p>
            ) : (
              <ul className="space-y-3">
                {data.pending_requests.map((req) => (
                  <li
                    key={req.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"
                  >
                    <div>
                      <p className="text-body-sm font-medium text-on-surface">{req.name}</p>
                      <p className="text-label-sm text-on-surface-variant">
                        Requested by {req.uploaded_by || "Team"}
                        {req.due_at ? ` · Due ${req.due_at}` : ""}
                        {req.folder ? ` · ${req.folder}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setFulfillId(req.id);
                        setUploadFolder(req.folder || "General");
                        fulfillRef.current?.click();
                      }}
                      className="flex items-center gap-1.5 rounded-lg bg-primary-container px-3 py-1.5 text-label-sm font-medium text-on-primary hover:opacity-90 disabled:opacity-60"
                    >
                      
                      Fulfil
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <input
              ref={fulfillRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && fulfillId) void doUpload(file, fulfillId, uploadFolder);
              }}
            />
          </section>

          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-headline-sm font-semibold text-on-surface">
                {selectedFolder ? `${selectedFolder} Files` : showAll ? "All Files" : "Recent Files"}
              </h2>
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="text-label-sm font-medium text-primary hover:underline"
              >
                {showAll ? "Show available only" : "View All"}
              </button>
            </div>
            {visibleFiles.length === 0 ? (
              <p className="py-6 text-center text-body-sm text-on-surface-variant">
                No files here yet. Upload one to get started.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left">
                  <thead>
                    <tr className="border-b border-outline-variant/40 text-label-sm text-on-surface-variant">
                      <th className="pb-2 font-medium">File Name</th>
                      <th className="pb-2 font-medium">Folder</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Size</th>
                      <th className="pb-2 font-medium">Uploaded</th>
                      <th className="pb-2 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {visibleFiles.map((doc) => (
                      <tr key={doc.id} className="text-body-sm text-on-surface">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            
                            <span className="truncate">{doc.name}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-on-surface-variant">{doc.folder}</td>
                        <td className="py-3 pr-4 text-on-surface-variant capitalize">{doc.status}</td>
                        <td className="py-3 pr-4 text-on-surface-variant">{doc.size ?? "—"}</td>
                        <td className="py-3 pr-4 text-on-surface-variant">{doc.uploaded_on ?? "—"}</td>
                        <td className="py-3">
                          <div className="flex items-center justify-end gap-1">
                            {doc.has_file && (
                              <>
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => void downloadFile(doc)}
                                  className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                                  aria-label={`Download ${doc.name}`}
                                >
                                  
                                </button>
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => void shareFile(doc)}
                                  className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                                  aria-label={`Share ${doc.name}`}
                                >
                                  
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void deleteFile(doc)}
                              className="rounded-lg p-1.5 text-on-surface-variant hover:bg-rose-50 hover:text-rose-700"
                              aria-label={`Delete ${doc.name}`}
                            >
                              
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-4 text-headline-sm font-semibold text-on-surface">Activity</h2>
            {data.activity.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">No document activity yet.</p>
            ) : (
              <ul className="space-y-4">
                {data.activity.map((activity) => (
                  <li key={activity.id} className="flex gap-3">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-container" />
                    <div>
                      <p className="text-body-sm text-on-surface">
                        <span className="font-medium">{activity.actor}</span> {activity.action}
                      </p>
                      <p className="text-label-sm text-on-surface-variant">{activity.timestamp}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-xl">
            {modal === "upload" && (
              <>
                <h3 className="font-display text-headline-sm text-on-surface">Upload File</h3>
                <div className="mt-4 space-y-3">
                  <label className="block text-label-sm text-on-surface-variant">
                    Folder
                    <select
                      value={uploadFolder}
                      onChange={(e) => setUploadFolder(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-body-sm outline-none focus:border-primary-container"
                    >
                      {folderOptions.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-label-sm text-on-surface-variant">
                    Link to service (optional)
                    <select
                      value={uploadBookingId}
                      onChange={(e) => setUploadBookingId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-body-sm outline-none focus:border-primary-container"
                    >
                      <option value="">None</option>
                      {data.bookings.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <input
                    ref={fileRef}
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                    className="block w-full text-body-sm"
                  />
                </div>
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModal(null)}
                    className="rounded-lg border border-outline-variant/50 px-4 py-2 text-label-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!uploadFile || busy}
                    onClick={() => uploadFile && void doUpload(uploadFile)}
                    className="rounded-lg bg-primary-container px-4 py-2 text-label-md font-medium text-on-primary disabled:opacity-60"
                  >
                    {busy ? "Uploading…" : "Upload"}
                  </button>
                </div>
              </>
            )}

            {modal === "folder" && (
              <>
                <h3 className="font-display text-headline-sm text-on-surface">New Folder</h3>
                <input
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="e.g. KYC Documents"
                  className="mt-4 w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-body-sm outline-none focus:border-primary-container"
                />
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModal(null)}
                    className="rounded-lg border border-outline-variant/50 px-4 py-2 text-label-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!folderName.trim() || busy}
                    onClick={() => void createFolder()}
                    className="rounded-lg bg-primary-container px-4 py-2 text-label-md font-medium text-on-primary disabled:opacity-60"
                  >
                    Create
                  </button>
                </div>
              </>
            )}

            {modal === "request" && (
              <>
                <h3 className="font-display text-headline-sm text-on-surface">Request Document</h3>
                <div className="mt-4 space-y-3">
                  <input
                    value={requestName}
                    onChange={(e) => setRequestName(e.target.value)}
                    placeholder="Document name"
                    className="w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-body-sm outline-none focus:border-primary-container"
                  />
                  <select
                    value={requestFolder}
                    onChange={(e) => setRequestFolder(e.target.value)}
                    className="w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-body-sm outline-none focus:border-primary-container"
                  >
                    {folderOptions.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={requestDue}
                    onChange={(e) => setRequestDue(e.target.value)}
                    className="w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-body-sm outline-none focus:border-primary-container"
                  />
                </div>
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModal(null)}
                    className="rounded-lg border border-outline-variant/50 px-4 py-2 text-label-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!requestName.trim() || busy}
                    onClick={() => void createRequest()}
                    className="rounded-lg bg-primary-container px-4 py-2 text-label-md font-medium text-on-primary disabled:opacity-60"
                  >
                    Create request
                  </button>
                </div>
              </>
            )}

            {modal === "share" && shareUrl && (
              <>
                <h3 className="font-display text-headline-sm text-on-surface">Share Access</h3>
                <p className="mt-2 text-body-sm text-on-surface-variant">
                  Anyone with this link can download <strong>{shareDocName}</strong>.
                </p>
                <div className="mt-4 flex gap-2">
                  <input
                    readOnly
                    value={shareUrl}
                    className="flex-1 rounded-lg border border-outline-variant/50 px-3 py-2 text-body-sm"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(shareUrl);
                      flash("Link copied");
                    }}
                    className="rounded-lg bg-primary-container px-3 py-2 text-label-md font-medium text-on-primary"
                  >
                    Copy
                  </button>
                </div>
                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setModal(null)}
                    className="rounded-lg border border-outline-variant/50 px-4 py-2 text-label-md"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
