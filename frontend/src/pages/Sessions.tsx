import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { sessionsAPI, matchingAPI } from '@/lib/api';
import type { Session as SessionType } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Checkbox } from '@/components/ui/checkbox';
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
  Loader2,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const createSessionSchema = z.object({
  students: z.array(z.string().min(1, 'Student is required')).min(1, 'Select at least one student'),
  skill: z.string().min(1, 'Skill is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes').max(480, 'Duration cannot exceed 8 hours'),
  sessionType: z.enum(['in-person', 'online', 'hybrid']).default('online'),
  location: z.string().optional(),
  meetingLink: z.string().url('Invalid meeting link').optional().or(z.literal('')),
});

type CreateSessionForm = z.infer<typeof createSessionSchema>;

const Sessions: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch sessions
  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => sessionsAPI.getAll().then(res => res.data.data),
  });


  const offeredSkills = useMemo(() => user?.skillsOffered ?? [], [user]);


  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: CreateSessionForm) => {
      const { students, ...sessionData } = data;
      return Promise.all(
        students.map((studentId) =>
          sessionsAPI.create({ ...sessionData, student: studentId })
        )
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      const count = variables.students.length;
      toast.success(`${count} session${count > 1 ? 's' : ''} created successfully!`);
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      const serverMessage = error.response?.data?.message || error.response?.data?.error;
      console.error('Session creation failed', error.response?.data || error);
      toast.error(serverMessage || 'Failed to create session');
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

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => sessionsAPI.remove(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session deleted');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete session');
    },
  });

  const form = useForm<CreateSessionForm>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      students: [],
      skill: '',
      title: '',
      description: '',
      scheduledDate: '',
      duration: 60,
      sessionType: 'online',
      location: '',
      meetingLink: '',
    },
  });

  const selectedSkill = form.watch('skill');

  useEffect(() => {
    form.setValue('students', [], { shouldDirty: false, shouldTouch: false, shouldValidate: false });
  }, [selectedSkill, form]);

  useEffect(() => {
    if (!selectedSkill) return;
    const stillOffered = offeredSkills.some((skill) => skill._id === selectedSkill);
    if (!stillOffered) {
      form.setValue('skill', '', { shouldDirty: false, shouldTouch: false, shouldValidate: false });
      form.setValue('students', [], { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    }
  }, [selectedSkill, offeredSkills, form]);

  const { data: learnerPartners, isFetching: isLoadingLearners } = useQuery({
    queryKey: ['skill-learners', selectedSkill],
    queryFn: () =>
      matchingAPI
        .getSkillPartners(selectedSkill!, { matchType: 'learners', limit: 50 })
        .then((res) => res.data.data.partners),
    enabled: !!selectedSkill,
    staleTime: 5 * 60 * 1000,
  });

  const learnerOptions = learnerPartners?.filter((partner) => partner.matchType === 'learner') ?? [];

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

  const formatDuration = (minutes?: number) => {
    if (!minutes || minutes <= 0) return 'N/A';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs && mins) {
      return `${hrs}h ${mins}m`;
    }
    if (hrs) {
      return `${hrs} hr${hrs > 1 ? 's' : ''}`;
    }
    return `${minutes} min${minutes > 1 ? 's' : ''}`;
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

  const renderSessionCard = (session: SessionType) => {
    const isSessionStudent = user?._id === session.student?._id;
    const isSessionTeacher = user?._id === session.teacher?._id;
    const showMeetingLink = Boolean(session.meetingLink);
    const canDeleteSession = session.status === 'cancelled' && (isSessionStudent || isSessionTeacher);

    return (
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

            <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDuration(session.duration)}
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

            {showMeetingLink && (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Video className="h-4 w-4" />
                    <span>Meeting link</span>
                  </div>
                  <Button asChild size="sm" variant="secondary">
                    <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                      Join call
                    </a>
                  </Button>
                </div>
                <p className="mt-2 break-all text-xs text-muted-foreground">{session.meetingLink}</p>
              </div>
            )}

            {session.status === 'pending' && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                {isSessionStudent && (
                  <Button
                    size="sm"
                    onClick={() => confirmSessionMutation.mutate(session._id)}
                    disabled={confirmSessionMutation.isPending}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirm
                  </Button>
                )}
                {(isSessionStudent || isSessionTeacher) && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => cancelSessionMutation.mutate(session._id)}
                    disabled={cancelSessionMutation.isPending}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                )}
                {!isSessionStudent && (
                  <p className="text-xs text-muted-foreground">
                    Waiting for {session.student.fullName.split(' ')[0] || session.student.fullName} to confirm.
                  </p>
                )}
              </div>
            )}

            {canDeleteSession && (
              <div className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm">
                <p className="text-destructive">This session was cancelled. Remove it permanently?</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => deleteSessionMutation.mutate(session._id)}
                  disabled={deleteSessionMutation.isPending}
                >
                  {deleteSessionMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete
                </Button>
              </div>
            )}

            {session.status === 'completed' && (
              <div className="flex items-center gap-2">
                {session.teacherRating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Rating: {session.teacherRating}/5</span>
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
    );
  };

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
          <DialogContent className="w-full max-w-3xl rounded-3xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Session</DialogTitle>
              <DialogDescription>
                Schedule a new skill exchange session
              </DialogDescription>
            </DialogHeader>
            {!offeredSkills.length && (
              <div className="rounded-lg border border-dashed border-muted p-4 text-sm text-muted-foreground">
                You haven&apos;t added any skills to your profile yet. Add at least one offered skill to start creating sessions.
              </div>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="students"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Students</FormLabel>
                        <FormControl>
                          <div className="space-y-2 rounded-lg border p-3 max-h-56 overflow-y-auto bg-muted/30">
                            {!selectedSkill && (
                              <p className="text-sm text-muted-foreground">
                                Pick a skill to load eligible students.
                              </p>
                            )}
                            {selectedSkill && isLoadingLearners && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading learners...
                              </div>
                            )}
                            {selectedSkill && !isLoadingLearners && learnerOptions.length === 0 && (
                              <p className="text-sm text-muted-foreground">
                                No learners are currently requesting this skill.
                              </p>
                            )}
                            {learnerOptions.map(({ user }) => {
                              const checked = field.value?.includes(user._id);
                              return (
                                <label
                                  key={user._id}
                                  className="flex items-start gap-3 rounded-md border border-transparent px-2 py-1.5 hover:bg-muted"
                                >
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(isChecked) => {
                                      const nextChecked = Boolean(isChecked);
                                      if (nextChecked) {
                                        field.onChange([...(field.value || []), user._id]);
                                      } else {
                                        field.onChange((field.value || []).filter((id) => id !== user._id));
                                      }
                                    }}
                                    disabled={!selectedSkill || isLoadingLearners}
                                  />
                                  <div className="flex flex-col text-sm">
                                    <span className="font-medium">{user.fullName}</span>
                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Select one or more students who are actively seeking this skill.
                        </FormDescription>
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
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={!offeredSkills.length}
                          >
                            <SelectTrigger>
                              {field.value ? (
                                <SelectValue />
                              ) : (
                                <span className="text-muted-foreground">
                                  {offeredSkills.length
                                    ? 'Select one of your offered skills'
                                    : 'Add skills to your profile to create sessions'}
                                </span>
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              {offeredSkills.map((skill) => (
                                <SelectItem key={skill._id} value={skill._id}>
                                  {skill.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          Only skills you currently offer are available for new sessions.
                        </FormDescription>
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

                <div className="grid gap-4 md:grid-cols-2">
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
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={15}
                            max={480}
                            step={15}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="sessionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Session Type</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
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
                </div>

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

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="submit"
                    disabled={createSessionMutation.isPending || !offeredSkills.length}
                  >
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
            {sessions.map(renderSessionCard)}

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
            {sessions.filter(s => s.status === 'pending').map(renderSessionCard)}

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
            {sessions.filter(s => s.status === 'confirmed').map(renderSessionCard)}

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
            {sessions.filter(s => s.status === 'completed').map(renderSessionCard)}

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
