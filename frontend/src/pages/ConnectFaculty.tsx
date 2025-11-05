import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { userAPI, type User } from '@/lib/api';
import { 
  Search, 
  Clock, 
  Calendar, 
  CheckCircle2,
  AlertCircle,
  BookOpen,
  UserX,
  MapPin,
  GraduationCap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const statusConfig = {
  free: { label: 'Free', icon: CheckCircle2, color: 'bg-green-500', textColor: 'text-green-700' },
  busy: { label: 'Busy', icon: AlertCircle, color: 'bg-yellow-500', textColor: 'text-yellow-700' },
  'in-class': { label: 'In Class', icon: BookOpen, color: 'bg-blue-500', textColor: 'text-blue-700' },
  unavailable: { label: 'Unavailable', icon: UserX, color: 'bg-gray-500', textColor: 'text-gray-700' },
} as const;

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const getCurrentDay = () => {
  const today = new Date().getDay();
  return daysOfWeek[today === 0 ? 6 : today - 1]; // Convert Sunday (0) to last index
};

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const getNextAvailableTime = (faculty: User) => {
  if (!faculty.dailyAvailability || faculty.dailyAvailability.length === 0) {
    return null;
  }

  const now = new Date();
  const currentDay = getCurrentDay();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  // Find today's availability
  const todayAvailability = faculty.dailyAvailability.find(da => da.day === currentDay);
  if (todayAvailability && todayAvailability.timeSlots.length > 0) {
    for (const slot of todayAvailability.timeSlots) {
      const [startH, startM] = slot.startTime.split(':').map(Number);
      const [endH, endM] = slot.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      // If current time is before the slot ends and faculty is free
      if (currentTime < endMinutes && faculty.currentStatus === 'free') {
        if (currentTime < startMinutes) {
          return `Today at ${formatTime(slot.startTime)}`;
        }
        return 'Available now';
      }
    }
  }

  // Find next available day
  const currentDayIndex = daysOfWeek.indexOf(currentDay);
  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (currentDayIndex + i) % 7;
    const nextDay = daysOfWeek[nextDayIndex];
    const nextDayAvailability = faculty.dailyAvailability.find(da => da.day === nextDay);
    
    if (nextDayAvailability && nextDayAvailability.timeSlots.length > 0) {
      const slot = nextDayAvailability.timeSlots[0];
      const dayName = dayNames[nextDayIndex];
      return `${dayName} at ${formatTime(slot.startTime)}`;
    }
  }

  return null;
};

const ConnectFaculty: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modeFilter, setModeFilter] = useState<string>('all');

  // Fetch all faculty
  const { data: facultyData, isLoading } = useQuery({
    queryKey: ['faculty', statusFilter, modeFilter],
    queryFn: () => userAPI.getAllFaculty({
      ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
      ...(modeFilter !== 'all' ? { mode: modeFilter } : {}),
    }).then(res => res.data.data.faculty),
  });

  const faculty = facultyData || [];

  // Filter by search term
  const filteredFaculty = faculty.filter((f: User) =>
    f.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.skillsOffered?.some((skill: any) => 
      skill.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
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
            <BreadcrumbPage>Connect to Faculty</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-brand-gradient flex items-center gap-2">
          <GraduationCap className="h-8 w-8" />
          Connect to Faculty
        </h1>
        <p className="text-muted-foreground mt-2">
          Find and connect with faculty members based on their availability
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="busy">Busy</SelectItem>
            <SelectItem value="in-class">In Class</SelectItem>
          </SelectContent>
        </Select>
        <Select value={modeFilter} onValueChange={setModeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modes</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="on-campus">On-Campus</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Faculty Cards */}
      {filteredFaculty.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No faculty found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || modeFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No faculty members available at the moment'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFaculty.map((facultyMember: User) => {
            const status = (facultyMember.currentStatus || 'unavailable') as keyof typeof statusConfig;
            const statusInfo = statusConfig[status];
            const StatusIcon = statusInfo.icon;
            const nextAvailable = getNextAvailableTime(facultyMember);

            return (
              <Card key={facultyMember._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{facultyMember.fullName}</CardTitle>
                      <CardDescription className="mt-1">
                        Faculty Member
                      </CardDescription>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`flex items-center gap-1 ${statusInfo.textColor} border-${statusInfo.color.replace('bg-', '')}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
                      {statusInfo.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current Status */}
                  <div className="flex items-center gap-2 text-sm">
                    <StatusIcon className={`h-4 w-4 ${statusInfo.textColor}`} />
                    <span className="text-muted-foreground">
                      Status: <span className="font-medium">{statusInfo.label}</span>
                    </span>
                  </div>

                  {/* Availability Mode */}
                  {facultyMember.availabilityMode && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {facultyMember.availabilityMode === 'online' ? 'Online' : 'On-Campus'}
                        {facultyMember.availabilityLocation && ` • ${facultyMember.availabilityLocation}`}
                      </span>
                    </div>
                  )}

                  {/* Next Available */}
                  {nextAvailable && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {nextAvailable}
                      </span>
                    </div>
                  )}

                  {/* Skills */}
                  {facultyMember.skillsOffered && facultyMember.skillsOffered.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {facultyMember.skillsOffered.slice(0, 3).map((skill: any) => (
                          <Badge key={skill._id} variant="secondary" className="text-xs">
                            {skill.name}
                          </Badge>
                        ))}
                        {facultyMember.skillsOffered.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{facultyMember.skillsOffered.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Weekly Schedule Preview */}
                  {facultyMember.dailyAvailability && facultyMember.dailyAvailability.length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Weekly Schedule:
                      </p>
                      <div className="space-y-1">
                        {facultyMember.dailyAvailability.slice(0, 3).map((dayEntry, idx) => (
                          <div key={idx} className="text-xs text-muted-foreground">
                            <span className="font-medium capitalize">{dayEntry.day}:</span>{' '}
                            {dayEntry.timeSlots.map((slot, i) => (
                              <span key={i}>
                                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                {i < dayEntry.timeSlots.length - 1 && ', '}
                              </span>
                            ))}
                          </div>
                        ))}
                        {facultyMember.dailyAvailability.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{facultyMember.dailyAvailability.length - 3} more days
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <Button className="w-full" variant="outline">
                    Connect
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ConnectFaculty;

