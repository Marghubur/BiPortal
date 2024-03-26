import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Files } from 'src/app/commonmodal/common-modals';
import { ResponseModel } from 'src/auth/jwtService';
import { CoreHttpService } from 'src/providers/AjaxServices/core-http.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { Dashboard } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';
declare var $: any;

@Component({
  selector: 'app-initial-setup',
  templateUrl: './initial-setup.component.html',
  styleUrls: ['./initial-setup.component.scss']
})
export class InitialSetupComponent implements OnInit {
  activeIndex: number = 1;
  declarationForm: FormGroup;
  defaultFinancialYear: number = 0;
  isLoading: boolean = false;
  payrollSettingForm: FormGroup;
  months: Array<any> = ['JANUARY', 'FEBUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  days: Array<any> = [];
  leaveTypes: Array<any> = [];
  planLeaveTypes: Array<any> = [];
  planName: string = "DEFAULT LEAVE PLAN";
  presentMonthDays: number = 30;
  FileDocumentList: Array<any> = [];
  companyLogo: any = null;
  FilesCollection: Array<any> = [];

  constructor(private fb: FormBuilder,
              private http: CoreHttpService,
              private nav: iNavigation) {}

  ngOnInit(): void {
    let date = new Date();
    this.prefixDays();
    if (date.getMonth() > 2 && date.getMonth() < 11)
      this.defaultFinancialYear = date.getFullYear();
    else
      this.defaultFinancialYear = date.getFullYear() - 1;

    this.initDeclaration();
    this.initPayrollSetting();
    this.getLeaveType();
  }

  initDeclaration() {
    this.declarationForm = this.fb.group({
      CompanyId: new FormControl(1),
      DeclarationStartMonth: new FormControl(4),
      DeclarationEndMonth: new FormControl(3),
      FinancialYear: new FormControl(this.defaultFinancialYear),
      EveryMonthLastDayOfDeclaration: new FormControl(25)
    })
  }

  initPayrollSetting() {
    this.payrollSettingForm = this.fb.group({
      CompanyId: new FormControl(1),
      PayFrequency: new FormControl("monthly"),
      PayCycleMonth: new FormControl(4),
      PayCycleDayOfMonth: new FormControl(1),
      PayCalculationId: new FormControl(1),
      IsExcludeHolidays: new FormControl(false)
    })
  }

  selectDeclartionStartMonth(e: any) {
    let value = Number(e.target.value);
    if (value > 0) {
      let month = 0;
      if (value == 1)
        month = 12;
      else
        month = value - 1;

      this.declarationForm.get('DeclarationEndMonth').setValue(month);
    }
  }

  onPayCycleChanged(e: any) {
    let value = Number(e.target.value);
    this.presentMonthDays = new Date(this.defaultFinancialYear, value, 0).getDate();
    this.prefixDays();
  }


  saveDeclarationSetting() {
    this.isLoading = true;
    let value = this.declarationForm.value;
    this.isLoading = true;
    this.http.put(`company/UpdateCompanyInitialSetting/${value.CompanyId}`, value).then((res:ResponseModel) => {
      if (res.ResponseBody) {
        this.isLoading = false;
        Toast("Declaration setting save successfully");
        this.activeIndex = this.activeIndex + 1;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  savePayRollSetting() {
    this.isLoading = true;
    let value = this.payrollSettingForm.value;
    this.http.post('Settings/InsertUpdatePayrollSetting', value).then((response:ResponseModel) => {
      if (response.ResponseBody) {
        Toast("Payroll setting save successfully.")
        this.activeIndex = this.activeIndex + 1;
      }
      this.isLoading = false;
    }).catch(e => {
      this.isLoading = false;
    })
  }

  saveLeavePlan() {
    this.isLoading = true;
    if (this.planLeaveTypes.length > 0) {
      let value = {
        PlanName: this.planName,
        AssociatedPlanTypes: JSON.stringify(this.planLeaveTypes.map(x => x.LeavePlanTypeId))
      };
      this.http.post('Leave/AddInitialLeavePlan', value).then((response:ResponseModel) => {
        if (response.ResponseBody) {
          Toast(response.ResponseBody);
          this.nav.navigate(Dashboard, null);
        }
        this.isLoading = false;
      }).catch(e => {
        this.isLoading = false;
      })
    } else {
      ErrorToast("Please add leave plan type");
      this.isLoading = false;
      return;
    }
  }

  prefixDays() {
    this.days = [];
    let i = 1;
    let prefix = '';
    while(i <= this.presentMonthDays) {
      switch(i) {
      case 1:
      case 21:
        prefix = 'st';
        break;
      case 2:
      case 22:
        prefix = 'nd';
        break;
      case 3:
      case 33:
        prefix = 'rd';
        break;
      default:
        prefix = 'th';
        break;
      }
      this.days.push({
        value: i,
        text: `${i}${prefix}`
      });
      i++;
    }
  }
  
  getLeaveType() {
    this.isLoading = true;
    this.http.get("leave/GetLeaveTypeFilter").then(response => {
      if(response.ResponseBody) {
        this.leaveTypes = response.ResponseBody;
        //$("#leavePlanTypeModal").modal('show');
        this.isLoading = false;
      } 
    });
  }

  assignLeaveType(e: any, item: any) {
    if (e.target.checked == true) {
      let elem = this.planLeaveTypes.find(x => x.LeavePlanTypeId === item.LeavePlanTypeId);
      if (elem == null)
        this.planLeaveTypes.push(item);
    } else {
        let index = this.planLeaveTypes.findIndex(x => x.LeavePlanCode === item.LeavePlanCode);
        if (index > -1)
          this.planLeaveTypes.splice(index, 1);
    }
  }

  cleanLeaveType() {
    this.planLeaveTypes = [];
  }

  fireBrowser() {
    this.FileDocumentList = [];
    this.FileDocumentList = [];
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
    
    if (errorcounter === 0) {
      let formData = new FormData();
      formData.append(this.FileDocumentList[0].FileName, this.FilesCollection[0]);
      let files = {
        FileId: 0,
        // Email: this.currentCompany.Email,
        // CompanyId: this.currentCompany.CompanyId,
        FileDescription: '',
        FileRole: ''
      };
      formData.append('FileDetail', JSON.stringify(files));
      this.http.post("company/addcompanyfiles", formData).then((res:ResponseModel) => {
        if (res.ResponseBody) {
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
}
