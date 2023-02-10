import { Component, OnInit } from '@angular/core';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { Files } from '../documents/documents.component';
declare var $: any;

@Component({
  selector: 'app-companylogo',
  templateUrl: './companylogo.component.html',
  styleUrls: ['./companylogo.component.scss']
})
export class CompanylogoComponent implements OnInit {
  companyLogo: any = null;
  FileDocumentList: Array<Files> = [];
  FilesCollection: Array<any> = [];
  isLoading: boolean = false;
  currentCompany: any = null;
  fileList: Array<any> = [];
  basePath: string = "";
  fileDescription: string = null;
  fileRoles: Array<string> = ["Company Primary Logo", "Company Logo", "Other File"];
  fileRole: string = "";
  fileId: number = 0;
  isPageReady: boolean = false;
  constructor(
    private http: AjaxService,
    private local: ApplicationStorage
  ) { }

  ngOnInit(): void {
    this.basePath = this.http.GetImageBasePath();
    let data = this.local.findRecord("Companies");
    if (!data) {
      ErrorToast("Current organization or company detail not found. Please contact to admin.");
      return;
    } else {
      this.currentCompany = data.find(x => x.IsPrimaryCompany == 1);
      if (!this.currentCompany) {
        ErrorToast("Fail to get company detail. Please contact to admin.");
        return;
      }

      this.loadCompanyFiles();
    }
  }

  loadCompanyFiles() {
    this.isPageReady = false;
    this.http.get(`company/getcompanyfiles/${this.currentCompany.CompanyId}`).then((res: ResponseModel) => {
      this.manangeCompanyFiles(res.ResponseBody);
    }).catch(e => {
      this.isPageReady = true;
    });
  }

  manangeCompanyFiles(fileDetail: Array<any>) {
    this.fileList = [];
    if (fileDetail && fileDetail.length > 0) {
      this.fileList = fileDetail;
      this.fileList.map(item => {
        item.FilePath = `${this.basePath}${item.FilePath}/${item.FileName}`;
      });
    } else {
      ErrorToast("Fail to load company file detail.");
    }
    this.isPageReady = true;
  }

  fireBrowser() {
    $('#uploadCompanyLogo').click();
  }

  logoFile(event: any) {
    if (event.target.files) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event: any) => {
        this.companyLogo = event.target.result;
      };
      let selectedfile = event.target.files;
      let file = <File>selectedfile[0];
      let item: Files = new Files();
      item.FileName = file.name;
      item.FileType = file.type;
      item.FileSize = (Number(file.size)/1024);
      item.FileExtension = file.type;
      item.DocumentId = 0;
      item.ParentFolder = '';
      this.FileDocumentList.push(item);
      this.FilesCollection.push(file);
    }
  }

  saveLogo() {
    this.isLoading = true;
    let errorcounter = 0;
    if (this.FilesCollection.length < 0) {
      ErrorToast("Please add logo first.");
      this.isLoading = false;
      return;
    }
    if (this.fileDescription == null || this.fileDescription == "") {
      ErrorToast("File role is manditory");
      this.fileDescription = null;
      this.isLoading = false;
      errorcounter++;
    }
    if (this.fileRole == null || this.fileRole == "") {
      ErrorToast("File role is manditory");
      this.fileRole = null;
      this.isLoading = false;
      errorcounter++;
    }
    if (errorcounter === 0) {
      let formData = new FormData();
      formData.append(this.FileDocumentList[0].FileName, this.FilesCollection[0]);
      let files = {
        FileId: this.fileId,
        Email: this.currentCompany.Email,
        CompanyId: this.currentCompany.CompanyId,
        FileDescription: this.fileDescription,
        FileRole: this.fileRole
      };
      formData.append('FileDetail', JSON.stringify(files));
      this.http.post("company/addcompanyfiles", formData).then((res:ResponseModel) => {
        if (res.ResponseBody) {
          this.manangeCompanyFiles(res.ResponseBody);
          $('#logoModal').modal('hide');
          Toast('Logo uploaded successfully.');
        }
        this.isLoading = false;
      }).catch(e => {
        this.isLoading = false;
      })
    } else {

    }

  }

  editFile(item: any) {
    this.companyLogo = item.FilePath;
    this.fileId = item.FileId
    this.fileDescription = item.FileDescription;
    this.fileRole = item.FileRole;
    $('#logoModal').modal('show');
  }

  resetFile() {
    this.fileId = 0;
    this.FileDocumentList = [];
    this.FilesCollection = [];
    this.companyLogo = "";
    this.fileDescription = "";
    this.fileRole = "";
  }

  logoPopUp() {
    this.resetFile();
    $('#logoModal').modal('show');
  }

  deleteFile(item: any) {
    this.isLoading = true;
    if (item == null) {
      this.isLoading = false;
      ErrorToast("Invalid file sselected");
      return;
    }
    this.http.post("Company/DeleteCompanyFile", item).then(res => {
      if (res.ResponseBody) {
        this.manangeCompanyFiles(res.ResponseBody);
        Toast("File deleted successfully.");
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
      ErrorToast('Fail to delete the file');
    })
  }

}
