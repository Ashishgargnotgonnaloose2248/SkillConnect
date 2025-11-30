import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI, skillsAPI } from '@/lib/api';
import { 
  User, 
  Mail, 
  Linkedin, 
  BookOpen, 
  Target, 
  Plus, 
  X,
  Edit,
  Save,
  Loader2,
  Search
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
});

type ProfileForm = z.infer<typeof profileSchema>;

const Profile: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [seekingSkillSearch, setSeekingSkillSearch] = useState('');
  const [seekingSkillCategory, setSeekingSkillCategory] = useState<string>('all');
  const [animatedPercent, setAnimatedPercent] = useState(0);

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => userAPI.getProfile().then(res => res.data.data),
  });

  // Fetch all skills for selection (for Skills I Offer)
  const { data: allSkills } = useQuery({
    queryKey: ['all-skills'],
    queryFn: () => skillsAPI.getAll({ limit: 100 }).then(res => res.data.data.skills),
  });

  // Fetch categories for filtering
  const { data: categories } = useQuery({
    queryKey: ['skill-categories'],
    queryFn: () => skillsAPI.getCategories().then(res => res.data.data),
  });

  // Fetch all skills for Skills I Seek (with higher limit and search/filter)
  const { data: allSkillsForSeeking } = useQuery({
    queryKey: ['all-skills-seeking', seekingSkillSearch, seekingSkillCategory],
    queryFn: () => skillsAPI.getAll({
      limit: 100, // API caps limit at 100 via validation
      ...(seekingSkillSearch.trim().length >= 2 ? { search: seekingSkillSearch.trim() } : {}),
      ...(seekingSkillCategory !== 'all' ? { category: seekingSkillCategory } : {}),
    }).then(res => res.data.data.skills),
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileForm) => userAPI.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  // Add offered skill mutation
  const addOfferedSkillMutation = useMutation({
    mutationFn: (skillId: string) => userAPI.addOfferedSkill(skillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Skill added to offered skills!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add skill');
    },
  });

  // Add seeking skill mutation
  const addSeekingSkillMutation = useMutation({
    mutationFn: (skillId: string) => userAPI.addSeekingSkill(skillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Skill added to seeking skills!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add skill');
    },
  });

  // Remove offered skill mutation
  const removeOfferedSkillMutation = useMutation({
    mutationFn: (skillId: string) => userAPI.removeOfferedSkill(skillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Skill removed from offered skills!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove skill');
    },
  });

  // Remove seeking skill mutation
  const removeSeekingSkillMutation = useMutation({
    mutationFn: (skillId: string) => userAPI.removeSeekingSkill(skillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Skill removed from seeking skills!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove skill');
    },
  });

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile?.fullName || '',
      email: profile?.email || '',
      linkedin: profile?.linkedin || '',
    },
  });

  // Update form when profile data changes
  React.useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.fullName,
        email: profile.email,
        linkedin: profile.linkedin || '',
      });
    }
  }, [profile, form]);

  // Animate progress bar when percentage changes
  React.useEffect(() => {
    if (profile) {
      const filled = [
        !!profile?.fullName,
        !!profile?.email,
        typeof profile?.linkedin === 'string' ? profile.linkedin.length > 0 : false,
        (profile?.skillsOffered?.length || 0) > 0,
        (profile?.skillsSeeking?.length || 0) > 0,
      ];
      const targetPercent = Math.round((filled.filter(Boolean).length / filled.length) * 100);
      
      // Initialize on first load
      if (animatedPercent === 0 && targetPercent > 0) {
        setAnimatedPercent(targetPercent);
        return;
      }
      
      // Only animate if target is different from current
      if (targetPercent === animatedPercent) return;
      
      // Animate from current to target
      const duration = 600;
      const steps = 30;
      const increment = (targetPercent - animatedPercent) / steps;
      let current = animatedPercent;
      
      const id = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= targetPercent) || (increment < 0 && current <= targetPercent)) {
          setAnimatedPercent(targetPercent);
          clearInterval(id);
        } else {
          setAnimatedPercent(Math.round(current));
        }
      }, duration / steps);
      
      return () => clearInterval(id);
    }
  }, [
    profile?.fullName,
    profile?.email,
    profile?.linkedin,
    profile?.skillsOffered?.length,
    profile?.skillsSeeking?.length,
    animatedPercent,
  ]);

  const onSubmit = (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  const handleAddOfferedSkill = (skillId: string) => {
    addOfferedSkillMutation.mutate(skillId);
  };

  const handleAddSeekingSkill = (skillId: string) => {
    addSeekingSkillMutation.mutate(skillId);
  };

  const handleRemoveOfferedSkill = (skillId: string) => {
    removeOfferedSkillMutation.mutate(skillId);
  };

  const handleRemoveSeekingSkill = (skillId: string) => {
    removeSeekingSkillMutation.mutate(skillId);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border p-6">
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-48 mt-2" />
                <Skeleton className="h-5 w-16 mt-2" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <BreadcrumbPage>Profile</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-gradient">Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your profile and skills
          </p>
        </div>
        {/* Profile completion indicator */}
        <div className="hidden md:flex flex-col items-end gap-2">
          {(() => {
            const completionItems = [
              { label: 'Full Name', completed: !!profile?.fullName },
              { label: 'Email', completed: !!profile?.email },
              { label: 'LinkedIn', completed: typeof profile?.linkedin === 'string' ? profile.linkedin.length > 0 : false },
              { label: 'Skills Offered', completed: (profile?.skillsOffered?.length || 0) > 0 },
              { label: 'Skills Seeking', completed: (profile?.skillsSeeking?.length || 0) > 0 },
            ];
            const filled = completionItems.map(item => item.completed);
            const percent = Math.round((filled.filter(Boolean).length / filled.length) * 100);
            const missingItems = completionItems.filter(item => !item.completed).map(item => item.label);
            
            // Color coding based on completion
            const getProgressColor = () => {
              if (percent >= 80) return 'bg-green-500';
              if (percent >= 60) return 'bg-blue-500';
              if (percent >= 40) return 'bg-yellow-500';
              return 'bg-orange-500';
            };
            
            const getTextColor = () => {
              if (percent >= 80) return 'text-green-600 dark:text-green-400';
              if (percent >= 60) return 'text-blue-600 dark:text-blue-400';
              if (percent >= 40) return 'text-yellow-600 dark:text-yellow-400';
              return 'text-orange-600 dark:text-orange-400';
            };

            return (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-end gap-2 cursor-help">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Profile completion</span>
                        <span className={`font-bold text-lg ${getTextColor()}`}>
                          {animatedPercent}%
                        </span>
                      </div>
                      <div className="w-[240px]">
                        <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary/50">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ease-out ${getProgressColor()}`}
                            style={{ width: `${animatedPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <div className="space-y-2">
                      <p className="font-semibold">Profile Completion</p>
                      <div className="space-y-1 text-xs">
                        {completionItems.map((item, index) => (
                          <div key={index} className="flex items-center gap-2">
                            {item.completed ? (
                              <span className="text-green-500">✓</span>
                            ) : (
                              <span className="text-gray-400">○</span>
                            )}
                            <span className={item.completed ? 'text-foreground' : 'text-muted-foreground'}>
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                      {missingItems.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            Complete: {missingItems.join(', ')} to improve your profile
                          </p>
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })()}
        </div>
        <Button
          variant={isEditing ? "default" : "outline"}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="offered">Skills I Offer</TabsTrigger>
          <TabsTrigger value="seeking">Skills I Seek</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-lg">
                    {profile?.fullName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{profile?.fullName}</h3>
                  <p className="text-muted-foreground">{profile?.email}</p>
                  <Badge variant={profile?.isVerified ? "default" : "secondary"}>
                    {profile?.isVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn Profile</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} placeholder="https://linkedin.com/in/yourprofile" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isEditing && (
                    <div className="flex gap-2">
                      <Button type="submit" disabled={updateProfileMutation.isPending}>
                        {updateProfileMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills I Offer Tab */}
        <TabsContent value="offered">
          <Card>
            <CardHeader>
              <CardTitle>Skills I Offer</CardTitle>
              <CardDescription>
                Manage the skills you can teach to others
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current Offered Skills */}
                <div>
                  <h4 className="font-medium mb-3">Current Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile?.skillsOffered?.map((skill) => (
                      <Badge key={skill._id} variant="secondary" className="flex items-center gap-1">
                        {skill.name}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-destructive"
                          onClick={() => handleRemoveOfferedSkill(skill._id)}
                        />
                      </Badge>
                    ))}
                    {(!profile?.skillsOffered || profile.skillsOffered.length === 0) && (
                      <p className="text-muted-foreground">No skills added yet</p>
                    )}
                  </div>
                </div>

                {/* Add New Skill */}
                <div>
                  <h4 className="font-medium mb-3">Add New Skill</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {allSkills?.map((skill) => (
                      <div key={skill._id} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{skill.name}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddOfferedSkill(skill._id)}
                          disabled={profile?.skillsOffered?.some(s => s._id === skill._id)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills I Seek Tab */}
        <TabsContent value="seeking">
          <Card>
            <CardHeader>
              <CardTitle>Skills I Seek</CardTitle>
              <CardDescription>
                Manage the skills you want to learn from others
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current Seeking Skills */}
                <div>
                  <h4 className="font-medium mb-3">Current Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile?.skillsSeeking?.map((skill) => (
                      <Badge key={skill._id} variant="secondary" className="flex items-center gap-1">
                        {skill.name}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-destructive"
                          onClick={() => handleRemoveSeekingSkill(skill._id)}
                        />
                      </Badge>
                    ))}
                    {(!profile?.skillsSeeking || profile.skillsSeeking.length === 0) && (
                      <p className="text-muted-foreground">No skills added yet</p>
                    )}
                  </div>
                </div>

                {/* Search and Filter for Skills I Seek */}
                <div>
                  <h4 className="font-medium mb-3">Add New Skill</h4>
                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search skills to learn..."
                        value={seekingSkillSearch}
                        onChange={(e) => setSeekingSkillSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={seekingSkillCategory} onValueChange={setSeekingSkillCategory}>
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
                  </div>

                  {/* Available Skills List */}
                  <div className="max-h-[500px] overflow-y-auto border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {allSkillsForSeeking && allSkillsForSeeking.length > 0 ? (
                        allSkillsForSeeking.map((skill) => (
                          <div key={skill._id} className="flex items-center justify-between p-2 border rounded hover:bg-accent transition-colors">
                            <span className="text-sm flex-1">{skill.name}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddSeekingSkill(skill._id)}
                              disabled={profile?.skillsSeeking?.some(s => s._id === skill._id)}
                              className="ml-2"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-8 text-muted-foreground">
                          <p>No skills found. Try adjusting your search or filters.</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Showing {allSkillsForSeeking?.length || 0} available skills
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
