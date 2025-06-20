import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@radix-ui/react-dialog';

export const AlertDialogTrigger = DialogTrigger;
export const AlertDialogContent = DialogContent;
export const AlertDialogTitle = DialogTitle;
export const AlertDialogDescription = DialogDescription;
export const AlertDialogCancel = DialogClose;
export const AlertDialogAction = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...props} />
);

export const AlertDialogHeader = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="flex flex-col space-y-1.5 text-center sm:text-left" {...props} />
);

export const AlertDialogFooter = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2" {...props} />
);

export const AlertDialog = Dialog; 