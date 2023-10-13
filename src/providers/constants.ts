export const Login = "login";
export const Initialpage = "initialpage";
export const Users = "users";
export const Sales = "sales";
export const Setting = "setting";
export const JsonFormatter = "jsonformatter";
export const TableSampleData = "tablesampledata";
export const Home = "home";
export const GraphicsDb = "graphicsdb";
export const FeedBack = "feedbacks";
export const SamplePage = "samplepage";
export const String = "string";

export const UploadScript = "uploadscript";
export const UserProfile = "userprofile";
export const CodeGenerator = "codegenerator";
export const LiveUrl = "liveurl";
export const ApiKey = "AIzaSyAkFANPvmh1x_ajxADulhWiPcsNJHqw1Hs";
export const AccessTokenExpiredOn = "access_token_expired_on";
export const ProjectName = "onlinedatabuilder";
export const ServerError = 500;
export const BadRequest = 400;
export const Success = 200;
export const UnAuthorize = 401;
export const NotFound = 404;
export const Forbidden = 403;
export const AccessToken = ProjectName + "_access_token";
export const Authorization = "Authorization";
export const Master = ProjectName + "_master";
export const UserDetailName = ProjectName + "_UserDetail";
export const DocumentPathName = "documents";
export const UserPathName = "User";
export const ProfileImage = "profile";
export const InsertOrUpdateSuccessfull = "Inserted/Updated successfully";

export enum FileSystemType {
  User = 1,
  Bills = 2
}


// ********************** API route pages  *******************

export const Blogs = "api/blogs";
export const Article = "api/blogs/article/:articleid";

// ********************** Manage route pages  *******************

export const ManageBaseRoute = "ems/manage"
export const Profile = `${ManageBaseRoute}/profile`;
export const AdminLeave = `${ManageBaseRoute}/leave`;
export const Holiday = `${ManageBaseRoute}/planholidays`;
export const Attendance = `${ManageBaseRoute}/attendance`;
export const Timesheet = `${ManageBaseRoute}/timesheet`;
export const AdminManageTimesheet = `${ManageBaseRoute}/managetimesheet`;

// ********************** Manage route ends  *******************


// ********************** Configuration route pages  *******************

export const ConfigBaseRoute = "ems/config"
export const Annexure = `${ConfigBaseRoute}/annexure`;
export const OfferLetter = `${ConfigBaseRoute}/offerletter`;
export const EmailConfiguration = `${ConfigBaseRoute}/emailconfiguration`;
export const Products = `${ConfigBaseRoute}/products`;
export const ManageShift = `${ConfigBaseRoute}/manageshift`;
export const WorkFlow = `${ConfigBaseRoute}/workflow`;
export const ConfigPerformance = `${ConfigBaseRoute}/configperformance`;
export const ManageWorkFlow = `${ConfigBaseRoute}/workflow/manageworkflow`;
export const ProcessingPayroll = `${ConfigBaseRoute}/processingpayroll`;
export const LeaveAttendanceDailywages = `${ConfigBaseRoute}/processingpayroll/leaveattendancedailywages`;

// ********************** Configuration route ends  *******************


// ********************** Team route pages  *******************

export const TeamBaseRoute = "ems/team"
export const AdminNotification = `${TeamBaseRoute}/notification`;
export const AdminApprovalRequest = `${TeamBaseRoute}/request`;
export const Appraisal = `${TeamBaseRoute}/appraisal`;
export const ApprisalReview = `${TeamBaseRoute}/apprisalreview`;
export const ServiceRequest = `${TeamBaseRoute}/servicerequest`;
export const Performance = `${TeamBaseRoute}/objectives`;
export const ManageReview = `${TeamBaseRoute}/managereview`;
export const ManageAppraisalCategory = `${TeamBaseRoute}/appraisal/manageappraisalcategory`;
export const FinalizeReview = `${TeamBaseRoute}/finalizereview`;

// ********************** Team route ends  *******************


// ********************** Project route pages  *******************

export const ProjectBaseRoute = "ems/project"
export const ProjectWiki = `${ProjectBaseRoute}/projectlist/wiki`;
export const ProjectBudget = `${ProjectBaseRoute}/projectlist/budget`;
export const ProjectList = `${ProjectBaseRoute}/projectlist`;
export const ManageProject = `${ProjectBaseRoute}/projectlist/manage-project`;

// ********************** Project route ends  *******************


// ********************** Income Declaration route pages  *******************

export const AccountsBaseRoute = "ems/accounts"
export const AdminSummary = `${AccountsBaseRoute}/summary`;
export const AdminDeclaration = `${AccountsBaseRoute}/declaration`;
export const EmployeeDeclarationList = `${AccountsBaseRoute}/employeedeclarationlist`;
export const AdminSalary = `${AccountsBaseRoute}/salary`;
export const AdminPreferences = `${AccountsBaseRoute}/preferences`;
export const AdminPreviousIncome = `${AccountsBaseRoute}/declaration/previousincome`;
export const AdminForm12B = `${AccountsBaseRoute}/declaration/form12b`;
export const AdminFreeTaxFilling = `${AccountsBaseRoute}/declaration/freetaxfilling`;
export const AdminDeclarationApprovalRule = `${AccountsBaseRoute}/declaration/declarationapprovalrule`;
export const AdminIncomeTax = `${AccountsBaseRoute}/salary/incometax`;
export const AdminPaySlip = `${AccountsBaseRoute}/salary/payslip`;
export const Payroll = `${AccountsBaseRoute}/payrollsettings/payroll`;
export const PFESISetup = `${AccountsBaseRoute}/payrollsettings/pfesisetup`;
export const SalaryComponentStructure = `${AccountsBaseRoute}/payrollsettings/salarycomponentstructure`;
export const CustomSalaryStructure = `${AccountsBaseRoute}/payrollsettings/customsalarystructure`;
export const PayrollComponents = `${AccountsBaseRoute}/payrollcomponents`;
export const TaxRegime = `${AccountsBaseRoute}/taxregime`;

// ********************** Income Declaration route ends  *******************

// ********************** Leave Management route pages  *******************

export const LeaveBaseRoute = "ems/leave"
export const Leave = `${LeaveBaseRoute}/leavesetting`
export const ManageLeavePlan = `${LeaveBaseRoute}/leavesetting/manageleaveplan`;
export const ManageYearEnding = `${LeaveBaseRoute}/leavesetting/manageyearending`;

// ********************** Leave Management route ends  *******************


// ********************** Project route pages  *******************

export const CommonBaseRoute = "ems/common"
export const Documents = `${CommonBaseRoute}/documents`;
export const DocumentsPage = `${CommonBaseRoute}/documentspage/:path`;

// ********************** Project route ends  *******************


// ********************** Admin route pages  *******************

export const Employees = "ems/administration/employees";
export const Dashboard = "ems/administration/dashboard";
export const BuildPdf = "ems/administration/generatebill";
export const ManageEmployee = 'ems/administration/employees/manageemployee';
export const Clients = 'ems/administration/clients';
export const RegisterClient = 'ems/administration/clients/registerclient';
export const Files = 'ems/administration/files';
export const Resume = 'ems/administration/resumes';
export const SideMenu = 'ems/administration/sidemenu';
export const BillDetail = 'ems/administration/billdetail';
export const Recent = 'ems/administration/recent';
export const Roles = 'ems/settings/roles';
export const Companies = 'ems/administration/Companies';
export const CreateResume = 'ems/administration/CreateResume';
export const Recruiter = 'ems/administration/Recruiter';
export const AdminTaxcalculation = 'ems/administration/taxcalculation';
export const AdminResetPassword = 'ems/administration/resetpassword';
export const PayrollSettings = 'ems/settings/payrollsettings';
export const CompanyInfo = 'ems/settings/payrollsettings/company-info';
export const CompanySettings = 'ems/settings/payrollsettings/company-settings';
export const Expenses = 'ems/administration/expenses';
export const SalaryBreakup = 'ems/administration/employees/alarybreakup';
export const EmailService = 'ems/administration/email';
export const OrganizationSetting = 'ems/administration/organization-setting';
export const EmailSetting = 'ems/settings/emailsetting';
export const EmailLinkConfig = 'ems/settings/emaillinkconfig';
export const Company = 'ems/settings/companysettings';
export const EmailTemplate = 'ems/administration/emailtemplate';
export const ManageEmailTemplate = 'ems/administration/emailtemplate/manageemailtemplate';
export const CompanyLogo = 'ems/administration/companylogo';
export const AdminMasterData = 'ems/administration/masterdata';

// ********************** Admin route pages  *******************

export const UserDashboard = "ems/home/dashboard";
export const UserAttendance = "user/manage/attendance";
export const UserProfilePage = "user/manage/profile";
export const UserTimesheet = "user/manage/timesheet";
export const Summary = "user/summary";
export const Declaration = "declaration";
export const Salary = "salary";
export const Preferences = "preferences";
export const UserLeave = 'user/manage/leave';
export const PreviousIncome = 'declaration/previousincome';
export const Form12B = 'declaration/form12b';
export const FreeTaxFilling = 'freetaxfilling';
export const TaxSavingInvestment = 'user/taxsavinginvestment';
export const PaySlip = 'salary/payslip';
export const IncomeTax = 'salary/incometax';
export const Taxcalculation = 'user/taxcalculation';
export const ResetPassword = 'user/resetpassword';
export const Notification = 'user/team/notification';
export const ApprovalRequest = 'user/team/request';
export const UserHoliday = 'user/manage/planholidays';
export const UserProjectBaseRout = "user/project"
export const UserProjectList = 'projectlist';
export const ManageTimesheet = 'user/manage/managetimesheet';
export const UserDocuments = "documents";
export const UserDocumentsPage = "documentspage/:path";
export const EmpPerformance = 'performance';
export const EmpServiceRequest = 'servicerequest';
export const UserAccountsBaseRoute = "user/accounts"
export const UserCommonBaseRoute = "user/common"

// *************************** file name constancts  *************
export const Doc = "doc";
export const Docx = "docx";
export const ADocx = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export const Pdf = "pdf";
export const APdf = "application/pdf";
export const Txt = "txt";
export const FlatFile = "file";
export const Zip = "zip";
export const Excel = "xlsx";
export const Ppt = "ppt";
export const Directory = "";
export const JImage = 'jpg';
export const PImage = 'png';
export const AImage = "jpeg";

export const DocImg = "assets/ext/doc.png";
export const PdfImg = "assets/ext/pdf.png";
export const TxtImg = "assets/ext/txt.png";
export const FlatFileImg = "assets/ext/file.png";
export const ZipImg = "assets/ext/zip.jpg";
export const ExcelImg = "assets/ext/excel.png";
export const PptImg = "assets/ext/ppt.jpg";
export const DirectoryImg = "assets/ext/directory.jpg";
export const Images = "assets/ext/image.png";
export const DocumentPath = "Documents";
export const UserPath = "User";
export const UserImage = "assets/images/faces/face.jpg";
export const OrgLogo = "assets/images/organization-logo.jpg"


export class API {
  public static GETEMPLOYEEBYFILTER: string = "employee/GetEmployees";
}


export const MaxAllowedFileSize = 2048

export enum UserType {
  Admin = 1,
  Employee = 2,
  Candidate = 3,
  Client = 4,
  Other = 5,
  Compnay = 6
}

export enum ItemStatus
{
  NotSubmitted = 0,
  Completed = 1,
  Pending = 2,
  Canceled = 3,
  NotGenerated = 4,
  Rejected = 5,
  Generated = 6,
  Raised = 7,
  Submitted = 8,
  Approved = 9,
  Present = 10,
  Absent = 11,
  MissingAttendanceRequest = 12,
  Saved = 13,
  AutoPromoted = 14,
  FinalLevel = 15
}

class FileRoleType
{
    PrimaryLogo = "Company Primary Logo";
    CompanyLogo = "Company Logo";
    OtherFile = "Other File";
}

export enum CommonFlags
{
  FullDay = 1,
  FirstHalf = 2,
  SecondHalf = 3,
  HalfDay = 4
}
