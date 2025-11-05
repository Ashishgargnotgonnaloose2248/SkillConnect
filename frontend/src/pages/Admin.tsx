import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { adminAPI } from '@/lib/api';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Shield,
  BarChart3,
  Settings,
  Loader2,
  Search,
  Filter
} from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';

const rejectSkillSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
});

type RejectSkillForm = z.infer<typeof rejectSkillSchema>;

const Admin: React.FC = () => {
  const queryClient = useQueryClient();
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch admin stats
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminAPI.getStats().then(res => res.data.data),
  });

  // Fetch users
  const { data: usersData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminAPI.getUsers().then(res => res.data.data),
  });

  // Fetch pending skills
  const { data: pendingSkills } = useQuery({
    queryKey: ['admin-pending-skills'],
    queryFn: () => adminAPI.getPendingSkills().then(res => res.data.data),
  });

  // Verify user mutation
  const verifyUserMutation = useMutation({
    mutationFn: (userId: string) => adminAPI.verifyUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('User verified successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to verify user');
    },
  });

  // Deactivate user mutation
  const deactivateUserMutation = useMutation({
    mutationFn: (userId: string) => adminAPI.deactivateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('User deactivated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to deactivate user');
    },
  });

  // Approve skill mutation
  const approveSkillMutation = useMutation({
    mutationFn: (skillId: string) => adminAPI.approveSkill(skillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-skills'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Skill approved successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve skill');
    },
  });

  // Reject skill mutation
  const rejectSkillMutation = useMutation({
    mutationFn: ({ skillId, reason }: { skillId: string; reason: string }) => 
      adminAPI.rejectSkill(skillId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-skills'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Skill rejected successfully!');
      setIsRejectDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject skill');
    },
  });

  const form = useForm<RejectSkillForm>({
    resolver: zodResolver(rejectSkillSchema),
    defaultValues: {
      reason: '',
    },
  });

  const handleRejectSkill = (skillId: string) => {
    setSelectedSkillId(skillId);
    setIsRejectDialogOpen(true);
  };

  const onSubmitReject = (data: RejectSkillForm) => {
    if (selectedSkillId) {
      rejectSkillMutation.mutate({ skillId: selectedSkillId, reason: data.reason });
    }
  };

  const users = usersData?.users || [];
  const skills = pendingSkills || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-gradient">Admin Panel</h1>
          <p className="text-muted-foreground mt-2">
            Manage users, skills, and system analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">Admin Access</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.users.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.users.verified || 0} verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Skills</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.skills.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.skills.active || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.sessions.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.sessions.completed || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Skills</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{skills.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts and verification status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users
                    .filter(user => 
                      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.email.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {user.fullName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{user.fullName}</div>
                            <div className="text-sm text-muted-foreground">
                              {user.linkedin && (
                                <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                  LinkedIn
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.isVerified ? 'default' : 'destructive'}>
                            {user.isVerified ? 'Verified' : 'Unverified'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {!user.isVerified && (
                            <Button
                              size="sm"
                              onClick={() => verifyUserMutation.mutate(user._id)}
                              disabled={verifyUserMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deactivateUserMutation.mutate(user._id)}
                            disabled={deactivateUserMutation.isPending}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>Skill Moderation</CardTitle>
              <CardDescription>
                Review and approve pending skill submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skills.map((skill) => (
                  <Card key={skill._id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{skill.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {skill.description}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => approveSkillMutation.mutate(skill._id)}
                            disabled={approveSkillMutation.isPending}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectSkill(skill._id)}
                            disabled={rejectSkillMutation.isPending}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{skill.category}</Badge>
                        <Badge variant="outline">{skill.difficulty}</Badge>
                        {skill.tags?.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {skills.length === 0 && (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No pending skills</h3>
                    <p className="text-muted-foreground">
                      All skills have been reviewed
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
                <CardDescription>Total vs Verified</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{ total: { label: 'Total', color: 'hsl(var(--brand-blue))' }, verified: { label: 'Verified', color: 'hsl(var(--brand-green))' } }}
                  className="h-64"
                >
                  <BarChart data={[{ name: 'Users', total: stats?.users.total || 0, verified: stats?.users.verified || 0 }]}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="total" fill="var(--color-total)" radius={6} />
                    <Bar dataKey="verified" fill="var(--color-verified)" radius={6} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
                <CardDescription>Total vs Active</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{ total: { label: 'Total', color: 'hsl(var(--brand-purple))' }, active: { label: 'Active', color: 'hsl(var(--brand-sky))' } }}
                  className="h-64"
                >
                  <BarChart data={[{ name: 'Skills', total: stats?.skills.total || 0, active: stats?.skills.active || 0 }]}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="total" fill="var(--color-total)" radius={6} />
                    <Bar dataKey="active" fill="var(--color-active)" radius={6} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sessions</CardTitle>
                <CardDescription>Total vs Completed</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{ total: { label: 'Total', color: 'hsl(var(--brand-lavender))' }, completed: { label: 'Completed', color: 'hsl(var(--brand-green))' } }}
                  className="h-64"
                >
                  <BarChart data={[{ name: 'Sessions', total: stats?.sessions.total || 0, completed: stats?.sessions.completed || 0 }]}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="total" fill="var(--color-total)" radius={6} />
                    <Bar dataKey="completed" fill="var(--color-completed)" radius={6} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Reject Skill Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Skill</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this skill submission
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitReject)} className="space-y-4">
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Rejection</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Explain why this skill is being rejected" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={rejectSkillMutation.isPending}>
                  {rejectSkillMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Reject Skill
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
