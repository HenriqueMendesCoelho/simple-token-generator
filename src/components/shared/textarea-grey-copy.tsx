import { forwardRef, useRef } from 'react';
import ButtonCopy from './button-copy';
import TextareaGrey from './textarea-grey';

type Props = {
  label: string;
  placeholder?: string;
  message?: string;
  className?: string;
  [key: string]: any;
};

const textareaGrey = forwardRef<HTMLTextAreaElement, Props>(
  ({ className, ...props }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);

    const combinedRef = (node: HTMLTextAreaElement | null): void => {
      if (!node) return;

      if (typeof ref === 'function') {
        ref(node);
      }

      if (ref && typeof ref === 'object') {
        (ref as React.RefObject<HTMLTextAreaElement | null>).current = node;
      }

      internalRef.current = node;
    };

    return (
      <div className="relative">
        <TextareaGrey ref={combinedRef} className={className} {...props} />

        {internalRef.current?.value && (
          <div className="absolute top-7 right-1 ">
            <ButtonCopy text={internalRef.current?.value} sizeIcon={50} />
          </div>
        )}
      </div>
    );
  }
);

export default textareaGrey;
