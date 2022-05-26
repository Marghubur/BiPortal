export const Login = "login";
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


// ********************** Admin route pages  *******************

export const Employees = "admin/employees";
export const Dashboard = "admin/dashboard";
export const Documents = "admin/documents";
export const DocumentsPage = "admin/documentspage/:path";
export const BuildPdf = "admin/BuildPdf";
export const ManageEmployee = 'admin/manageemployee';
export const Clients = 'admin/clients';
export const RegisterClient = 'admin/registerclient';
export const Files = 'admin/files';
export const Resume = 'admin/resumes';
export const SideMenu = 'admin/sidemenu';
export const BillDetail = 'admin/billdetail';
export const Profile = 'admin/profile';
export const Recent = 'admin/recent';
export const Roles = 'admin/roles';
export const Companies = 'admin/Companies';
export const CreateResume = 'admin/CreateResume';
export const Recruiter = 'admin/Recruiter';
export const Attendance = 'admin/attendance';
export const Leave = 'admin/leave'
export const Timesheet = 'admin/timesheet';
export const AdminSummary = "admin/summary";
export const AdminDeclaration = "admin/declaration";
export const AdminSalary = "admin/salary";
export const AdminPreferences = "admin/preferences";
export const AdminPreviousIncome = 'admin/previousincome';
export const AdminForm12B = 'admin/form12b';
export const AdminFreeTaxFilling = 'admin/freetaxfilling';
export const AdminTaxSavingInvestment = 'admin/taxsavinginvestment';
export const AdminTaxcalculation = 'admin/taxcalculation';
export const AdminResetPassword = 'admin/resetpassword';
export const AdminIncomeTax = 'admin/incometax';
export const AdminPaySlip = 'admin/payslip';
export const AdminNotification = 'admin/notification';
export const AdminApprovalRequest = 'admin/request';
export const Settings = 'admin/settings';
export const CompanySettings = 'admin/company_settings';
export const Payroll = 'admin/payroll';
export const LeavesAndHoliday = 'admin/leaves_n_holidays';
export const PFESISetup = 'admin/pfesisetup';
export const Expenses = 'admin/expenses';

// ********************** Admin route pages  *******************

export const UserDashboard = "user/dashboard";
export const UserAttendance = "user/attendance";
export const UserProfilePage = "user/profile";
export const UserTimesheet = "user/timesheet";
export const Summary = "user/summary";
export const Declaration = "user/declaration";
export const Salary = "user/salary";
export const Preferences = "user/preferences";
export const UserLeave = 'user/leave';
export const PreviousIncome = 'user/previousincome';
export const Form12B = 'user/form12b';
export const FreeTaxFilling = 'user/freetaxfilling';
export const TaxSavingInvestment = 'user/taxsavinginvestment';
export const PaySlip = 'user/payslip';
export const IncomeTax = 'user/incometax';
export const Taxcalculation = 'user/taxcalculation';
export const ResetPassword = 'user/resetpassword';
export const Notification = 'user/notification';
export const ApprovalRequest = 'user/request';



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

export const DocImg = "assets/ext/doc.jpg";
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
export const UserImage = "assets/images/faces/face1.jpg";


export const MaxAllowedFileSize = 2048

export enum UserType {
  Admin = 1,
  Employee = 2,
  Candidate = 3,
  Client = 4,
  Other = 5
}

export enum ItemStatus
{
    Completed = 1,
    Pending = 2,
    Canceled = 3,
    NotGenerated = 4,
    Rejected = 5,
    Generated = 6,
    Raised = 7,
    Submitted = 8,
    Approved = 9
}
