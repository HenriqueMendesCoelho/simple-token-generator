import { forwardRef, useEffect, useState } from 'react';
import ButtonCopy from './button-copy';
import TextareaGrey from './textarea-grey';

type Props = {
  className?: string;
  showCopy?: boolean;
  copyText?: string;
  [key: string]: any;
};

const textareaGrey = forwardRef<HTMLTextAreaElement, Props>(
  ({ className, showCopy = true, copyText, ...props }, ref) => {
    const [value, setValue] = useState('');

    useEffect(() => {
      setValue(copyText || '');
    }, [copyText]);

    return (
      <div className="relative">
        <TextareaGrey
          ref={ref}
          className={className}
          {...props}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setValue(e.target.value);
          }}
        />
        {showCopy && (
          <div className="absolute top-7 right-1 ">
            <ButtonCopy text={value} sizeIcon={50} />
          </div>
        )}
      </div>
    );
  }
);

export default textareaGrey;
