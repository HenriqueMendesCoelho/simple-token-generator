import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { forwardRef, useId } from 'react';
import RequiredStar from './required-star';

type Props = {
  label?: string;
  placeholder?: string;
  message?: string;
  className?: string;
  required?: boolean;
  [key: string]: any;
};

const textareaGrey = forwardRef<HTMLTextAreaElement, Props>(
  ({ label, placeholder, message, className, required, ...props }, ref) => {
    const id = useId();
    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={id}>
            {label}
            {required && <RequiredStar />}
          </Label>
        )}
        <Textarea
          id={id}
          ref={ref}
          className={cn(
            'border-transparent bg-gray-200 shadow-none dark:bg-gray-800',
            className
          )}
          placeholder={placeholder}
          {...props}
        />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    );
  }
);

textareaGrey.displayName = 'TextareaGrey';

export default textareaGrey;
