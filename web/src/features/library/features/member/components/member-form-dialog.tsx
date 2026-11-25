import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { LoadingOverlay } from '@/components/shared/loading';
import { NotFoundResourceEmpty } from '@/components/shared/not-found-empty';
import { useCreateMember, useUpdateMember } from '../api/member.mutation';
import { useMember } from '../api/member.query';
import {
  memberSchema,
  type MemberValues,
} from '../schemas/member.schema';

type MemberFormDialogPayload = { id: string };

type MemberFormDialogProps = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  hide: () => void;
  payload?: MemberFormDialogPayload;
};

function MemberFormDialog({
  open,
  onOpenChange,
  hide,
  payload,
}: MemberFormDialogProps) {
  const editing = !!payload;

  const { data, isLoading } = useMember(payload?.id ?? '', {
    enabled: editing && open,
  });

  const form = useForm<MemberValues>({
    resolver: yupResolver(memberSchema),
    mode: 'onChange',
    defaultValues: {
      code: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      active: true,
    },
    values: data
      ? {
          code: data.code,
          name: data.name,
          email: data.email ?? '',
          phone: data.phone ?? '',
          address: data.address ?? '',
          active: data.active,
        }
      : undefined,
  });

  const createApi = useCreateMember({
    onSuccess() {
      hide();
      form.reset();
    },
  });

  const updateApi = useUpdateMember({
    onSuccess() {
      hide();
      form.reset();
    },
  });

  const save = (values: MemberValues) =>
    payload
      ? toast.promise(updateApi.mutateAsync({ id: payload.id, values }), {
          loading: 'Updating member...',
          success: 'Member updated',
        })
      : toast.promise(createApi.mutateAsync(values), {
          loading: 'Creating member...',
          success: 'Member created',
        });

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) form.reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        {isLoading && <LoadingOverlay />}

        <DialogHeader>
          <DialogTitle>
            {editing ? 'Update Member' : 'Create Member'}
          </DialogTitle>
        </DialogHeader>

        {editing && !data && !isLoading && open ? (
          <NotFoundResourceEmpty resource="Member" />
        ) : (
          <>
            <form
              id="form-member"
              onSubmit={form.handleSubmit(save)}
              className="-mx-4 no-scrollbar max-h-[80vh] overflow-y-auto px-4 pb-2"
            >
              <FieldGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field data-invalid={!!form.formState.errors.code}>
                    <FieldLabel htmlFor="code">Code</FieldLabel>
                    <Input
                      id="code"
                      aria-invalid={!!form.formState.errors.code}
                      {...form.register('code')}
                    />
                    {form.formState.errors.code && (
                      <FieldError errors={[form.formState.errors.code]} />
                    )}
                  </Field>

                  <Field data-invalid={!!form.formState.errors.name}>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <Input
                      id="name"
                      aria-invalid={!!form.formState.errors.name}
                      {...form.register('name')}
                    />
                    {form.formState.errors.name && (
                      <FieldError errors={[form.formState.errors.name]} />
                    )}
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field data-invalid={!!form.formState.errors.email}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      aria-invalid={!!form.formState.errors.email}
                      {...form.register('email')}
                    />
                    {form.formState.errors.email && (
                      <FieldError errors={[form.formState.errors.email]} />
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="phone">Phone</FieldLabel>
                    <Input id="phone" {...form.register('phone')} />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="address">Address</FieldLabel>
                  <Textarea
                    id="address"
                    rows={3}
                    {...form.register('address')}
                  />
                </Field>

                <Controller
                  name="active"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      orientation="horizontal"
                      data-invalid={fieldState.invalid}
                    >
                      <FieldContent>
                        <FieldLabel htmlFor={field.name}>Active</FieldLabel>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </FieldContent>
                      <Switch
                        name={field.name}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                      />
                    </Field>
                  )}
                />
              </FieldGroup>
            </form>

            <DialogFooter>
              <Button
                className="w-full"
                type="submit"
                form="form-member"
                disabled={
                  !form.formState.isValid ||
                  form.formState.isSubmitting ||
                  isLoading
                }
              >
                Save
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export { MemberFormDialog };
export type { MemberFormDialogPayload };
