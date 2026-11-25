import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { addDays } from 'date-fns';
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { DatePickerSingle } from '@/components/shared/date-picker';
import { BookCombobox } from '../../book/components/book-combobox';
import { MemberCombobox } from '../../member/components/member-combobox';
import { useBorrowLoan } from '../api/loan.mutation';
import { loanSchema, type LoanValues } from '../schemas/loan.schema';
import { formatDate } from '@/utils/date';

type LoanBorrowDialogProps = {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  hide: () => void;
};

function LoanBorrowDialog({
  open,
  onOpenChange,
  hide,
}: LoanBorrowDialogProps) {
  const form = useForm<LoanValues>({
    resolver: yupResolver(loanSchema),
    mode: 'onChange',
    defaultValues: {
      memberId: '',
      bookId: '',
      dueAt: formatDate(addDays(new Date(), 7), 'yyyy-MM-dd'),
    },
  });

  const borrowApi = useBorrowLoan({
    onSuccess() {
      hide();
      form.reset();
    },
  });

  const save = (values: LoanValues) =>
    toast.promise(borrowApi.mutateAsync(values), {
      loading: 'Borrowing book...',
      success: 'Book borrowed',
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
        <DialogHeader>
          <DialogTitle>Borrow Book</DialogTitle>
        </DialogHeader>

        <form
          id="form-loan-borrow"
          onSubmit={form.handleSubmit(save)}
          className="-mx-4 no-scrollbar max-h-[80vh] overflow-y-auto px-4 pb-2"
        >
          <FieldGroup>
            <Controller
              name="memberId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Member</FieldLabel>
                  <MemberCombobox
                    id={field.name}
                    name={field.name}
                    placeholder="Select member"
                    onValueChange={(member) =>
                      field.onChange(member?.id ?? '')
                    }
                    onBlur={field.onBlur}
                    invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="bookId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Book</FieldLabel>
                  <BookCombobox
                    id={field.name}
                    name={field.name}
                    placeholder="Select book"
                    onValueChange={(book) => field.onChange(book?.id ?? '')}
                    onBlur={field.onBlur}
                    invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="dueAt"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Due date</FieldLabel>
                  <DatePickerSingle
                    id={field.name}
                    value={field.value}
                    onValueChange={(value) => field.onChange(value ?? '')}
                    placeholder="Select due date"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button
            className="w-full"
            type="submit"
            form="form-loan-borrow"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            Borrow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { LoanBorrowDialog };
