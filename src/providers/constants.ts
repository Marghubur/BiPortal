export const Login = "login";
export const Dashboard = "dashboard";
export const Users = "users";
export const Sales = "sales";
export const Roles = "roles";
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
export const Success = 200;
export const UnAuthorize = 401;
export const NotFound = 404;
export const AccessToken = ProjectName + "_access_token";
export const Authorization = "Authorization";
export const Master = ProjectName + "_master";
export const UserDetailName = ProjectName + "_UserDetail";


// ********************** API route pages  *******************

export const Blogs = "api/blogs";
export const Article = "api/blogs/article/:articleid";


// ********************** Admin route pages  *******************

export const Employees = "admin/employees";
export const Documents = "admin/documents";
export const DocumentsPage = "admin/documentspage";
export const BuildPdf = "admin/BuildPdf";
export const ManageEmployee = 'admin/manageemployee';
export const Clients = 'admin/clients';
export const RegisterClient = 'admin/registerclient';
export const Files = 'admin/files';
export const Resume = 'admin/resumes';
export const SideMenu = 'admin/sidemenu';
export const BillDetail = 'admin/billdetail';


// *************************** file name constancts  *************
export const Doc = "assets/doc.png";
export const Pdf = "assets/pdf.png";
export const Txt = "assets/txt.png";
export const FlatFile = "assets/file.png";
export const Zip = "assets/zip.png";
export const Excel = "assets/excel.png";
export const Ppt = "assets/ppt.png";
export const MaxAllowedFileSize = 2048

export enum UserType {
  Employee = 1,
  Client = 2,
  Candidate = 3,
  Other = 4
}

export const UsersColumn = [
  { column: "StudentFirstName", header: "First Name", width: 10 },
  { column: "StudentLastName", header: "Last Name" },
  { column: "FatherName", header: "Father Name" },
  { column: "MotherName", header: "Mother Name" },
  { column: "Class", header: "Class" },
  { column: "Section", header: "Section" },
  { column: "Address", header: "Address", width: 12 },
  { column: "City", header: "City" },
  { column: "State", header: "State" },
  { column: "Pincode", header: "Pincode" },
  { column: "NickName", header: "Nick Name" }
];
export const CustomerColumn = [
  { column: "CustomerName", header: "Name", width: 10 },
  { column: "MobileNo", header: "MobileNo" },
  { column: "EmailId", header: "Email Id" },
  { column: "ShopName", header: "Shop Name" },
  { column: "ShopPhoneNumber", header: "Shop no. #" },
  { column: "GSTNo", header: "GST No.#" },
  { column: "CustomerUid", type: "hidden" }
];
export const VendorColumn = [
  { column: "CustomerName", header: "Name", width: 10 },
  { column: "MobileNo", header: "MobileNo" },
  { column: "EmailId", header: "Email Id" },
  { column: "ShopName", header: "Shop Name" },
  { column: "ShopPhoneNumber", header: "Shop no. #" },
  { column: "GSTNo", header: "GST No.#" },
  { column: "CustomerUid", type: "hidden" }
];

export const SQLDataType = [
  { value: "varchar", data: "varchar" },
  { value: "nvarchar", data: "nvarchar" },
  { value: "text", data: "text" },
  { value: "ntext", data: "ntext" },
  { value: "char", data: "char" },
  { value: "smallint", data: "smallint" },
  { value: "int", data: "int" },
  { value: "bigint", data: "bigint" },
  { value: "float", data: "float" },
  { value: "decimal", data: "decimal" },
  { value: "date", data: "date" },
  { value: "datetime", data: "datetime" },
  { value: "money", data: "money" },
  { value: "nchar", data: "nchar" },
  { value: "real", data: "real" },
  { value: "binary", data: "binary" },
  { value: "uniqueidentifier", data: "uniqueidentifier" },
  { value: "mobile", data: "mobile" },
  { value: "name [first name]", data: "firstname" },
  { value: "name [first middle & last name]", data: "fullname" },
  { value: "city", data: "city" },
  { value: "sports name", data: "sportsname" },
  { value: "player name", data: "playername" },
  { value: "country code", data: "countrycode" },
  { value: "email", data: "email" }
];

export const AutoPlayMessages = [
  {
    message: "Click the bottom to format your json string.",
    highlight: ["jsonformatter-dv"]
  },

  // JsonFormatter page
  {
    message:
      "Type your stringified json on left and will get parsed result on right screen.",
    highlight: []
  },

  // Homepage, Sql sample data, Click to go button
  {
    message: "Click the bottom for sql sample data with customization.",
    highlight: ["home-clicktogo"]
  },

  // Samplepage, Customize new page button.
  {
    message: "SQL sample manage page.",
    highlight: []
  },

  // Take count for table creation.
  {
    message: "Enter no# of tables that need to be generated.",
    highlight: ["tablecount"]
  },

  {
    message: "After providing table count, press enter.",
    highlight: []
  },

  // Enter name(s) of the table and proceed.
  {
    message: "Enter table name(s). Click Generate button or Press enter.",
    highlight: ['tableNameContainer input[name="dynamic-table-name"]']
  },

  {
    message: "Enter column name(s), datatype, primary key, etc.",
    highlight: ["dynamic-grid-table tbody tr"]
  },

  {
    message: "To map foreign key relation use [Table Mapping] tab.",
    highlight: ["maping-tab"]
  },

  {
    message: "Select [Actino Type] from dropdown.",
    highlight: ["actiontype"]
  },

  {
    message:
      "If you want sample data enter no# of row(s) and press Generate button.",
    highlight: ["rowsCount"]
  }
];
