import { Laptop, Moon, Settings, Sun } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type Theme = 'dark' | 'light' | 'system';

export default function SettingsDialog() {
  const { theme, setTheme } = useTheme();

  return (
    <Dialog>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Settings className="h-5 w-5" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Configurations</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurations</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <Label>Theme</Label>
            <RadioGroup
              defaultValue={theme}
              onValueChange={(value: Theme) => setTheme(value)}
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="light"
                  id="light"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="light"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Sun className="mb-3 h-6 w-6" />
                  Light
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="dark"
                  id="dark"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="dark"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Moon className="mb-3 h-6 w-6" />
                  Dark
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="system"
                  id="system"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="system"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Laptop className="mb-3 h-6 w-6" />
                  System
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
