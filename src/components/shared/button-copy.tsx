import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Check, Copy, Ban } from 'lucide-react';
import { useState } from 'react';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';

type Props = {
  text: string;
  sizeIcon?: number;
};

export default function Component({ text, sizeIcon }: Props) {
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const handleCopy = async () => {
    try {
      await writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="disabled:opacity-100"
            onClick={handleCopy}
            aria-label={copied ? 'Copied' : 'Copy to clipboard'}
            disabled={copied}
            type="button"
          >
            <div
              className={cn(
                'transition-all',
                copied || error ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
              )}
            >
              {copied && (
                <Check
                  className="stroke-emerald-500"
                  size={sizeIcon || 16}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              )}
              {error && (
                <Ban
                  className="stroke-red-500"
                  size={sizeIcon || 16}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              )}
            </div>
            <div
              className={cn(
                'absolute transition-all',
                copied || error ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
              )}
            >
              <Copy size={sizeIcon || 16} strokeWidth={2} aria-hidden="true" />
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="px-2 py-1 text-xs">
          Click to copy
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
