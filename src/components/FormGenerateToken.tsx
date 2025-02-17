import { useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, UseFormReturn } from 'react-hook-form';

import { Form, FormControl, FormField, FormItem, FormLabel } from '@/ui/form';
import { RadioGroup, RadioGroupItem } from '@/ui/radio-group';
import { Label } from '@/ui/label';
import TextareaGrey from '@/components/shared/textarea-grey';
import { Input } from '@/ui/input';
import { Button } from '@/ui/button';
import { Checkbox } from '@/ui/checkbox';

import TextareaGreyCopy from '@/components/shared/textarea-grey-copy';
import RequiredStar from '@/components/shared/required-star';

type Props = {
  form: UseFormReturn<z.infer<typeof formSchema>>;
};

function RadioGroupSelectAlg({ form }: Props) {
  return (
    <>
      <div className="w-1/10 flex-initial pt-6">
        <FormField
          control={form.control}
          name="alg"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <div className="flex items-center space-x-1">
                    <FormControl>
                      <RadioGroupItem value="RS" id="rs" />
                    </FormControl>
                    <Label htmlFor="rs">RSA</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FormControl>
                      <RadioGroupItem value="HS" id="hs" />
                    </FormControl>
                    <Label htmlFor="hs">HMAC</Label>
                  </div>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      <div className="w-1/10 flex-initial pt-6">
        <FormField
          control={form.control}
          name="hash"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <div className="flex items-center space-x-1">
                    <FormControl>
                      <RadioGroupItem value="256" id="256" />
                    </FormControl>
                    <Label htmlFor="256">256</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FormControl>
                      <RadioGroupItem value="384" id="384" />
                    </FormControl>
                    <Label htmlFor="384">384</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FormControl>
                      <RadioGroupItem value="512" id="512" />
                    </FormControl>
                    <Label htmlFor="512">512</Label>
                  </div>
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </>
  );
}

function KeyOptions({ form }: Props) {
  return (
    <>
      <div className="flex gap-x-2">
        <div className="flex-auto">
          <FormField
            control={form.control}
            name="privateKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Signing Key
                  <RequiredStar />
                </FormLabel>
                <FormControl>
                  <TextareaGrey
                    className="[resize:none]"
                    placeholder="Insert your private key"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <RadioGroupSelectAlg form={form} />
      </div>
      <div className="flex items-end gap-x-5">
        <div className="flex-auto">
          <FormField
            control={form.control}
            name="passphrase"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Key Passphrase</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="passphrase" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div>
          <FormField
            control={form.control}
            name="encoded"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3">
                <FormLabel>Key base64 encoded</FormLabel>
                <FormControl>
                  <Checkbox
                    id="terms2"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>
    </>
  );
}

function TokenProperties({ form }: Props) {
  return (
    <>
      <div className="flex gap-x-2">
        <div className="w-1/3 flex-auto">
          <FormField
            control={form.control}
            name="aud"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Audience
                  <RequiredStar />
                </FormLabel>
                <FormControl>
                  <Input type="text" placeholder="aud" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="w-1/3 flex-auto">
          <FormField
            control={form.control}
            name="iss"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Issuer
                  <RequiredStar />
                </FormLabel>
                <FormControl>
                  <Input type="text" placeholder="iss" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="w-1/3 flex-auto">
          <FormField
            control={form.control}
            name="sub"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Subject
                  <RequiredStar />
                </FormLabel>
                <FormControl>
                  <Input type="text" placeholder="sub" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="flex gap-x-2">
        <div className="w-3/4 flex-auto">
          <FormField
            control={form.control}
            name="others"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Others Properties</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="name=value;name=value;..."
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="w-1/4 flex-auto">
          <FormField
            control={form.control}
            name="expiration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Expiration
                  <RequiredStar />
                </FormLabel>
                <FormControl>
                  <Input type="text" placeholder="1d 2h 3m" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>
    </>
  );
}

function SubmitAndResult({
  form,
  result,
  onClear,
}: Props & {
  result: { value: string; expiration?: string };
  onClear: () => void;
}) {
  const resultRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!resultRef.current) return;

    resultRef.current.value = result.value;
  }, [result]);

  return (
    <>
      <div className="flex w-full">
        <div className="w-5 flex-auto">
          <TextareaGreyCopy
            label="Result"
            placeholder="result token or error"
            className="[resize:none]"
            readOnly
            ref={resultRef}
            showCopy={!!result}
            message={
              result?.expiration ? `Valid util: ${result.expiration}` : ''
            }
          />
        </div>
      </div>

      <div className="flex w-full gap-x-2">
        <Button type="submit">Generate</Button>
        <Button
          type="button"
          onClick={() => {
            form.reset();
            onClear();
          }}
        >
          Clear
        </Button>
      </div>
    </>
  );
}

const formSchema = z.object({
  privateKey: z.string().min(1, {
    message: 'Private Key is required.',
  }),
  passphrase: z.string(),
  encoded: z.boolean(),
  alg: z.enum(['HS', 'RS']),
  hash: z.enum(['256', '384', '512']),
  iss: z.string().min(3, {
    message: 'Issuer is required.',
  }),
  aud: z.string().min(3, {
    message: 'Audience is required.',
  }),
  sub: z.string().min(3, {
    message: 'Subject is required.',
  }),
  others: z.string(),
  expiration: z.string().min(2, { message: 'Expiration is required.' }),
});

export default function Component() {
  const [result, setResult] = useState('');
  const [expiration, setExpiration] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      privateKey: '',
      passphrase: '',
      encoded: false,
      iss: '',
      aud: '',
      sub: '',
      others: '',
      expiration: '',
      alg: 'RS',
      hash: '384',
    },
  });

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    const others = Object.fromEntries(
      values.others
        .replace(/;$/, '')
        .split(';')
        .map((pair) => pair.split('='))
    );

    try {
      const [result, expiration]: any = await invoke<{
        token: string;
        expiration: string;
      }>('generate_token_command', {
        claims: {
          iss: values.iss,
          aud: values.aud,
          sub: values.sub,
          ...others,
        },
        expiresIn: values.expiration,
        keyConfig: {
          kind: values.alg === 'RS' ? 'RSA' : 'HMAC',
          base64_encoded: values.encoded,
          passphrase: values.passphrase,
          key_data: values.privateKey,
        },
        algStr: `${values.alg}${values.hash}`,
      });

      setResult(result);
      setExpiration(expiration || '');
    } catch (err) {
      alert(JSON.stringify(err));
    }
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="mt-2 space-y-3"
        >
          <KeyOptions form={form} />
          <div className="border-b"></div>
          <TokenProperties form={form} />
          <div className="border-b"></div>
          <SubmitAndResult
            form={form}
            result={{ value: result, expiration }}
            onClear={() => setResult('')}
          />
        </form>
      </Form>
    </>
  );
}
