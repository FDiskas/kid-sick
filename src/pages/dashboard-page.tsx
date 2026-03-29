import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/features/auth/auth-context"
import { DashboardHeader } from "@/pages/dashboard/dashboard-header"
import { KidFormDialog } from "@/pages/dashboard/kid-form-dialog"
import { KidsGrid } from "@/pages/dashboard/kids-grid"
import { useDashboardController } from "@/pages/dashboard/use-dashboard-controller"

export function DashboardPage() {
  const { auth } = useAuth()
  const controller = useDashboardController(auth)

  if (!auth) {
    return null
  }

  return (
    <div className="space-y-6">
      <DashboardHeader onAddKid={controller.openCreateDialog} />

      {controller.error ? (
        <Alert variant="destructive">
          <AlertTitle>Could not load dashboard</AlertTitle>
          <AlertDescription>{controller.error}</AlertDescription>
        </Alert>
      ) : null}

      {controller.isLoading ? (
        <div className="text-sm text-muted-foreground">Loading data...</div>
      ) : (
        <KidsGrid
          kids={controller.kids}
          deletingKidId={controller.deletingKidId}
          onEdit={controller.openEditDialog}
          onDelete={controller.deleteKid}
          onCreate={controller.openCreateDialog}
        />
      )}

      <KidFormDialog
        form={controller.form}
        title={controller.dialogTitle}
        open={controller.isDialogOpen}
        onOpenChange={controller.setIsDialogOpen}
        onSubmit={controller.submitKid}
      />
    </div>
  )
}
