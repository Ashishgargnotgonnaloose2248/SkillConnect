import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI, User } from '@/lib/api';
import { 
  Clock, 
  Calendar, 
  Plus, 
  X, 
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  UserX
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const statusOptions = [
  { value: 'free', label: 'Free', icon: CheckCircle2, color: 'bg-green-500' },
  { value: 'busy', label: 'Busy', icon: AlertCircle, color: 'bg-yellow-500' },
  { value: 'in-class', label: 'In Class', icon: BookOpen, color: 'bg-blue-500' },
  { value: 'unavailable', label: 'Unavailable', icon: UserX, color: 'bg-gray-500' },
] as const;

const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [localStatus, setLocalStatus] = useState<string>('unavailable');
  const [dailyAvailability, setDailyAvailability] = useState<Array<{
    day: typeof daysOfWeek[number];
    timeSlots: Array<{ startTime: string; endTime: string }>;
  }>>([]);

  // Fetch user profile
  const { data: profile, isLoading } = useQuery<User>({
    queryKey: ['user-profile'],
    queryFn: () => userAPI.getProfile().then(res => res.data.data),
  });

  useEffect(() => {
    if (!profile) {
      return;
    }
    if (profile.currentStatus) {
      setLocalStatus(profile.currentStatus);
    }
    if (profile.dailyAvailability && profile.dailyAvailability.length > 0) {
      setDailyAvailability(profile.dailyAvailability);
    }
  }, [profile]);

  // Update current status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status: typeof statusOptions[number]['value']) => userAPI.updateCurrentStatus(status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Status updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

  // Update daily availability mutation
  const updateAvailabilityMutation = useMutation({
    mutationFn: (availability: typeof dailyAvailability) => 
      userAPI.updateDailyAvailability(availability),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Daily availability updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update availability');
    },
  });

  // Check if user is faculty
  if (user?.role !== 'faculty') {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground mb-4">
              This page is only available for faculty members.
            </p>
            <Button asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleStatusChange = (status: typeof statusOptions[number]['value']) => {
    setLocalStatus(status);
    updateStatusMutation.mutate(status);
  };

  const addDay = () => {
    const newDay: typeof daysOfWeek[number] = daysOfWeek.find(d => 
      !dailyAvailability.find(da => da.day === d)
    ) || daysOfWeek[0];
    
    setDailyAvailability([...dailyAvailability, { day: newDay, timeSlots: [] }]);
  };

  const removeDay = (index: number) => {
    setDailyAvailability(dailyAvailability.filter((_, i) => i !== index));
  };

  const addTimeSlot = (dayIndex: number) => {
    const updated = [...dailyAvailability];
    updated[dayIndex].timeSlots.push({ startTime: '09:00', endTime: '17:00' });
    setDailyAvailability(updated);
  };

  const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    const updated = [...dailyAvailability];
    updated[dayIndex].timeSlots.splice(slotIndex, 1);
    setDailyAvailability(updated);
  };

  const updateTimeSlot = (dayIndex: number, slotIndex: number, field: 'startTime' | 'endTime', value: string) => {
    const updated = [...dailyAvailability];
    updated[dayIndex].timeSlots[slotIndex][field] = value;
    setDailyAvailability(updated);
  };

  const updateDay = (index: number, day: typeof daysOfWeek[number]) => {
    const updated = [...dailyAvailability];
    updated[index].day = day;
    setDailyAvailability(updated);
  };

  const handleSaveAvailability = () => {
    updateAvailabilityMutation.mutate(dailyAvailability);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const currentStatusOption = statusOptions.find(s => s.value === localStatus);

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
            <BreadcrumbPage>Faculty Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-gradient">Faculty Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your availability and current status
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Current Status
            </CardTitle>
            <CardDescription>
              Set your current availability status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              {currentStatusOption && (
                <>
                  <div className={`w-3 h-3 rounded-full ${currentStatusOption.color}`} />
                  <span className="font-medium">{currentStatusOption.label}</span>
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.value}
                    variant={localStatus === option.value ? 'default' : 'outline'}
                    onClick={() => handleStatusChange(option.value)}
                    disabled={updateStatusMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Daily Availability Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Availability
            </CardTitle>
            <CardDescription>
              Set your weekly availability time slots
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dailyAvailability.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No availability set. Add days to set your schedule.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {dailyAvailability.map((dayEntry, dayIndex) => (
                  <div key={dayIndex} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Select
                        value={dayEntry.day}
                        onValueChange={(value) => updateDay(dayIndex, value as typeof daysOfWeek[number])}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {daysOfWeek.map(day => (
                            <SelectItem 
                              key={day} 
                              value={day}
                              disabled={dailyAvailability.some((d, i) => d.day === day && i !== dayIndex)}
                            >
                              {day.charAt(0).toUpperCase() + day.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDay(dayIndex)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {dayEntry.timeSlots.map((slot, slotIndex) => (
                        <div key={slotIndex} className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'startTime', e.target.value)}
                            className="flex-1"
                          />
                          <span className="text-muted-foreground">to</span>
                          <Input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'endTime', e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addTimeSlot(dayIndex)}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Time Slot
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={addDay}
                disabled={dailyAvailability.length >= 7}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Day
              </Button>
              <Button
                onClick={handleSaveAvailability}
                disabled={updateAvailabilityMutation.isPending}
                className="flex-1"
              >
                {updateAvailabilityMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Schedule
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FacultyDashboard;

