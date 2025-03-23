export type Community = {
  _id: string;
  clerkId: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  bio?: string;
  picture: string;
  location?: string;
  portfolioWebsite?: string;
  reputation?: string;
  joinedAt?: Date;
};

export type Experiment = {
  id: string;
  year: number;
  aceYear: string;
  Branch: string;
  CCode: string;
  CName: string;
  ExpNo: number;
  ExpName: string;
  ExpDesc: string;
  ExpSoln: string;
  __v: number;
  youtubeLink?: string;
};

export interface Course {
  id: string;
  courseName: string;
  schedule: TimeSlot[];
  totalClasses: number;
  attendedClasses: number;
}

export interface TimeSlot {
  id: string;
  day: string;
  time: string;
}

export interface AttendanceRecord {
  [date: string]: {
    [slotId: string]: AttendanceStatus;
  };
}

export interface ExtraClass {
  courseId: string;
  courseName: string;
  status: AttendanceStatus;
  time: string;
}

export interface ExtraClassesRecord {
  [date: string]: {
    [slotId: string]: ExtraClass;
  };
}

export type AttendanceStatus = 'present' | 'absent' | 'noclass';

export interface DailySchedule extends Course {
  slotId: string;
  timeSlot: TimeSlot;
  isExtra?: boolean;
  status?: AttendanceStatus;
}