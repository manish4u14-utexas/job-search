import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Briefcase, ExternalLink, Calendar, FileText } from "lucide-react";
import { toast } from "sonner";

type ApplicationStatus = "new" | "saved" | "applied" | "interviewing" | "rejected";

const statusColors: Record<ApplicationStatus, string> = {
  new: "var(--neon-cyan)",
  saved: "var(--neon-purple)",
  applied: "var(--neon-green)",
  interviewing: "var(--neon-pink)",
  rejected: "#666",
};

const statusLabels: Record<ApplicationStatus, string> = {
  new: "NEW",
  saved: "SAVED",
  applied: "APPLIED",
  interviewing: "INTERVIEWING",
  rejected: "REJECTED",
};

export default function Applications() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | "all">("all");

  // For local development without OAuth, allow access
  const isDevelopment = import.meta.env.DEV;

  const { data: applications, isLoading } = trpc.applications.getAll.useQuery();
  const { mutate: updateStatus } = trpc.applications.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Application status updated!");
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  const filteredApplications = applications?.filter(
    (app) => filterStatus === "all" || app.status === filterStatus
  );

  const statusCounts = applications?.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0f",
        color: "var(--neon-cyan)",
      }}
      className="scanlines"
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid rgba(0, 245, 255, 0.3)",
          background:
            "linear-gradient(to right, #000, rgba(128, 0, 128, 0.2), #000)",
        }}
      >
        <div
          style={{
            maxWidth: "80rem",
            margin: "0 auto",
            padding: "1rem",
            paddingTop: "2rem",
            paddingBottom: "2rem",
          }}
        >
          <h1
            style={{
              fontSize: "2.25rem",
              fontWeight: "bold",
              color: "var(--neon-pink)",
              marginBottom: "0.5rem",
              fontFamily: "Orbitron, sans-serif",
              textTransform: "uppercase",
            }}
          >
            APPLICATION TRACKER
          </h1>
          <p style={{ color: "var(--neon-cyan)" }}>
            Manage your job application pipeline
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          maxWidth: "80rem",
          margin: "0 auto",
          padding: "1rem",
          paddingTop: "2rem",
          paddingBottom: "2rem",
        }}
      >
        {/* Status Summary */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {Object.entries(statusLabels).map(([status, label]) => (
            <Card
              key={status}
              className="hud-container"
              style={{
                textAlign: "center",
                padding: "1rem",
                borderColor: statusColors[status as ApplicationStatus],
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onClick={() =>
                setFilterStatus(
                  filterStatus === status ? "all" : (status as ApplicationStatus)
                )
              }
            >
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  color: statusColors[status as ApplicationStatus],
                  marginBottom: "0.5rem",
                }}
              >
                {statusCounts?.[status] || 0}
              </div>
              <div
                style={{
                  fontSize: "0.875rem",
                  color: statusColors[status as ApplicationStatus],
                  fontFamily: "Orbitron, sans-serif",
                }}
              >
                {label}
              </div>
            </Card>
          ))}
        </div>

        {/* Filter */}
        <div style={{ marginBottom: "1.5rem" }}>
          <Select
            value={filterStatus}
            onValueChange={(value) =>
              setFilterStatus(value as ApplicationStatus | "all")
            }
          >
            <SelectTrigger
              style={{
                width: "200px",
                backgroundColor: "#1a1a2e",
                borderColor: "var(--neon-cyan)",
                color: "var(--neon-cyan)",
              }}
            >
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              {Object.entries(statusLabels).map(([status, label]) => (
                <SelectItem key={status} value={status}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Applications List */}
        {isLoading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              paddingTop: "5rem",
              paddingBottom: "5rem",
            }}
          >
            <Spinner
              style={{ width: "2rem", height: "2rem", color: "var(--neon-cyan)" }}
            />
          </div>
        ) : filteredApplications && filteredApplications.length > 0 ? (
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {filteredApplications.map((app) => (
              <Card
                key={app.id}
                className="hud-container"
                style={{
                  borderColor: statusColors[app.status],
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "1rem",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                  }}
                >
                  {/* Application Info */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <Briefcase
                        style={{
                          width: "1.25rem",
                          height: "1.25rem",
                          color: "var(--neon-cyan)",
                        }}
                      />
                      <h3
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: "bold",
                          color: "var(--neon-cyan)",
                        }}
                      >
                        Job #{app.jobId}
                      </h3>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <Badge
                        style={{
                          backgroundColor: statusColors[app.status],
                          color: "#000",
                          fontWeight: "bold",
                        }}
                      >
                        {statusLabels[app.status]}
                      </Badge>
                      {app.appliedDate && (
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: "var(--neon-purple)",
                            color: "var(--neon-purple)",
                          }}
                        >
                          <Calendar
                            style={{
                              width: "0.875rem",
                              height: "0.875rem",
                              marginRight: "0.25rem",
                            }}
                          />
                          {new Date(app.appliedDate).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>

                    {app.notes && (
                      <p
                        style={{
                          color: "#d1d5db",
                          fontSize: "0.875rem",
                          marginTop: "0.5rem",
                        }}
                      >
                        {app.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                      minWidth: "200px",
                    }}
                  >
                    <Select
                      value={app.status}
                      onValueChange={(value) =>
                        updateStatus({
                          jobId: app.jobId,
                          status: value as ApplicationStatus,
                        })
                      }
                    >
                      <SelectTrigger
                        style={{
                          backgroundColor: "#1a1a2e",
                          borderColor: statusColors[app.status],
                          color: statusColors[app.status],
                        }}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([status, label]) => (
                          <SelectItem key={status} value={status}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      className="btn-neon"
                      style={{ fontSize: "0.875rem" }}
                      onClick={() => navigate(`/job/${app.jobId}`)}
                    >
                      <FileText
                        style={{
                          width: "1rem",
                          height: "1rem",
                          marginRight: "0.5rem",
                        }}
                      />
                      VIEW DETAILS
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div
            className="hud-container"
            style={{
              textAlign: "center",
              paddingTop: "5rem",
              paddingBottom: "5rem",
            }}
          >
            <p
              style={{
                color: "#9ca3af",
                fontSize: "1.125rem",
                marginBottom: "1rem",
              }}
            >
              {filterStatus === "all"
                ? "No applications yet"
                : `No ${statusLabels[filterStatus as ApplicationStatus].toLowerCase()} applications`}
            </p>
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
              Start applying to jobs from the dashboard
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
