import { FileSystemType } from '../../providers/constants'

export class Files {
    IsFolder: boolean = false;
    NoOfItems: number = 0;
    ParentFolder: string | null = null;
    LocalImgPath: string = "";
    UserId: number = 0;
    FileName: string = "";
    AlternateName: string | null = null;
    FileExtension: string = "";
    FilePath: string = "";
    FileUid: number = 0;
    FileId: number = 0;
    ProfileUid: string = "";
    DocumentId: number = 0;
    Mobile: string = "";
    Email: string = "";
    FileType: string = "";
    FileSize: number = 0;
    UserTypeId: number = 0;
    TotalRecord?: number = 0;
    Status: string = "";
    PaidOn: Date | null = null;
    CreatedOn?: Date | null = null;
    CreatedBy?: string | null = null;
    SystemFileType?: FileSystemType = 1;
  }

  export class BillDetails {
    Name: string = "";
    BillNo: string = '';
    CGST: number = 0;
    ClientId: number =0;
    ClientName: string = '';
    FileExtension: string = '';
    FileName: string = '';
    FileOwnerId: number = 0;
    FilePath: string = '';
    FileUid: number = 0;
    GeneratedOn: string = '';
    IGST: number = 0;
    Month: string = '';
    Year: string = '';
    PaidOn: string = '';
    SGST: number =0;
    SalaryAmount: number = null;
    Status: string = '';
    TDS: number = 0;
    ReceivedAmount: number =null;
    BilledAmount: number = null;
    GSTAmount: number =null;
    Total: number = 0;
    GSTStatus: string = '';
    fromModel: string = '';
    toModel: string = '';
    Employee: string = '';
    TakeHome: number = null;
    Absent: number = 0;
    FromBillNo: number = null;
    ToBillNo: number = null;
    NoOfDays: number = 0;
  }

  export class Objective {
    ObjectiveId: number = 0;
    Objective: string = null;
    ObjSeeType: boolean = false;
    IsIncludeReview: boolean = false;
    Tag: string = null;
    ProgressMeassureType: number = 1;
    StartValue: number = 0;
    TargetValue: number = 0;
    TimeFrameStart: Date = null;
    TimeFrmaeEnd: Date = null;
    ObjectiveType: string = null;
    Description: string = null;
    CurrentValue: number = 0;
    CreatedOn: Date = null;
    UpdatedOn: Date = null;
    Status: number = 0;
  }
