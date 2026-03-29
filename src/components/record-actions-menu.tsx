import { HugeiconsIcon } from "@hugeicons/react"
import {
  Delete02Icon,
  Edit01Icon,
  Loading03Icon,
  MoreVerticalCircle01Icon,
} from "@hugeicons/core-free-icons"

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
            <HugeiconsIcon
              icon={Loading03Icon}
              strokeWidth={2}
              className="size-4 animate-spin"
            />
            {translate.deleting}
          </>
        ) : (
          <>
            <HugeiconsIcon
              icon={MoreVerticalCircle01Icon}
              strokeWidth={2}
              className="size-4"
            />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <HugeiconsIcon icon={Edit01Icon} strokeWidth={2} className="size-4" />
          {translate.edit}
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={onDelete}>
          <HugeiconsIcon
            icon={Delete02Icon}
            strokeWidth={2}
            className="size-4"
          />
          {translate.delete}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
