import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  open,
  onOpenChange,
  children,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setIsOpen(newOpen);
    }
  };

  const isDialogOpen = open !== undefined ? open : isOpen;

  return (
    <AlertDialogContext.Provider
      value={{ open: isDialogOpen, onOpenChange: handleOpenChange }}
    >
      {children}
    </AlertDialogContext.Provider>
  );
};

const AlertDialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>({
  open: false,
  onOpenChange: () => {},
});

const AlertDialogTrigger: React.FC<{
  children: React.ReactNode;
  asChild?: boolean;
}> = ({ children, asChild }) => {
  const { onOpenChange } = React.useContext(AlertDialogContext);

  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: () => onOpenChange(true),
    });
  }

  return <div onClick={() => onOpenChange(true)}>{children}</div>;
};

const AlertDialogContent: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => {
  const { open, onOpenChange } = React.useContext(AlertDialogContext);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50">
        <div
          className={cn(
            "bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto",
            className
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

const AlertDialogHeader: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left mb-4",
      className
    )}
  >
    {children}
  </div>
);

const AlertDialogTitle: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => (
  <h2 className={cn("text-lg font-semibold", className)}>{children}</h2>
);

const AlertDialogDescription: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => (
  <div className={cn("text-sm text-gray-600", className)}>{children}</div>
);

const AlertDialogFooter: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6",
      className
    )}
  >
    {children}
  </div>
);

const AlertDialogCancel: React.FC<{
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ className, children, onClick }) => {
  const { onOpenChange } = React.useContext(AlertDialogContext);

  return (
    <Button
      variant="outline"
      className={className}
      onClick={() => {
        onClick?.();
        onOpenChange(false);
      }}
    >
      {children}
    </Button>
  );
};

const AlertDialogAction: React.FC<{
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ className, children, onClick }) => {
  const { onOpenChange } = React.useContext(AlertDialogContext);

  return (
    <Button
      className={className}
      onClick={() => {
        onClick?.();
        onOpenChange(false);
      }}
    >
      {children}
    </Button>
  );
};

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
};
