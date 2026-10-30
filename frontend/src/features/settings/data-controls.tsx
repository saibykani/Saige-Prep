"use client";

import { Download, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { actions } from "@/lib/store";

/** 5 MB is far beyond any real backup; anything larger is rejected before reading. */
const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

/** Export, import and delete the learner data kept in this browser. */
export function DataControls() {
  const { notify } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  function download() {
    const blob = new Blob([actions.exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `saige-prep-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify("Backup downloaded.", "success");
  }

  async function upload(file: File | undefined) {
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      notify("That file is too large to be a Saige-Prep backup.", "error");
      return;
    }
    const error = actions.importData(await file.text());
    notify(error ?? "Backup restored.", error ? "error" : "success");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your data</CardTitle>
        <CardDescription>
          Progress, notes, bookmarks, test results and plans are stored only in this browser. Back them up to move to
          another device, or delete them.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={download}>
          <Download className="h-4 w-4" aria-hidden /> Export backup
        </Button>
        <Button variant="secondary" onClick={() => fileRef.current?.click()}>
          <Upload className="h-4 w-4" aria-hidden /> Import backup
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          aria-label="Backup file"
          onChange={(e) => void upload(e.target.files?.[0])}
        />
        <Button variant="danger" onClick={() => setConfirmReset(true)}>
          <Trash2 className="h-4 w-4" aria-hidden /> Delete all my data
        </Button>
      </CardContent>
      <ConfirmDialog
        open={confirmReset}
        title="Delete all your data?"
        description="This permanently erases your progress, notes, bookmarks, test results and plans from this browser. Export a backup first if you might want them back."
        confirmLabel="Delete everything"
        destructive
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          actions.reset();
          setConfirmReset(false);
          notify("All data deleted.", "success");
        }}
      />
    </Card>
  );
}
