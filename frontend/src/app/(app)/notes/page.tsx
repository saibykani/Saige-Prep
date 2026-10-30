import type { Metadata } from "next";
import { NotesView } from "@/features/notes/notes-view";

// Rendered client-side behind AppShell (session/guest check), so instant-navigation validation does not apply.
export const instant = false;

export const metadata: Metadata = { title: "Notes" };

export default function Page() {
  return <NotesView />;
}
