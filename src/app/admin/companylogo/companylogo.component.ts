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
  FileDescription: string = "";

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
    this.http.get(`company/getcompanyfiles/${this.currentCompany.CompanyId}`).then((res: ResponseModel) => {
      this.manangeCompanyFiles(res.ResponseBody);
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
    if (this.FilesCollection.length < 0) {
      ErrorToast("Please add logo firs.");
      this.isLoading = false;
      return;
    }
    let formData = new FormData();
    formData.append(this.FileDocumentList[0].FileName, this.FilesCollection[0]);
    let files = {
      FileId: 0,
      Email: this.currentCompany.Email,
      CompanyId: this.currentCompany.CompanyId,
      FileDescription: this.FileDescription,
      FileRole: "Company Primary Logo"
    };

    formData.append('FileDetail', JSON.stringify(files));
    this.http.post("company/addcompanyfiles", formData).then((res:ResponseModel) => {
      if (res.ResponseBody)
        Toast('Logo uploaded successfully.');
      this.isLoading = false;
    }).catch(e => {
      this.isLoading = false;
    })
  }

  resetFile() {
    this.FileDocumentList = [];
    this.FilesCollection = [];
    this.companyLogo = "";
    this.FileDescription = "";
  }

  logoPopUp() {
    this.resetFile();
    $('#logoModal').modal('show');
  }

}
