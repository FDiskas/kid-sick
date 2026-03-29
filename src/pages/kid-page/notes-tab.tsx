import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, NoteAddIcon } from "@hugeicons/core-free-icons"

import { RecordActionsMenu } from "@/components/record-actions-menu"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { NoteRecord } from "@/features/health/types"
import { renderDateTime } from "@/pages/kid-page/utils"

type NotesTabProps = {
  notes: NoteRecord[]
  deletingRecordId: string | null
  onCreate: () => void
  onEdit: (record: NoteRecord) => void
  onDelete: (record: NoteRecord) => void
}

export function NotesTab({
  notes,
  deletingRecordId,
  onCreate,
  onEdit,
  onDelete,
}: NotesTabProps) {
  const latestNote = notes[0] ?? null

  return (
    <div className="space-y-3">
      <Card className="hidden border-primary/25 bg-linear-to-br from-primary/10 to-card md:block">
        <CardHeader>
          <CardTitle>Notes data</CardTitle>
          <CardDescription>
            Total notes: {notes.length}. Latest note: {latestNote ? renderDateTime(latestNote.recordedAt) : "No notes yet"}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border/60 bg-background/80 p-4">
              <p className="text-sm text-muted-foreground">Total notes</p>
              <p className="mt-2 text-2xl font-semibold">{notes.length}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Logged observations and reminders
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/80 p-4">
              <p className="text-sm text-muted-foreground">Latest note</p>
              <p className="mt-2 text-sm font-semibold">
                {latestNote ? renderDateTime(latestNote.recordedAt) : "No notes yet"}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Most recent entry time
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/80 p-4">
              <p className="text-sm text-muted-foreground">Recent preview</p>
              <p className="mt-2 line-clamp-3 text-sm font-medium">
                {latestNote?.content ?? "Add a note to keep recent observations visible here."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/25 bg-linear-to-br from-primary/10 to-card">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Note logs</CardTitle>
          <Button onClick={onCreate}>
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
            <HugeiconsIcon
              icon={NoteAddIcon}
              strokeWidth={2}
              className="size-4"
            />
            Add note
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Content</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notes.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{renderDateTime(row.recordedAt)}</TableCell>
                  <TableCell>{row.content}</TableCell>
                  <TableCell>
                    <RecordActionsMenu
                      isDeleting={deletingRecordId === row.id}
                      onEdit={() => onEdit(row)}
                      onDelete={() => void onDelete(row)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
