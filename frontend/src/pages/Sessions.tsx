import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { sessionsAPI, userAPI, skillsAPI } from '@/lib/api';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Users, 
  Plus,
  CheckCircle,
  XCircle,
  Star,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const createSessionSchema = z.object({
  student: z.string().min(1, 'Student is required'),
  skill: z.string().min(1, 'Skill is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  duration: z.number().min(1, 'Duration must be at least 1 hour'),
  sessionType: z.enum(['in-person', 'online', 'hybrid']).default('online'),
  location: z.string().optional(),
  meetingLink: z.string().url('Invalid meeting link').optional().or(z.literal('')),
});

type CreateSessionForm = z.infer<typeof createSessionSchema>;

const Sessions: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch sessions
  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => sessionsAPI.getAll().then(res => res.data.data),
  });

  // Fetch users for student selection
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => userAPI.getProfile().then(res => res.data.data), // This would need to be adjusted based on your API
  });

  // Fetch skills for selection
  const { data: skills } = useQuery({
    queryKey: ['skills'],
    queryFn: () => skillsAPI.getAll({ limit: 100 }).then(res => res.data.data.skills),
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: (data: CreateSessionForm) => sessionsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session created successfully!');
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create session');
    },
  });

  // Confirm session mutation
  const confirmSessionMutation = useMutation({
    mutationFn: (sessionId: string) => sessionsAPI.confirm(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session confirmed!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to confirm session');
    },
  });

  // Cancel session mutation
  const cancelSessionMutation = useMutation({
    mutationFn: (sessionId: string) => sessionsAPI.cancel(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session cancelled!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel session');
    },
  });

  const form = useForm<CreateSessionForm>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      student: '',
      skill: '',
      title: '',
      description: '',
      scheduledDate: '',
      duration: 1,
      sessionType: 'online',
      location: '',
      meetingLink: '',
    },
  });

  const onSubmit = (data: CreateSessionForm) => {
    createSessionMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
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
              <BreadcrumbPage>Sessions</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-5">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="h-4 w-52 mt-2" />
                </div>
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-80" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const sessions = sessionsData?.sessions || [];

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
            <BreadcrumbPage>Sessions</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-gradient">Sessions</h1>
          <p className="text-muted-foreground mt-2">
            Manage your learning and teaching sessions
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Session</DialogTitle>
              <DialogDescription>
                Schedule a new skill exchange session
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="student"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Student email or ID" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="skill"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skill</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a skill" />
                            </SelectTrigger>
                            <SelectContent>
                              {skills?.map((skill) => (
                                <SelectItem key={skill._id} value={skill._id}>
                                  {skill.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter session title" />
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
                        <Textarea {...field} placeholder="Describe what will be covered in this session" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="scheduledDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scheduled Date</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (hours)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="sessionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Type</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="online">Online</SelectItem>
                            <SelectItem value="in-person">In-Person</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (if in-person)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="meetingLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meeting Link (if online)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://meet.google.com/..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" disabled={createSessionMutation.isPending}>
                    {createSessionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Session
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

      {/* Sessions Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Sessions</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid gap-4">
            {sessions.map((session) => (
              <Card key={session._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{session.title}</CardTitle>
                      <CardDescription>
                        {session.skill.name} • {format(new Date(session.scheduledDate), 'PPP')}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(session.status)}>
                      {getStatusIcon(session.status)}
                      <span className="ml-1 capitalize">{session.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">{session.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {session.duration} hours
                      </div>
                      <div className="flex items-center gap-1">
                        {session.sessionType === 'online' ? (
                          <Video className="h-4 w-4" />
                        ) : (
                          <MapPin className="h-4 w-4" />
                        )}
                        {session.sessionType}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {session.teacher.fullName} → {session.student.fullName}
                      </div>
                    </div>

                    {session.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => confirmSessionMutation.mutate(session._id)}
                          disabled={confirmSessionMutation.isPending}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => cancelSessionMutation.mutate(session._id)}
                          disabled={cancelSessionMutation.isPending}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    )}

                    {session.status === 'completed' && (
                      <div className="flex items-center gap-2">
                        {session.teacherRating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{session.teacherRating}/5</span>
                          </div>
                        )}
                        {session.teacherFeedback && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span className="text-sm">{session.teacherFeedback}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {sessions.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No sessions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first session to start learning and teaching
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Session
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="grid gap-4">
            {sessions.filter(s => s.status === 'pending').map((session) => (
              <Card key={session._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{session.title}</CardTitle>
                      <CardDescription>
                        {session.skill.name} • {format(new Date(session.scheduledDate), 'PPP')}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(session.status)}>
                      {getStatusIcon(session.status)}
                      <span className="ml-1 capitalize">{session.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">{session.description}</p>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => confirmSessionMutation.mutate(session._id)}
                        disabled={confirmSessionMutation.isPending}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => cancelSessionMutation.mutate(session._id)}
                        disabled={cancelSessionMutation.isPending}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {sessions.filter(s => s.status === 'pending').length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No pending sessions</h3>
                  <p className="text-muted-foreground">
                    All your sessions are confirmed or completed
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="confirmed">
          <div className="grid gap-4">
            {sessions.filter(s => s.status === 'confirmed').map((session) => (
              <Card key={session._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{session.title}</CardTitle>
                      <CardDescription>
                        {session.skill.name} • {format(new Date(session.scheduledDate), 'PPP')}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(session.status)}>
                      {getStatusIcon(session.status)}
                      <span className="ml-1 capitalize">{session.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">{session.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {session.duration} hours
                      </div>
                      <div className="flex items-center gap-1">
                        {session.sessionType === 'online' ? (
                          <Video className="h-4 w-4" />
                        ) : (
                          <MapPin className="h-4 w-4" />
                        )}
                        {session.sessionType}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {sessions.filter(s => s.status === 'confirmed').length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No confirmed sessions</h3>
                  <p className="text-muted-foreground">
                    No sessions are currently confirmed
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid gap-4">
            {sessions.filter(s => s.status === 'completed').map((session) => (
              <Card key={session._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{session.title}</CardTitle>
                      <CardDescription>
                        {session.skill.name} • {format(new Date(session.scheduledDate), 'PPP')}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(session.status)}>
                      {getStatusIcon(session.status)}
                      <span className="ml-1 capitalize">{session.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">{session.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {session.duration} hours
                      </div>
                      <div className="flex items-center gap-1">
                        {session.sessionType === 'online' ? (
                          <Video className="h-4 w-4" />
                        ) : (
                          <MapPin className="h-4 w-4" />
                        )}
                        {session.sessionType}
                      </div>
                    </div>

                    {session.teacherRating && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">Rating: {session.teacherRating}/5</span>
                        </div>
                        {session.teacherFeedback && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span className="text-sm">{session.teacherFeedback}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {sessions.filter(s => s.status === 'completed').length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No completed sessions</h3>
                  <p className="text-muted-foreground">
                    Complete your first session to see it here
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Sessions;
