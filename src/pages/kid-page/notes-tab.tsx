import { Plus, FilePlus } from "lucide-react"

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
import { translate, withParams } from "@/lib/translate"

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
          <CardTitle>{translate.notesDataTitle}</CardTitle>
          <CardDescription>
            {withParams(translate.notesDataDescFull, {
              total: notes.length,
              latest: latestNote
                ? renderDateTime(latestNote.recordedAt)
                : translate.noNotesYet,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border/60 bg-background/80 p-4">
              <p className="text-sm text-muted-foreground">
                {translate.totalNotes}
              </p>
              <p className="mt-2 text-2xl font-semibold">{notes.length}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {translate.totalNotesDesc}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/80 p-4">
              <p className="text-sm text-muted-foreground">
                {translate.latestNote}
              </p>
              <p className="mt-2 text-sm font-semibold">
                {latestNote
                  ? renderDateTime(latestNote.recordedAt)
                  : translate.noNotesYet}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {translate.latestNoteDesc}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/80 p-4">
              <p className="text-sm text-muted-foreground">
                {translate.recentPreview}
              </p>
              <p className="mt-2 line-clamp-3 text-sm font-medium">
                {latestNote?.content ?? translate.recentPreviewEmpty}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/25 bg-linear-to-br from-primary/10 to-card">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>{translate.noteLogs}</CardTitle>
          <Button onClick={onCreate}>
            <Plus
              className="size-4"
            />
            <FilePlus
              className="size-4"
            />
            {translate.addNote}
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{translate.when}</TableHead>
                <TableHead>{translate.content}</TableHead>
                <TableHead className="w-32">{translate.actions}</TableHead>
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
