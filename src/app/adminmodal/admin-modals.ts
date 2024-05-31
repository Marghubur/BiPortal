import { Files } from "../commonmodal/common-modals";

export class AssignedClients {
    IsActive: boolean = false;
    AssigneDate: Date = new Date();
    IsActiveRow: boolean = false;
    ClientUid: number = 0;
    ClientName: string | null = null;
    ActualPackage: number = 0.0;
    FinalPackage: number = 0.0;
    TakeHomeByCandidate: number = 0.0;
    EmployeeUid: number = 0;
    EmployeeMappedClientsUid: number = 0;
    IsPermanent: boolean = false;
  }

  export class EmployeeDetail {
    EmployeeUid: number = 0;
    FileId: number = 0;
    FirstName: string | null = null;
    LastName: string | null = null;
    Mobile: string | null = null;
    Email: string | null = null;
    BranchName: string | null = null;
    SecondaryMobile: string | null = null;
    LeavePlanId: number = 0;
    FatherName: string | null = null;
    CompanyId: number | null = null;
    MotherName: string | null = null;
    SpouseName: string | null = null;
    State: string | null = null;
    City: string | null = null;
    Pincode: number | null = null;
    Address: string | null = null;
    PANNo: string | null = null;
    AadharNo: string | null = null;
    AccountNumber: string | null = null;
    BankName: string | null = null;
    IFSCCode: string | null = null;
    Domain: string | null = null;
    Specification: string | null = null;
    ExprienceInYear: number | null = null;
    LastCompanyName: string | null = null;
    IsPermanent: boolean = false;
    IsActive: boolean = false;
    AllocatedClientId: number | null = null;
    AllocatedClientName: string | null = null;
    ActualPackage: number | null = null;
    FinalPackage: number | null = null;
    TakeHomeByCandidate: number | null = null;
    DOB: any = null;
    CreatedOn: Date | null = null;
    ReportingManagerId: number = 0;
    DesignationId: number | null = null;
    AccessLevelId: number = 2;
    UserTypeId: number = 2;
    CTC: number | null = null;
    SalaryDetailId: number = 0;
    AllocatedClients: Array<AssignedClients> = [];
    ClientJson: string = '';
    Gender: boolean = true;
    OrganizationId: number = 0;
    OldFileName: string | null = null;
    WorkShiftId: number = 0;
    IsPayrollOnCTC: boolean = true;
    SalaryGroupId: number = null;
    PFNumber: string = null;
    UniversalAccountNumber : string = null;
    PFJoinDate: Date = null;
  }

  export class ApprovalRequest {
    ApprovalRequestId: number = null;
    AttendanceId: number = 0;
    UserName:string = '';
    EmployeeName: string = '';
    Message:string = '';
    UserId:number = null;
    UserTypeId: number = null;
    RequestedOn:Date = null;
    Email:string  = '';
    Mobile:string = '';
    FromDate:Date = null;
    ToDate:Date = null;
    AssigneeId:number = null;
    ProjectId:number = null;
    ProjectName:string = '';
    RequestStatusId: number = 0;
    RequestType: string = "";
  }

  export class PdfModal {
    header: string = 'Staffing Bill';
    UpdateSeqNo: number = 0;
    IsCustomBill: boolean = false;
    billForMonth: string = null;
    billYear: number = null;
    billNo: string = null;
    dateOfBilling: Date = new Date();
    daysAbsent: number = 0;
    cGST: number = 0;
    sGST: number = 0;
    iGST: number = 0;
    cGSTAmount: number = 0;
    sGSTAmount: number = 0;
    iGSTAmount: number = 0;
    workingDay: number = 0;
    isHalfDay: number = 0;
    actualDaysBurned: number = 0;
    packageAmount: number = 0;
    grandTotalAmount: number = 0;
    receiverFirstAddress: string = null;
    receiverGSTNo: string = null;
    receiverSecondAddress: string = null;
    receiverPrimaryContactNo: string = null;
    receiverEmail: string = null;
    receiverCompanyName: string = null;
    receiverCompanyId: number = null;
    developerName: string = "NA";
    developerId: number = 0;
    senderCompanyName: string = null;
    senderId: number = 0;
    senderGSTNo: string = null;
    senderFirstAddress: string = null;
    senderSecondAddress: string = null;
    senderPrimaryContactNo: string = null;
    senderEmail: string = null;
    ClientId: number = 0;
    receiverThirdAddress: string = "";
    senderThirdAddress: string = "";
    receiverPincode: number = 0;
    billingMonth: Date = null;
    EmployeeId: number = 0;
    billId: number = 0;
    FileId: number = 0;
    StatusId: number = 2;
    PaidOn: Date = null;
  }

  export class ApplicationData {
    FileDetail: any = null;
    Employees: Array<any> = null;
    Organizations: Array<any> = [];
    TimesheetDetails: Array<any> = [];
    MissingDate: Array<any> = [];
    TimesheetDetail: any = null;
  }

  export class clientModel {
    ClientName: string = '';
    City: string = '';
    PrimaryContactNo: number = null;
    Email: string = '';
    FirstAddress: string = '';
    Total: number = 0;
  }

  export class CompanyInformationClass {
    LegalEntity: string = '';
    Signature: string = '';
    LegalNameOfCompany: string = '';
    TypeOfBusiness: string = '';
    InCorporationDate: Date = null;
    FullAddress: string = '';
    CompanyId: number = 0;
    CompanyName: string = '';
    OrganizationId: number = 0;
  }


export class organizationAccountModal {
    OrganizationId: number = 0;
    GSTNo: string = null;
    AccountNo: string = null;
    BankName: string = null;
    Branch: string = null;
    IFSC: string = null;
    PANNo: string = null;
    IsPrimaryAccount: boolean = false;
    TradeLicenseNo: string = '';
    BranchCode: string = '';
    CompanyId: number = 0;
    BankAccountId: number = 0;
    OpeningDate: Date = null;
    ClosingDate: Date = null;
}

export class CompanySetting {
    SettingId: number = 0;
    CompanyId: number = 0;
    ProbationPeriodInDays: number = 0;
    NoticePeriodInDays: number = 0;
    IsPrimary: boolean = true;
    DeclarationStartMonth: number = 0;
    DeclarationEndMonth: number = 0;
    FinancialYear: number = 0;
    DefaultManagers: string = "";
    AttendanceSubmissionLimit: number = null;
    LeaveAccrualRunCronDayOfMonth: number = 0;
    EveryMonthLastDayOfDeclaration: number = 0;
    IsJoiningBarrierDayPassed: boolean = false;
    ExcludePayrollFromJoinDate: number = 0;
}

export class UserProfile {
    FirstName: string = '';
    LastName: string = '';
    Email: string = '';
    Mobile: string = '';
    UserId: number = 0;
    FileId: number = 0;
    FileName: string = '';
    FilePath: string = '';
}

export class DocumentUser {
    PageName: string = "";
    Mobile: string = "";
    Email: string = "";
    UserTypeId: number = 0;
    UserId: number = 0;
    Name?: string = "";
  }

  export class OnlineDocModel {
    constructor(data: any) {
      this.DocumentId = data['DocumentId'];
      this.Title = data['Title'];
      this.Description = data['Description'];
      this.UserId = data['UserId'];
      this.DocPath = data['DocPath'];
      this.CreatedOn = data['CreatedOn'];
      this.UpdatedOn = data['UpdatedOn'];
    }
    DocumentId: number = 0;
    Title: string = null;
    Description: string = null;
    UserId: string = null;
    DocPath: string = null;
    TotalRows: number = 0;
    CreatedOn: string = null;
    UpdatedOn: string = null;
  }

  export class PersonDetail {
    EmployeeUid: number = 0;
    FirstName: string = null;
    LastName: string = null;
    Mobile: string = null;
    Email: string = null;
    BranchName: string = null;
    SecondaryMobile: string = null;
    FatherName: string = null;
    MotherName: string = null;
    SpouseName: string = null;
    State: string = null;
    City: string = null;
    Pincode: number = null;
    Address: string = null;
    PANNo: string = null;
    AadharNo: string = null;
    AccountNumber: string = null;
    BankName: string = null;
    IFSCCode: string = null;
    Domain: string = null;
    Specification: string = null;
    ExprienceInYear: number = null;
    LastCompanyName: string = null;
    IsPermanent: boolean = false;
    AllocatedClientId: number = null;
    AllocatedClientName: string = null;
    ActualPackage: number = null;
    FinalPackage: number = null;
    TakeHomeByCandidate: number = null;
    Total: number = null;
  }

  export class DocumentDetail {
    TotalFileCount?: number = 0;
    FolderPath: string = "";
    IsRootFolder: boolean = false;
    FolderName: string = "";
    ContentDetails: Array<Files> = [];
  }

  export class EmpTempMapping {
    EmailTempMappingId: number = 0;
    TemplateId: number = 0;
    Description: string = null;
    EmailTemplateName: string = null;
    TemplateName: string = "";
    ActionType: string = "";
    Total: number = 0;
  }

  export class EmailLink {
    EmailTemplateId: number = 0;
    TemplateName: string = null;
    PageName: string = null;
    PageDescription: string = null;
    IsEmailGroupUsed: boolean = false;
    EmailGroupId: number = null;
    IsTriggeredAutomatically: boolean = false;
    Emails: Array<string> = [];
    SubjectLine: string = null;
    EmailTitle: string = null;
    Salutation: string = null;
    EmailClosingStatement: string = null;
    BodyContent: string = null;
    EmailNote: string = null;
    SignatureDetail: string = null;
    ContactNo: string = null;
    FileId: number = 0;
    LogoPath: string = "";
    Description: string = null;
    EmailsJson: string = null;
  }

  export class EmailSettings {
    EmailSettingDetailId: number = 0;
    CompanyId: number = 0;
    OrganizationName: string = null;
    CompanyName: string = null;
    EmailAddress: string = null;
    EmailHost: string = null;
    PortNo: number = null;
    EnableSsl: boolean = null;
    DeliveryMethod: string = null;
    UserDefaultCredentials: boolean = null;
    Credentials: string = null;
    LogoImgPath: string = null;
    FileId: number = 0;
    EmailName: string = null;
    POP3EmailHost: string = null;
    POP3PortNo: number = 0;
    POP3EnableSsl: boolean = false;
    IsPrimary: boolean = false;
  }

  export class CompanyHoliday {
    CompanyCalendarId: number = 0;
    CompanyId: number = 0;
    HolidayDate: Date = null;
    EventName: string = null;
    IsHoliday: boolean = true;
    IsHalfDay: boolean = false;
    DescriptionNote: string = null;
    ApplicableFor: number = 0;
    Year: number = new Date().getFullYear();
    IsPublicHoliday: boolean = false;
    Country: string = null;
    TotalDays: number = 0;
    IsCompanyCustomHoliday: boolean = false;
    Total: number = 0;
    Index: number = 0;
    HolidayType: number = 2;
  }

  export class EmailTemplate {
    EmailTemplateId: number = 0;
    TemplateName: string = null;
    SubjectLine: string = null;
    EmailTitle: string = null;
    Salutation: string = null;
    EmailClosingStatement: string = null;
    BodyContent: string = null;
    EmailNote: string = null;
    SignatureDetail: string = null;
    ContactNo: string = null;
    FileId: number = 0;
    LogoPath: string = "";
    Description: string = null;
    Total: number = 0;
    Index: number = 0;
  }

  export class ApprovalWorkFlowChain {
    ApprovalChainDetailId: number = 0;
    ApprovalWorkFlowId: number = 0;
    Title: string = null;
    TitleDescription: string = null;
    Status: number = null;
    IsAutoExpiredEnabled: boolean = false;
    AutoExpireAfterDays: number = 0;
    NoOfApprovalLevel: number = 0;
    IsSilentListner: boolean = false;
    ListnerDetail: string = '[]';
    ApprovalChainDetails: Array<ApprovalChainDetail> = new Array<ApprovalChainDetail>();
  }

  export class ApprovalChainDetail {
    ApprovalChainDetailId: number = 0;
    ApprovalWorkFlowId: number = 0;
    AssignieId: number = null;
    IsRequired: boolean = false;
    IsForwardEnabled: boolean = false;
    ForwardWhen: number = 0;
    ForwardAfterDays: number = 0;
    ApprovalStatus: number = null;
  }

  export class Shift {
    WorkShiftId: number = 0;
    CompanyId: number = 0;
    Department: number = null;
    WorkFlowCode: string = 'code';
    ShiftTitle: string = null;
    Description: string = null;
    IsMon: boolean = false;
    IsTue: boolean = false;
    IsThu: boolean = false;
    IsWed: boolean = false;
    IsFri: boolean = false;
    IsSat: boolean = false;
    IsSun: boolean = false;
    TotalWorkingDays: number = null;
    StartDate: Date = null;
    EndDate: Date = null;
    OfficeTime: string = null;
    Duration: number = null;
    LunchDuration: number = null;
    Status: number = 0;
    LastUpdatedOn: Date = null;
    RowIndex: number = 0;
    Total: number = 0;
  }

  export class Notification {
    NotificationId: number = 0;
    Topic: string = null;
    CompanyId: number = 0;
    BriefDetail: string = null;
    CompleteDetail: string = null;
    Total: number = 0;
    RowIndex: number = 0;
    CreatedOn: Date = null;
    UpdatedOn: Date = null;
    StartDate: Date = null;
    EndDate: Date = null;
    IsGeneralAnnouncement: boolean = false;
    AnnouncementType: number = 0;
    AnnouncementId: string = null;
    Departments: Array<any> =null;
    DepartmentId: number = 0;
    IsExpired: boolean = false;
    FileIds: Array<any>= [];
  }

  export class AnnexureOfferLeter {
    AnnexureOfferLetterId: number= 0;
    CompanyId: number= 0;
    CompanyName: string= '';
    TemplateName: string= null;
    BodyContent: string= '';
    FileId: number= 0;
  }

  export class OrganizationModal {
    CompanyId: number = 0;
    OrganizationId: number = 0;
    BankAccountId: number = 0;
    OrganizationName: string = null;
    CompanyName: string = null;
    CompanyDetail: string = null;
    SectorType: number = 0;
    City: string = null;
    State: string = null;
    Country: string = null;
    FirstAddress: string = null;
    SecondAddress: string = null;
    ThirdAddress: string = null;
    ForthAddress: string = null;
    FullAddress: string = null;
    MobileNo: string = null;
    Email: string = null;
    FirstEmail: string = null;
    SecondEmail: string = null;
    ThirdEmail: string = null;
    ForthEmail: string = null;
    PrimaryPhoneNo: string = null;
    SecondaryPhoneNo: string = null;
    Fax: string = null;
    Pincode: number = 0;
    FileId: number = 0;
    PANNo: string = null;
    TradeLicenseNo: string = null;
    GSTNo: string = null;
    AccountNo: string = null;
    BankName: string = null;
    Branch: string = null;
    BranchCode: string = null;
    OpeningDate: string = null;
    ClosingDate: string = null;
    IFSC: string = null;
    LegalDocumentPath: string = null;
    LegalEntity: string = null;
    LegalNameOfCompany: string = null;
    TypeOfBusiness: string = null;
    InCorporationDate: string = null;
    IsPrimaryCompany: boolean = false;
    FixedComponentsId: string = null;
    OrgMobileNo: string = null;
    OrgEmail: string = null;
    OrgPrimaryPhoneNo: string = null;
    OrgSecondaryPhoneNo: string = null;
    OrgFax: string = null;
    Files: any = null;
  }

  export class Product {
    Total: number = 0;
    Index: number = 0;
    OrderDate: Date = null;
    StockStatus: number = null;
    Quantity: number = null;
    ModalNum: string = null;
    Brand: string = null;
    ProductId: number = 0;
    SiteUrl: string = null;
    MRP: number = 0;
    CatagoryName: string = null;
    TitleName: string = null;
    SerialNo: string =null;
    ProductCode: string = null;
    PurchasePrice: number = 0;
    FileIds: string = null;
  }

  export class Catagory {
    Total: number = 0;
    Index: number = 0;
    CatagoryId: number = 0;
    GroupId: number = 0;
    CatagoryCode: string = null;
    CatagoryDescription: string = null;
  }

  export class employeeModel {
    Name: string = '';
    LastName: string = '';
    Mobile: string = null;
    Email: string = '';
    Total: number = 0;
    EmployeeUid: number = 0;
    FirstName?: string = '';
    ClientJson?: any = null;
    IsActive?: boolean = null;
    FilePath?: string = null;
    FileName?: string = null;
    FileExtension?: string = null;
    ProfilePath?: string = null;
  }

  export class clientModal {
    WorkShiftId: number = 0;
    ClientId: number = 0;
    ClientName: string = null;
    MobileNo: string = null;
    PrimaryPhoneNo: string = null;
    SecondaryPhoneNo: string = null;
    Email: string = null;
    OtherEmail_1: string = null;
    OtherEmail_2: string = null;
    OtherEmail_3: string = null;
    OtherEmail_4: string = null;
    Fax: string = null;
    FirstAddress: string = null;
    SecondAddress: string = null;
    ThirdAddress: string = null;
    ForthAddress: string = null;
    Pincode: number = 0;
    City: string = null;
    State: string = null;
    Country: string = null;
    GSTNO: string = null;
    AccountNo: string = null;
    BankName: string = null;
    BranchName: string = null;
    IFSC: string = null;
    PanNo: string = null;
    AdminId: number = 0
    IsActive: boolean = false;
    FileId: number = 0;
    OldFileName: string = null;
  }

  export class Service {
    ServiceRequestId: number = 0;
    CompanyId: number = 0;
    RequestTypeId: string = null;
    RequestTitle: string = null;
    RequestDescription: string = null;
    Quantity: number = 0;
    Duration: number = 0;
    FromDate: Date = new Date();
    ToDate: Date = new Date();
    Reference: string = null;
    RequestStatus: number = 0;
    RequestedBy: number = 0;
    RequestedOn: Date = new Date();
    UpdatedOn: Date = null;
  }

  export class CompanyGroup {
    CompanyId: number = 0;
    CompanyName: string = '';
    CompanyDetail: string = '';
    InCorporationDate: Date = null;
    Email: string = '';
    OrganizationId: number = 0;
  }

  export class PTax {
    StateName: string = null;
    MinIncome: number = 0;
    MaxIncome: number = 0;
    TaxAmount: number = 0;
    Gender: number = 0;
    PtaxSlabId: number = 0;
    CompanyId: number = 0;
  }

  export class WorkFlow {
    ApprovalChainDetailId: number = 0;
    ApprovalWorkFlowId: number = 0;
    Title: string = null;
    TitleDescription: string = null;
    Status: number = 0;
    IsAutoExpiredEnabled: boolean = false;
    AutoExpireAfterDays: number = null;
    IsSilentListner: boolean = false;
    ListnerDetail: string = null;
    Index: number = 0;
    Total: number = 0;
  }

  export class LeaveModal {
    LeaveFromDay: Date = null;
    LeaveToDay: Date = null;
    Session: string = "1";
    Reason: string = null;
    AssigneId: number = 0;
    AssigneeEmail: string = null;
    ForYear: number = 0;
    RequestType: number = 0;
    LeaveTypeId: number = 0;
    ForMonth: number = 0;
    UserTypeId: number = 0;
    EmployeeId: number = 0;
    LeavePlanName: string = null;
    IsProjectedFutureDateAllowed: boolean = false;
    ProjectId: number = 0;
  }

  export class LeaveDetails {
    EmployeeId:number = 0;
    EmployeeName: string = '';
    ProjectId: number = 0;
    AssignTo: number = 0;
    LeaveTypeId: number = 0;
    Session: string = "1";
    LeaveFromDay: Date = null;
    LeaveToDay: Date = null;
    LeaveStatus: number = 0;
    RespondedBy: number = 0;
    UpdatedOn: Date = null;
    Reason: string = '';
    RequestedOn: Date = null;
    NoOfDays: number = null;
  }
