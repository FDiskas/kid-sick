import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  Delete02Icon,
  Edit01Icon,
  Loading03Icon,
  NoteAddIcon,
} from "@hugeicons/core-free-icons"

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
              <TableHead className="w-40">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notes.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{renderDateTime(row.recordedAt)}</TableCell>
                <TableCell>{row.content}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={deletingRecordId === row.id}
                      onClick={() => onEdit(row)}
                    >
                      <HugeiconsIcon
                        icon={Edit01Icon}
                        strokeWidth={2}
                        className="size-4"
                      />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={deletingRecordId === row.id}
                      onClick={() => void onDelete(row)}
                    >
                      {deletingRecordId === row.id ? (
                        <>
                          <HugeiconsIcon
                            icon={Loading03Icon}
                            strokeWidth={2}
                            className="size-4 animate-spin"
                          />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <HugeiconsIcon
                            icon={Delete02Icon}
                            strokeWidth={2}
                            className="size-4"
                          />
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
