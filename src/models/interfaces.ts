export interface Employee {
  EmployeeUid?: number;
  FileId?: number;
  FirstName?: string;
  LastName?: string;
  Mobile?: string;
  Email?: string;
  BranchName?: string;
  SecondaryMobile?: string;
  LeavePlanId?: number;
  FatherName?: string;
  CompanyId?: number;
  MotherName?: string;
  SpouseName?: string;
  State?: string;
  City?: string;
  Pincode?: number;
  Address?: string;
  PANNo?: string;
  AadharNo?: string;
  AccountNumber?: string;
  BankName?: string;
  IFSCCode?: string;
  Domain?: string;
  Specification?: string;
  ExprienceInYear?: number;
  LastCompanyName?: string;
  IsPermanent?: boolean;
  IsActive?: boolean;
  AllocatedClientId?: number;
  AllocatedClientName?: string;
  ActualPackage?: number;
  FinalPackage?: number;
  TakeHomeByCandidate?: number;
  DOB?: any;
  CreatedOn?: Date;
  ReportingManagerId?: number;
  DesignationId?: number;
  AccessLevelId?: number;
  UserTypeId?: number;
  CTC?: number;
  SalaryDetailId?: number;
  ClientJson?: string;
  Gender?: boolean;
  OrganizationId?: number;
  OldFileName?: string;
  WorkShiftId?: number;
  IsPayrollOnCTC?: boolean;
  SalaryGroupId?: number;
  PFNumber?: string;
  UniversalAccountNumber?: string;
  PFJoinDate?: Date;
}

export interface Attendance {
  AttendanceId?: number;
  EmployeeId?: number;
  EmployeeName?: string;
  EmployeeEmail?: string;
  ReviewerId?: number;
  ReviewerName?: string;
  ReviewerEmail?: string;
  ProjectId?: number;
  TaskId?: number;
  TaskType?: number;
  LogOn?: string;
  LogOff?: string;
  TotalMinutes?: number;
  Comments?: string;
  AttendanceStatus?: number;
  WeekOfYear?: number;
  AttendanceDate?: Date;
  WorkTypeId?: number;
  IsHoliday?: boolean;
  HolidayId?: number;
  IsOnLeave?: boolean;
  LeaveId?: number;
  IsWeekend?: boolean;
}

export interface AttendacePageResponse {
  employee: Employee;
  DailyAttendances: Array<Attendance>;
}

export interface AttendanceConfig {
  EmployeeDetail?: Employee;
  Projects?: Array<Project>;
  Weeks?: Array<Weeks>;
}

export interface Weeks {
  StartDate?: Date;
  EndDate?: Date;
  WeekIndex?: number;
}

export interface Project {
  ProjectTitle?: string;
  ProjectTag?: string;
  ProjectWorkingYear?: number;
  ProjectWorkingMonth?: number;
  ProjectWorkedYear?: number;
  ProjectWorkedMonth?: number;
  ProjectStatus?: string;
  ClientName?: string;
  ProjectDetails?: string;
  RolesResponsibility?: string;
  TechnalogyStack?: string;
  ProjectDuration?: string;
  ProjectIndex?: number;
}
