import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, NoteAddIcon } from "@hugeicons/core-free-icons"

import { RecordActionsMenu } from "@/components/record-actions-menu"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  return (
    <Card className="border-primary/25 bg-linear-to-br from-primary/10 to-card">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Notes</CardTitle>
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
  )
}
