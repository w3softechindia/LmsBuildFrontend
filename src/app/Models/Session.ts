export class Session {
  classId: number;
  classDuration: number;
  classDate: string;
  classStatus: string;
  startTime: string;
  endTime: string;
  sessionNumber: number;
  meetingLink: string;  
  timeStatus: string;
  complete: boolean;
  team: { teamName: string; };
  progress: number;
}
