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

export const ManageBaseRoute = "admin/manage"
export const Profile = 'profile';
export const AdminLeave = 'leave';
export const Holiday = 'planholidays';
export const Attendance = 'attendance';
export const Timesheet = 'timesheet';
export const AdminManageTimesheet = 'managetimesheet';

// ********************** Manage route ends  *******************


// ********************** Configuration route pages  *******************

export const ConfigBaseRoute = "admin/config"
export const Annexure = 'annexure';
export const OfferLetter = 'offerletter';
export const EmailConfiguration = 'emailconfiguration';
export const Products = 'products';
export const ManageShift = 'manageshift';
export const WorkFlow = 'workflow';
export const ConfigPerformance = 'configperformance';
export const ManageWorkFlow = 'workflow/manageworkflow';
export const ProcessingPayroll = 'processingpayroll';
export const Appraisal = 'appraisal';

// ********************** Configuration route ends  *******************


// ********************** Team route pages  *******************

export const TeamBaseRoute = "admin/team"
export const AdminNotification = 'notification';
export const AdminApprovalRequest = 'request';

// ********************** Team route ends  *******************


// ********************** Project route pages  *******************

export const ProjectBaseRoute = "admin/project"
export const ProjectWiki = 'projectlist/wiki';
export const ProjectList = 'projectlist';
export const ManageProject = 'projectlist/manage-project';

// ********************** Project route ends  *******************


// ********************** Income Declaration route pages  *******************

export const AccountsBaseRoute = "admin/accounts"
export const AdminSummary = "summary";
export const AdminDeclaration = "declaration";
export const AdminSalary = "salary";
export const AdminPreferences = "preferences";
export const AdminPreviousIncome = 'declaration/previousincome';
export const AdminForm12B = 'declaration/form12b';
export const AdminFreeTaxFilling = 'declaration/freetaxfilling';
export const AdminDeclarationApprovalRule = 'declaration/declarationapprovalrule';
export const AdminIncomeTax = 'salary/incometax';
export const AdminPaySlip = 'salary/payslip';
export const Payroll = 'payrollsettings/payroll';
export const PFESISetup = 'payrollsettings/pfesisetup';
export const SalaryComponentStructure = 'payrollsettings/salarycomponentstructure';
export const CustomSalaryStructure = 'payrollsettings/customsalarystructure';
export const PayrollComponents = 'payrollcomponents';
export const TaxRegime = 'taxregime';

// ********************** Income Declaration route ends  *******************

// ********************** Leave Management route pages  *******************

export const LeaveBaseRoute = "admin/leave"
export const Leave = 'leavesetting'
export const ManageLeavePlan = 'leavesetting/manageleaveplan';
export const ManageYearEnding = 'leavesetting/manageyearending';

// ********************** Leave Management route ends  *******************


// ********************** Project route pages  *******************

export const CommonBaseRoute = "admin/common"
export const Performance = 'performance';
export const ApprisalReview = 'apprisalreview';
export const ServiceRequest = 'servicerequest';
export const Documents = "documents";
export const DocumentsPage = "documentspage/:path";

// ********************** Project route ends  *******************


// ********************** Admin route pages  *******************

export const Employees = "admin/employees";
export const Dashboard = "admin/dashboard";
export const BuildPdf = "admin/generatebill";
export const ManageEmployee = 'admin/employees/manageemployee';
export const Clients = 'admin/clients';
export const RegisterClient = 'admin/clients/registerclient';
export const Files = 'admin/files';
export const Resume = 'admin/resumes';
export const SideMenu = 'admin/sidemenu';
export const BillDetail = 'admin/billdetail';
export const Recent = 'admin/recent';
export const Roles = 'admin/roles';
export const Companies = 'admin/Companies';
export const CreateResume = 'admin/CreateResume';
export const Recruiter = 'admin/Recruiter';
export const AdminTaxcalculation = 'admin/taxcalculation';
export const AdminResetPassword = 'admin/resetpassword';
export const PayrollSettings = 'admin/payrollsettings';
export const CompanyInfo = 'admin/payrollsettings/company-info';
export const CompanySettings = 'admin/payrollsettings/company-settings';
export const Expenses = 'admin/expenses';
export const SalaryBreakup = 'admin/employees/alarybreakup';
export const EmailService = 'admin/email';
export const OrganizationSetting = 'admin/organization-setting';
export const EmailSetting = 'admin/emailsetting';
export const EmailLinkConfig = 'admin/emaillinkconfig';
export const Company = 'admin/companysettings';
export const EmailTemplate = 'admin/emailtemplate';
export const ManageEmailTemplate = 'admin/emailtemplate/manageemailtemplate';
export const CompanyLogo = 'admin/companylogo';
export const AdminMasterData = 'admin/masterdata';

// ********************** Admin route pages  *******************

export const UserDashboard = "user/dashboard";
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
