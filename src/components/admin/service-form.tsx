'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { type Service } from '@/lib/definitions';
import { createService, updateService, type ServiceFormState } from '@/lib/actions/services';

type ServiceFormProps = {
  service?: Service | null;
  onSuccess: () => void;
};

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isEditing ? 'Save Changes' : 'Create Service'}
    </Button>
  );
}

export function ServiceForm({ service, onSuccess }: ServiceFormProps) {
  const { toast } = useToast();
  const action = service?.id ? updateService : createService;

  const [state, formAction] = useActionState<ServiceFormState, FormData>(action, {
    message: '',
    success: false,
    errors: {},
  });

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({ title: 'Success!', description: state.message });
        onSuccess();
      } else {
        toast({ variant: 'destructive', title: 'Error', description: state.message });
      }
    }
  }, [state, toast, onSuccess]);

  return (
    <form action={formAction} className="space-y-6">
      {service?.id && <input type="hidden" name="id" value={service.id} />}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="AI Strategy Consulting" defaultValue={service?.title} required />
        {state.errors?.title && <p className="text-sm text-destructive">{state.errors.title.join(', ')}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" placeholder="A short description of the service" defaultValue={service?.description} required />
        {state.errors?.description && <p className="text-sm text-destructive">{state.errors.description.join(', ')}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="details">Details (in Dialog)</Label>
        <Textarea id="details" name="details" placeholder="A more detailed description of the service for the dialog." defaultValue={service?.details} rows={5} />
        {state.errors?.details && <p className="text-sm text-destructive">{state.errors.details.join(', ')}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="benefits">Key Benefits</Label>
        <Input id="benefits" name="benefits" placeholder="Benefit 1, Benefit 2, Benefit 3" defaultValue={service?.benefits?.join(', ')} />
        <p className="text-sm text-muted-foreground">Enter a comma-separated list of key benefits.</p>
        {state.errors?.benefits && <p className="text-sm text-destructive">{state.errors.benefits.join(', ')}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price</Label>
        <Input id="price" name="price" placeholder="Starting at $5,000" defaultValue={service?.price} />
        {state.errors?.price && <p className="text-sm text-destructive">{state.errors.price.join(', ')}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageFile">Service Image</Label>
        <Input id="imageFile" name="imageFile" type="file" accept="image/*" />
        <p className="text-sm text-muted-foreground">
          {service?.id ? "Upload a new image to replace the current one." : "Image is optional."}
        </p>
        {state.errors?.imageFile && <p className="text-sm text-destructive">{state.errors.imageFile.join(', ')}</p>}
      </div>

      <div className="flex items-center space-x-2 rounded-md border p-4">
        <Checkbox id="featured" name="featured" defaultChecked={service?.featured} />
        <Label htmlFor="featured" className="text-sm font-medium leading-none">Feature on homepage</Label>
      </div>

      <SubmitButton isEditing={!!service?.id} />
    </form>
  );
}
