"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, RotateCcw } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { DeploymentProgress } from "@/components/DeploymentProgress";
import { DeploymentBadge } from "@/components/StatusBadge";
import { Button, Modal } from "@/components/ui";
import { useFleet } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { can } from "@/lib/roles";

export default function DeploymentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { deployments, rollbackDeployment } = useFleet();
  const { user } = useAuth();
  const [confirm, setConfirm] = useState(false);
  const deployment = deployments.find((item) => item.id === params.id);

  const restoreVersion = useMemo(() => {
    if (!deployment) return "v1.3.0";
    return (
      Object.values(deployment.previousVersions)[0] ??
      deployment.rollbackTo ??
      "v1.3.0"
    );
  }, [deployment]);

  if (!deployment) {
    return (
      <AppShell title="Deployment">
        <p className="text-slate-400">Deployment not found.</p>
      </AppShell>
    );
  }

  const complete =
    deployment.status === "completed" || deployment.status === "rolled_back";
  const failed = deployment.status === "failed" || deployment.status === "recovering";
  const canRollback =
    complete &&
    !deployment.rollbackTo &&
    Object.keys(deployment.previousVersions).length > 0 &&
    can(user?.role, "rollback");

  const runRollback = async () => {
    const id = await rollbackDeployment(deployment.id);
    setConfirm(false);
    if (id) router.push(`/deployments/${id}`);
  };

  return (
    <AppShell
      title={deployment.rollbackTo ? `Rolling back to ${deployment.rollbackTo}` : `Deploying ${deployment.firmwareVersion}`}
      subtitle={`${deployment.mode === "live" ? "Live" : "Simulated"} OTA · recovery ${deployment.recovery.replace("_", " ")}`}
    >
      <button
        onClick={() => router.push("/deployments")}
        className="mb-5 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft size={14} />
        Back to deployments
      </button>

      {failed ? (
        <div className="mb-6 rounded-2xl border border-rose-400/20 bg-rose-400/8 p-5">
          <h2 className="text-lg font-semibold">
            {deployment.status === "recovering"
              ? "Failure recorded — recovery in progress"
              : "Deployment failed"}
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Failed devices stay on last good firmware. Auto-rollback uses the
            tested recovery strategy {deployment.recovery.replaceAll("_", " ")}.
          </p>
        </div>
      ) : complete ? (
        <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/8 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-emerald-300" />
              <div>
                <h2 className="text-lg font-semibold">
                  {deployment.rollbackTo
                    ? "Rollback complete — 100% success"
                    : "Deployment complete — 100% success"}
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                  {deployment.deviceCount} devices updated · New firmware:{" "}
                  <span className="font-mono text-sky-200">
                    {deployment.firmwareVersion}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => router.push("/devices")}>
                View devices
              </Button>
              {canRollback ? (
                <Button variant="secondary" onClick={() => setConfirm(true)}>
                  <RotateCcw size={15} />
                  Rollback
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-sky-400/20 bg-sky-400/8 p-5">
          <div>
            <p className="text-sm text-sky-200">OTA in progress</p>
            <p className="mt-1 text-2xl font-semibold">{deployment.progress}%</p>
          </div>
          <DeploymentBadge status={deployment.status} />
        </div>
      )}

      <DeploymentProgress deployment={deployment} />

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Confirm rollback"
        subtitle={`Roll back selected devices to ${restoreVersion}?`}
      >
        <p className="text-sm leading-6 text-slate-400">
          Devices return to {restoreVersion} using the same recovery path as a
          failed live update. Live agents pick up the rollback automatically.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirm(false)}>
            Cancel
          </Button>
          <Button onClick={() => void runRollback()}>Confirm rollback</Button>
        </div>
      </Modal>
    </AppShell>
  );
}
