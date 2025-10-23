import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from './button';

export function ConfirmDialog({ open, onOpenChange, title, description, onConfirm }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  description?: string;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title || 'Are you sure?'}</DialogTitle>
        </DialogHeader>
        {description && <div className="text-sm text-gray-600 mb-4">{description}</div>}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { onConfirm(); onOpenChange(false); }} className="bg-red-600 text-white hover:bg-red-700">Confirm</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
