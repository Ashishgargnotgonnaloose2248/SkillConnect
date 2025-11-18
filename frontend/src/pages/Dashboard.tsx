import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// removed unused Progress and Tabs imports
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Star, 
  Target
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI } from '@/lib/api';
import { matchingAPI, sessionsAPI } from '@/lib/api';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts';

const Dashboard: React.FC = () => {
  const { user, login } = useAuth();
  const [savingAvailability, setSavingAvailability] = React.useState(false);

  const toggleAvailability = async () => {
    if (!user) return;
    try {
      setSavingAvailability(true);
      const payload: Partial<any> = { isAvailable: !user?.isAvailable };
      const updated = await userAPI.updateProfile(payload as any).then(res => res.data.data);
      // Persist updated user in context
      const token = localStorage.getItem('token') || '';
      login(token, updated);
    } catch (e) {
      console.error('Failed to update availability', e);
    } finally {
      setSavingAvailability(false);
    }
  };

  // Fetch matching statistics
  const { data: matchingStats, error: matchingError, isLoading: matchingLoading } = useQuery({
    queryKey: ['matching-stats'],
    queryFn: () => matchingAPI.getStats().then(res => res.data.data),
    retry: false,
  });

  // Fetch session statistics
  const { data: sessionStats, error: sessionError, isLoading: sessionLoading } = useQuery({
    queryKey: ['session-stats'],
    queryFn: () => sessionsAPI.getStats().then(res => res.data.data),
    retry: false,
  });

  // Fetch recent sessions
  const { data: recentSessions, error: sessionsError, isLoading: sessionsLoading } = useQuery({
    queryKey: ['recent-sessions'],
    queryFn: () => sessionsAPI.getAll({ limit: 5 }).then(res => res.data.data.sessions),
    retry: false,
  });

  // Fetch recommendations (matches)
  const { data: matches, isLoading: matchesLoading, error: matchesError } = useQuery({
    queryKey: ['dashboard-matches'],
    queryFn: () => matchingAPI.getMatches({ limit: 5 }).then(res => res.data.data.matches),
    retry: false,
  });

  // Log errors for debugging
  if (matchingError) console.error('Matching stats error:', matchingError);
  if (sessionError) console.error('Session stats error:', sessionError);
  if (sessionsError) console.error('Recent sessions error:', sessionsError);

  // Debug logs removed for production cleanliness

  // Show loading state
  if (matchingLoading || sessionLoading || sessionsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state with fallback data
  if (matchingError || sessionError || sessionsError) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-brand-gradient">
                Welcome back, {user?.fullName}!
              </h1>
              {user?.role === 'admin' && (
                <Badge variant="secondary">Admin</Badge>
              )}
              {user && (
                <span className={`inline-flex items-center rounded-full text-xs px-2 py-1 border ${user?.isAvailable ? 'border-green-500 text-green-700' : 'border-gray-300 text-gray-500'}`}>
                  <span className={`h-2 w-2 rounded-full mr-2 ${user?.isAvailable ? 'bg-green-500' : 'bg-gray-300'}`} />
                  {user?.isAvailable ? (user?.availabilityMode === 'on-campus' ? 'Available • On-campus' : 'Available • Online') : 'Unavailable'}
                </span>
              )}
            </div>
            <p className="text-muted-foreground mt-2">
              Ready to share and learn new skills today?
            </p>
          </div>
          <div className="flex gap-2">
              {user?.role === 'admin' && (
              <Button asChild variant="secondary">
                <Link to="/admin">Admin Panel</Link>
              </Button>
            )}
              <Button variant={user?.isAvailable ? 'outline' : 'default'} onClick={toggleAvailability} disabled={savingAvailability}>
                {savingAvailability ? 'Saving...' : user?.isAvailable ? 'Set Unavailable' : 'Set Available'}
              </Button>
            <Button asChild>
              <Link to="/sessions">View Sessions</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/skills">Manage Skills</Link>
            </Button>
          </div>
        </div>

        {/* Error Message */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">API Connection Issue</h3>
          <p className="text-yellow-700 mb-4">
            Some dashboard data couldn't be loaded. The app is still functional - you can explore skills and manage sessions.
          </p>
          <div className="space-y-1 text-sm text-yellow-600">
            {matchingError && <p>• Matching stats: { (matchingError as any).message }</p>}
            {sessionError && <p>• Session stats: { (sessionError as any).message }</p>}
            {sessionsError && <p>• Recent sessions: { (sessionsError as any).message }</p>}
          </div>
          <Button onClick={() => window.location.reload()} className="mt-3">
            Retry
          </Button>
        </div>

        {/* Fallback Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-500">Teaching Opportunities</h3>
            <p className="text-2xl font-bold text-gray-400">--</p>
            <p className="text-xs text-gray-400">Data unavailable</p>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-500">Learning Opportunities</h3>
            <p className="text-2xl font-bold text-gray-400">--</p>
            <p className="text-xs text-gray-400">Data unavailable</p>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-500">Total Sessions</h3>
            <p className="text-2xl font-bold text-gray-400">--</p>
            <p className="text-xs text-gray-400">Data unavailable</p>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-500">Average Rating</h3>
            <p className="text-2xl font-bold text-gray-400">--</p>
            <p className="text-xs text-gray-400">Data unavailable</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild className="w-full">
              <Link to="/explorer">Explore Skills</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/sessions">Manage Sessions</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/profile">Update Profile</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative container mx-auto p-6 space-y-6">
      {/* Decorative faint peer-group watermark */}
      <div className="pointer-events-none absolute right-6 top-6 -z-10 opacity-5 hidden lg:block" aria-hidden="true">
        <img src="/peergroup.jpg" alt="" className="max-w-[420px] w-[360px] rounded-full object-cover filter blur-sm" />
      </div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-brand-gradient">
              Welcome back, {user?.fullName}!
            </h1>
            {user?.role === 'admin' && (
              <Badge variant="secondary">Admin</Badge>
            )}
            {user && (
              <span className={`inline-flex items-center rounded-full text-xs px-2 py-1 border ${user?.isAvailable ? 'border-green-500 text-green-700' : 'border-gray-300 text-gray-500'}`}>
                <span className={`h-2 w-2 rounded-full mr-2 ${user?.isAvailable ? 'bg-green-500' : 'bg-gray-300'}`} />
                {user?.isAvailable ? (user?.availabilityMode === 'on-campus' ? 'Available • On-campus' : 'Available • Online') : 'Unavailable'}
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-2">
            Ready to share and learn new skills today?
          </p>
        </div>
        <div className="flex gap-2">
          {user?.role === 'admin' && (
            <Button asChild variant="secondary">
              <Link to="/admin">Admin Panel</Link>
            </Button>
          )}
            <Button variant={user?.isAvailable ? 'outline' : 'default'} onClick={toggleAvailability} disabled={savingAvailability}>
            {savingAvailability ? 'Saving...' : user?.isAvailable ? 'Set Unavailable' : 'Set Available'}
          </Button>
            {/* Availability mode and location controls */}
            <select
              className="border rounded-md text-sm px-2 py-1"
              value={(user as any)?.availabilityMode || 'online'}
              onChange={async (e) => {
                if (!user) return;
                const updated = await userAPI.updateProfile({ availabilityMode: e.target.value as any } as any).then(r => r.data.data);
                const token = localStorage.getItem('token') || '';
                login(token, updated);
              }}
            >
              <option value="online">Online</option>
              <option value="on-campus">On-campus</option>
            </select>
            <input
              className="border rounded-md text-sm px-2 py-1"
              placeholder="Location (optional)"
              value={(user as any)?.availabilityLocation || ''}
              onChange={async (e) => {
                if (!user) return;
                const updated = await userAPI.updateProfile({ availabilityLocation: e.target.value } as any).then(r => r.data.data);
                const token = localStorage.getItem('token') || '';
                login(token, updated);
              }}
            />
          <Button asChild>
            <Link to="/sessions">View Sessions</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/skills">Manage Skills</Link>
          </Button>
        </div>
      </div>

      {/* API Status Debug */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Debug Info</h3>
        <div className="text-xs text-blue-600 space-y-1">
          <p>Matching API: {matchingLoading ? 'Loading...' : matchingError ? 'Error' : 'Success'}</p>
          <p>Session API: {sessionLoading ? 'Loading...' : sessionError ? 'Error' : 'Success'}</p>
          <p>Sessions API: {sessionsLoading ? 'Loading...' : sessionsError ? 'Error' : 'Success'}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teaching Opportunities</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {matchingStats?.matchingOpportunities.teachingOpportunities || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              People want to learn your skills
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Opportunities</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {matchingStats?.matchingOpportunities.learningOpportunities || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Skills you can learn from others
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessionStats?.totalSessions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Sessions you've participated in
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessionStats?.averageRatings.asTeacher || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Your teaching rating
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skills Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Your Skills Overview</CardTitle>
            <CardDescription>
              Manage your offered and seeking skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Skills You Offer</span>
                </div>
                <Badge variant="secondary">
                  {matchingStats?.userStats.offeredSkills || 0}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Skills You Seek</span>
                </div>
                <Badge variant="secondary">
                  {matchingStats?.userStats.seekingSkills || 0}
                </Badge>
              </div>

              <div className="pt-4">
                <Button asChild className="w-full">
                  <Link to="/skills">Manage Skills</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {user?.role === 'admin' && (
              <Button asChild className="w-full justify-start">
                <Link to="/admin">
                  <Users className="mr-2 h-4 w-4" />
                  Admin Panel
                </Link>
              </Button>
            )}
            <Button asChild className="w-full justify-start">
              <Link to="/explorer">
                <BookOpen className="mr-2 h-4 w-4" />
                Find Skills to Learn
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/sessions">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Session
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/profile">
                <Users className="mr-2 h-4 w-4" />
                Update Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommendations */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recommended Skills for You</CardTitle>
            <CardDescription>Based on your offered and seeking skills</CardDescription>
          </CardHeader>
          <CardContent>
            {matchesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-lg border animate-pulse bg-muted" />
                ))}
              </div>
            ) : matchesError ? (
              <p className="text-sm text-muted-foreground">Could not load recommendations right now.</p>
            ) : matches && matches.length > 0 ? (
              <div className="space-y-3">
                {matches.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {m.matchType === 'teaching_opportunity' ? 'Teach ' : m.matchType === 'learning_opportunity' ? 'Learn ' : 'Exchange '}
                        {m.commonSkills?.[0]?.name || m.skillsICanTeach?.[0]?.name || m.skillsIWantToLearn?.[0]?.name || 'a skill'}
                      </p>
                      <p className="text-sm text-muted-foreground">with {m.user.fullName}</p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/explorer">View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No recommendations yet</h3>
                <p className="text-muted-foreground mb-4">Add more skills to your profile to get tailored matches.</p>
                <Button asChild>
                  <Link to="/skills">Manage Skills</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Feed</CardTitle>
            <CardDescription>Latest actions in your network</CardDescription>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-lg border animate-pulse bg-muted" />
                ))}
              </div>
            ) : recentSessions && recentSessions.length > 0 ? (
              <div className="space-y-3">
                {recentSessions.map((s) => (
                  <div key={s._id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="text-sm">
                      <span className="font-medium">{s.student.fullName}</span> scheduled <span className="font-medium">{s.title}</span>
                      <span className="text-muted-foreground"> • {new Date(s.scheduledDate).toLocaleDateString()}</span>
                    </div>
                    <Badge variant="secondary" className="capitalize">{s.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-muted-foreground">No recent activity yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mini Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sessions Breakdown</CardTitle>
            <CardDescription>Pending vs Confirmed vs Completed</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                pending: { label: 'Pending', color: 'hsl(var(--brand-pink))' },
                confirmed: { label: 'Confirmed', color: 'hsl(var(--brand-sky))' },
                completed: { label: 'Completed', color: 'hsl(var(--brand-green))' },
              }}
              className="h-64"
            >
              <BarChart data={[{
                name: 'Sessions',
                pending: sessionStats?.pendingSessions || 0,
                confirmed: sessionStats?.confirmedSessions || 0,
                completed: sessionStats?.completedSessions || 0,
              }]}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="pending" fill="var(--color-pending)" radius={6} />
                <Bar dataKey="confirmed" fill="var(--color-confirmed)" radius={6} />
                <Bar dataKey="completed" fill="var(--color-completed)" radius={6} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Matching Opportunities</CardTitle>
            <CardDescription>Teaching, Learning, Mutual</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                teaching: { label: 'Teaching', color: 'hsl(var(--brand-blue))' },
                learning: { label: 'Learning', color: 'hsl(var(--brand-purple))' },
                mutual: { label: 'Mutual', color: 'hsl(var(--brand-lavender))' },
              }}
              className="h-64"
            >
              <BarChart data={[{
                name: 'Opportunities',
                teaching: matchingStats?.matchingOpportunities.teachingOpportunities || 0,
                learning: matchingStats?.matchingOpportunities.learningOpportunities || 0,
                mutual: matchingStats?.matchingOpportunities.mutualExchanges || 0,
              }]}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="teaching" fill="var(--color-teaching)" radius={6} />
                <Bar dataKey="learning" fill="var(--color-learning)" radius={6} />
                <Bar dataKey="mutual" fill="var(--color-mutual)" radius={6} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>
            Your latest learning and teaching sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentSessions && recentSessions.length > 0 ? (
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <div key={session._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{session.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {session.skill.name} • {new Date(session.scheduledDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        session.status === 'completed' ? 'default' :
                        session.status === 'confirmed' ? 'secondary' :
                        session.status === 'pending' ? 'outline' : 'destructive'
                      }
                    >
                      {session.status}
                    </Badge>
                    <Button size="sm" variant="ghost" asChild>
                      <Link to={`/sessions/${session._id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No sessions yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by exploring skills or creating your first session
              </p>
              <Button asChild>
                <Link to="/explorer">Explore Skills</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

