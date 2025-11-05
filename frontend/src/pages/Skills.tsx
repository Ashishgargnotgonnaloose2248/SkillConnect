import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { skillsAPI } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Users, 
  BookOpen,
  Target,
  Loader2,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const createSkillSchema = z.object({
  name: z.string().min(2, 'At least 2 characters').max(50, 'Max 50 characters'),
  category: z.enum([
    'programming','graphic-design','web-development','dsa','design','marketing','business','language','music','art','photography','writing','data-science','other'
  ], { required_error: 'Category is required' }),
  description: z.string().min(10, 'At least 10 characters').max(500, 'Max 500 characters'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).default('beginner'),
  tags: z.array(z.string()).optional().default([]),
});

type CreateSkillForm = z.infer<typeof createSkillSchema>;

const Skills: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Fetch skills
  const { data: skillsData, isLoading } = useQuery({
    queryKey: ['skills', searchTerm, selectedCategory, selectedDifficulty],
    queryFn: () => skillsAPI.getAll({
      ...(searchTerm.trim().length >= 2 ? { search: searchTerm.trim() } : {}),
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
    }).then(res => res.data.data),
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['skill-categories'],
    queryFn: () => skillsAPI.getCategories().then(res => res.data.data),
  });

  // Create skill mutation
  const createSkillMutation = useMutation({
    mutationFn: (data: CreateSkillForm) => skillsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      toast.success('Skill created successfully!');
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.errors?.[0] || error.response?.data?.message || 'Failed to create skill';
      toast.error(msg);
    },
  });

  // Delete skill mutation
  const deleteSkillMutation = useMutation({
    mutationFn: (skillId: string) => skillsAPI.delete(skillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      toast.success('Skill deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete skill');
    },
  });

  const form = useForm<CreateSkillForm>({
    resolver: zodResolver(createSkillSchema),
    defaultValues: {
      name: '',
      category: undefined as unknown as any,
      description: '',
      difficulty: 'beginner',
      tags: [],
    },
  });

  const onSubmit = (data: CreateSkillForm) => {
    // Ensure tags is an array and payload matches backend
    const payload: CreateSkillForm = {
      name: data.name.trim(),
      category: data.category,
      description: data.description.trim(),
      difficulty: data.difficulty,
      tags: (data.tags || []).map(t => t.trim()).filter(Boolean),
    };
    createSkillMutation.mutate(payload);
  };

  const handleDeleteSkill = (skillId: string) => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      deleteSkillMutation.mutate(skillId);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-orange-100 text-orange-800';
      case 'expert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-purple-100 text-purple-800',
      'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
    ];
    const index = category.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Skills</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-5 bg-card">
              <div className="flex items-start justify-between">
                <div>
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-56 mt-2" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const skills = skillsData?.skills || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Skills</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-gradient">Skills</h1>
          <p className="text-muted-foreground mt-2">
            Discover and manage skills for learning and teaching
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Skill</DialogTitle>
              <DialogDescription>
                Create a new skill that you can teach or learn
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., JavaScript Programming" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories?.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Describe what this skill involves" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty Level</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" disabled={createSkillMutation.isPending}>
                    {createSkillMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Skill
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
            <SelectItem value="expert">Expert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.map((skill) => (
          <Card key={skill._id} className="card-hover">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{skill.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {skill.description}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => handleDeleteSkill(skill._id)}
                    disabled={deleteSkillMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge className={getCategoryColor(skill.category)}>
                    {skill.category}
                  </Badge>
                  <Badge className={getDifficultyColor(skill.difficulty)}>
                    {skill.difficulty}
                  </Badge>
                </div>

                {skill.tags && skill.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {skill.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>0 learners</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span>4.5</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    <span>Teach</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>Learn</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {skills.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No skills found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Create your first skill to get started'
                  }
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Skill
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Pagination */}
      {skillsData?.pagination && skillsData.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button variant="outline" size="sm" disabled={!skillsData.pagination.hasPrev}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {skillsData.pagination.currentPage} of {skillsData.pagination.totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={!skillsData.pagination.hasNext}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default Skills;
