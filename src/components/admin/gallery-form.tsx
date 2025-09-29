'use client';

import { useEffect, useActionState } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { type GalleryImage } from '@/lib/definitions';
import {
  createGalleryImage,
  updateGalleryImage,
} from '@/lib/actions/gallery';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type GalleryFormProps = {
  image?: GalleryImage | null;
  onSuccess: () => void;
};

export function GalleryForm({ image, onSuccess }: GalleryFormProps) {
  const { toast } = useToast();

  const action = image?.id ? updateGalleryImage : createGalleryImage;
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
      encType="multipart/form-data"
      className="space-y-6"
    >
      {image?.id && (
        <>
          <input type="hidden" name="id" value={image.id} />
          <input
            type="hidden"
            name="prevImageUrl"
            value={image.imageUrl ?? ''}
          />
        </>
      )}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="Team Collaboration"
          defaultValue={image?.title}
          required
        />
        {state.errors?.title && (
          <p className="text-sm text-destructive">{state.errors.title.join(', ')}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          name="category"
          defaultValue={image?.category || 'Tech Solutions'}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Events">Events</SelectItem>
            <SelectItem value="Tech Solutions">Tech Solutions</SelectItem>
            <SelectItem value="Team Collaboration">Team Collaboration</SelectItem>
          </SelectContent>
        </Select>
        {state.errors?.category && (
          <p className="text-sm text-destructive">
            {state.errors.category.join(', ')}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageFile">Image</Label>
        <Input id="imageFile" name="imageFile" type="file" accept="image/*" />
        <p className="text-sm text-muted-foreground">
          {image?.id
            ? 'Upload a new image to replace the existing one.'
            : 'An image file is required.'}
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
          defaultChecked={image?.featured}
        />
        <Label htmlFor="featured" className="text-sm font-medium leading-none">
          Feature on homepage
        </Label>
      </div>

      <Button type="submit" className="w-full sm:w-auto">
        {image?.id ? 'Save Changes' : 'Create Image'}
      </Button>
    </form>
  );
}
