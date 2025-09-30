
'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ArticleForm } from '@/components/admin/article-form';
import { ArticlesTable } from '@/components/admin/articles-table';
import { useArticles } from '@/hooks/use-articles';
import { type Article } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/firebase';

export default function AdminArticlesPage() {
  const { isUserLoading } = useUser();
  const { articles, isLoading: areArticlesLoading, error } = useArticles(!isUserLoading);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  const handleAddClick = () => {
    setEditingArticle(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (article: Article) => {
    setEditingArticle(article);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setEditingArticle(null);
  };
  
  const showLoading = isUserLoading || areArticlesLoading;

  const renderContent = () => {
    if (showLoading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }

    if (error) {
      return <p className="text-destructive">{error.message}</p>;
    }

    if (!articles || articles.length === 0) {
      return (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">No Articles Found</h3>
          <p className="text-muted-foreground mt-2">
              Click the &quot;Add Article&quot; button to create your first one.
          </p>
        </div>
      );
    }
    
    return <ArticlesTable articles={articles} onEdit={handleEditClick} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">Manage Articles</h1>
          <p className="text-muted-foreground mt-2">
            Create, update, and delete your company&apos;s blog articles.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddClick}>
              <Plus className="mr-2 h-4 w-4" />
              Add Article
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingArticle ? 'Edit Article' : 'Add New Article'}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <ArticleForm article={editingArticle} onSuccess={handleSuccess} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {renderContent()}
    </div>
  );
}
