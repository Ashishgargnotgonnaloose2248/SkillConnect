import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface CollabRequestModalProps {
  projectTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (message: string) => Promise<void> | void;
  isSubmitting?: boolean;
  defaultMessage?: string;
}

export const CollabRequestModal: React.FC<CollabRequestModalProps> = ({
  projectTitle,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  defaultMessage = "Hi! I love what you're building. I'd like to collaborate and can help with...",
}) => {
  const [message, setMessage] = useState(defaultMessage);

  useEffect(() => {
    if (open) {
      setMessage(defaultMessage);
    }
  }, [defaultMessage, open]);

  const handleSubmit = async () => {
    await onSubmit(message.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request to collaborate</DialogTitle>
          <DialogDescription>
            Send a quick note to the project owner so they know how you can help with <strong>{projectTitle}</strong>.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Share your skills, availability, and why you're excited to help."
          className="min-h-[140px]"
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !message.trim()}>
            {isSubmitting ? "Sending..." : "Send request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CollabRequestModal;
