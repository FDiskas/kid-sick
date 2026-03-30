import { Trash2, Pencil, Loader2, MoreVertical } from "lucide-react"

import { translate } from "@/lib/translate"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type RecordActionsMenuProps = {
  onEdit: () => void
  onDelete: () => void
  isDeleting?: boolean
}

export function RecordActionsMenu({
  onEdit,
  onDelete,
  isDeleting = false,
}: RecordActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="sm" disabled={isDeleting} />}
      >
        {isDeleting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            {translate.deleting}
          </>
        ) : (
          <>
            <MoreVertical className="size-4" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="size-4" />
          {translate.edit}
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <Trash2 className="size-4" />
          {translate.delete}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
