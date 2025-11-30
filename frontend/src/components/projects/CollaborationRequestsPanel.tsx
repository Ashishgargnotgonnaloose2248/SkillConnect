import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { type CollabRequest } from "@/lib/api";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";

interface CollaborationRequestsPanelProps {
  requests: CollabRequest[];
  onAccept: (requestId: string) => void;
  onReject: (requestId: string) => void;
  isLoading?: boolean;
}

const statusColors: Record<CollabRequest["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

export const CollaborationRequestsPanel: React.FC<CollaborationRequestsPanelProps> = ({
  requests,
  onAccept,
  onReject,
  isLoading,
}) => {
  return (
    <Card className="border-border/70 bg-card/80">
      <CardHeader>
        <CardTitle>Collaboration requests</CardTitle>
        <p className="text-sm text-muted-foreground">Review and respond to student requests.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && <p className="text-sm text-muted-foreground">Loading requests...</p>}
        {!isLoading && requests.length === 0 && (
          <p className="text-sm text-muted-foreground">No collaboration requests right now.</p>
        )}
        {requests.map((request) => {
          const initials = request.fromUser.fullName
            ?.split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
          return (
            <div key={request._id} className="rounded-2xl border border-border/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold leading-tight">{request.fromUser.fullName}</p>
                    <p className="text-xs text-muted-foreground">Requested {format(new Date(request.createdAt), 'MMM d')}</p>
                  </div>
                </div>
                <Badge className={`${statusColors[request.status]} rounded-full px-3 py-1 text-xs`}>
                  {request.status}
                </Badge>
              </div>

              <div className="mt-3 space-y-2 text-sm">
                <p className="font-medium text-muted-foreground">Project</p>
                <p className="leading-tight">{request.projectId.title}</p>
              </div>

              {request.message && (
                <div className="mt-3 rounded-xl bg-muted/40 p-3 text-sm">
                  “{request.message}”
                </div>
              )}

              {request.fromUser.linkedin && (
                <div className="mt-3 text-sm">
                  <p className="font-medium text-muted-foreground">LinkedIn</p>
                  <a
                    href={request.fromUser.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-brand-blue underline-offset-2 hover:underline"
                  >
                    View profile <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}

              {(request.fromUser.skillsOffered?.length || request.fromUser.skillsSeeking?.length) && (
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Skills</p>
                  <p>
                    {[...(request.fromUser.skillsOffered || []).map((skill: any) => skill.name),
                      ...(request.fromUser.skillsSeeking || []).map((skill: any) => skill.name)]
                      .filter(Boolean)
                      .slice(0, 6)
                      .join(', ') || 'Not listed'}
                  </p>
                </div>
              )}

              {request.status === 'pending' && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => onAccept(request._id)}>
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onReject(request._id)}>
                    Reject
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default CollaborationRequestsPanel;
