'use client';

import { useEffect, useActionState } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { type Service } from '@/lib/definitions';
import { createService, updateService } from '@/lib/actions/services';

type ServiceFormProps = {
  service?: Service | null;
  onSuccess: () => void;
};

export function ServiceForm({ service, onSuccess }: ServiceFormProps) {
  const { toast } = useToast();

  const action = service?.id ? updateService : createService;

  const [state, formAction] = useActionState(action, {
    message: '',
    success: false,
    errors: {},
  });

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: 'Success!',
          description: state.message,
        });
        onSuccess();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: state.message,
        });
      }
    }
  }, [state, toast, onSuccess]);

  return (
    <form
      action={formAction}
      className="space-y-6"
      encType="multipart/form-data"
    >
      {service?.id && (
        <>
          <input type="hidden" name="id" value={service.id} />
          <input
            type="hidden"
            name="prevImageUrl"
            value={service.imageUrl ?? ''}
          />
        </>
      )}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="AI Strategy Consulting"
          defaultValue={service?.title}
          required
        />
        {state.errors?.title && (
          <p className="text-sm text-destructive">{state.errors.title.join(', ')}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="A short description of the service"
          defaultValue={service?.description}
          required
        />
        {state.errors?.description && (
          <p className="text-sm text-destructive">
            {state.errors.description.join(', ')}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="details">Details</Label>
        <Textarea
          id="details"
          name="details"
          placeholder="A more detailed description of the service"
          defaultValue={service?.details}
          rows={5}
        />
        <p className="text-sm text-muted-foreground">
          This will be shown in the "Learn More" dialog.
        </p>
        {state.errors?.details && (
          <p className="text-sm text-destructive">
            {state.errors.details.join(', ')}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="benefits">Key Benefits</Label>
        <Input
          id="benefits"
          name="benefits"
          placeholder="Benefit 1, Benefit 2, Benefit 3"
          defaultValue={service?.benefits?.join(', ')}
        />
        <p className="text-sm text-muted-foreground">
          Enter a comma-separated list of key benefits.
        </p>
        {state.errors?.benefits && (
          <p className="text-sm text-destructive">
            {state.errors.benefits.join(', ')}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price</Label>
        <Input
          id="price"
          name="price"
          placeholder="Starting at $5,000"
          defaultValue={service?.price}
        />
        {state.errors?.price && (
          <p className="text-sm text-destructive">{state.errors.price.join(', ')}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          name="imageUrl"
          placeholder="https://example.com/image.jpg"
          defaultValue={service?.imageUrl}
        />
        <p className="text-sm text-muted-foreground">
          Provide a full web link to an image for the service, or upload a file
          below.
        </p>
        {state.errors?.imageUrl && (
          <p className="text-sm text-destructive">
            {state.errors.imageUrl.join(', ')}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageFile">Or Upload Image</Label>
        <Input id="imageFile" name="imageFile" type="file" accept="image/*" />
        <p className="text-sm text-muted-foreground">
          This will override the Image URL if both are provided.
        </p>
        {state.errors?.imageFile && (
          <p className="text-sm text-destructive">
            {state.errors.imageFile.join(', ')}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2 rounded-md border p-4">
        <Checkbox
          id="featured"
          name="featured"
          defaultChecked={service?.featured}
        />
        <Label htmlFor="featured" className="text-sm font-medium leading-none">
          Feature on homepage
        </Label>
      </div>

      <Button type="submit" className="w-full sm:w-auto">
        {service?.id ? 'Save Changes' : 'Create Service'}
      </Button>
    </form>
  );
}
