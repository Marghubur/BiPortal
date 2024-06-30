import { Component, OnInit } from '@angular/core';
import { ResponseModel } from 'src/auth/jwtService';
import { CoreHttpService } from 'src/providers/AjaxServices/core-http.service';
import { ProjectHttpService } from 'src/providers/AjaxServices/project-http.service';
import { Toast, ErrorToast } from 'src/providers/common-service/common.service';
import { Filter } from 'src/providers/userService';
import { ProjectModal } from '../manage-project/manage-project.component';
import { autoCompleteModal, pairData } from 'src/app/util/iautocomplete/iautocomplete.component';
import { GetEmployees } from 'src/providers/ApplicationStorage';
import { EmployeeFilterHttpService } from 'src/providers/AjaxServices/employee-filter-http.service';

@Component({
  selector: 'app-projectperformance',
  templateUrl: './projectperformance.component.html',
  styleUrls: ['./projectperformance.component.scss']
})
export class ProjectperformanceComponent implements OnInit {
  times: Array<number> = [];
  isloading: boolean = false;
  isPageReady: boolean = false;
  projectMembers: Array<ProjectMember> = [];
  projectDetail: Array<ProjectModal> = [];
  projectData: Filter = new Filter();
  projectId: number = 0;
  progressValue = 75;
  workingDuration: Array<WorkingDuration> = [];
  isProjectView: boolean = true;
  employeeId: number = null;
  autoCompleteModal: autoCompleteModal = null;
  employeeData: Filter = new Filter();

  constructor(private httpProject: ProjectHttpService,
              private http: CoreHttpService,
              private filterHttp: EmployeeFilterHttpService) {}

  ngOnInit() {
    for (let i = 0; i <= 9; i++) {
      this.times.push(i);
    }

    this.autoCompleteModal = new autoCompleteModal();
    this.autoCompleteModal.data.push({
      text: 'All',
      value: 0
    });
    let empData = GetEmployees();
    empData.forEach(x => {
      x.text = `[${x.value}]` + " " + x.text;
    })
    this.autoCompleteModal = {
      data: this.autoCompleteModal.data.concat(empData),
      placeholder: "Select Employee",
      className: "normal"
    };

    this.loadData();
    // this.projectId = 2;
    // this.getProjectMember(null);
  }

  loadData() {
    this.isPageReady = false;
    this.http.post("Project/GetAllProjectDeatil", this.projectData).then((res:ResponseModel) => {
      if (res.ResponseBody && res.ResponseBody.length > 0) {
        this.projectDetail = res.ResponseBody;
        this.isPageReady = true;
        Toast("Record found");
      } else {
        this.isPageReady = true;
      }
    })
  }

  getProjectMember(e: any) {
    this.isloading = true;
    this.projectId = Number(e.target.value);
    this.workingDuration = [];
    if (this.projectId > 0) {
      this.httpProject.get(`projects/getProjectMemberDetail/${this.projectId}`).then((res:ResponseModel) => {
        if (res.ResponseBody) {
          this.bindData(res.ResponseBody);
          this.isloading = false;
          this.isPageReady = true
        }
      }).catch(e => {
        this.isloading = false;
      })
    } else {
      ErrorToast("Please select project first");
    }
  }

  bindData(res: any) {
    this.projectMembers = res;
          if (this.projectMembers && this.projectMembers.length > 0) {
            this.projectMembers.forEach(x => {
              if (x.FileName && x.FilePath)
                x.FullPath = `${this.http.GetImageBasePath()}${x.FilePath}/${x.FileName}`;
              else
                x.FullPath = "assets/images/faces/face.jpg";

                this.workingDuration.push({
                  ShiftDuration: 9,
                  WorkingHours: x.AllocatedMinutes/60,
                  Percentage: `${this.getWorkingHrsPercentage(480, x.AllocatedMinutes)}%`
                })
            })
          }
  }

  getWorkingHrsPercentage(shiftMins: number, workingMins: number) {
    var percentageValue = 0;
    if (shiftMins > 0 && workingMins > 0) {
      let value = (workingMins / shiftMins) * 100;
      percentageValue = Math.round(value * 100) / 100;
    }

    return percentageValue;
  }

  changePerfomaceView() {
    this.isProjectView = !this.isProjectView;
    this.projectMembers = [];
    if (this.isProjectView) {
      this.projectId = 0;
    } else{
      this.resetFilter();
    }
  }

  async serverFilter(query: string) {
    if (query == null) {
      query = "";
    }

    let filter: Filter = new Filter();
    filter.SearchString = query;
    filter.PageIndex = 1;
    filter.PageSize = 100;
    filter.CompanyId = 1;

    let result: Array<pairData> = await this.filterHttp.filter(filter);
    this.autoCompleteModal = {
      data: result,
      placeholder: "Select Employee",
      className: "normal"
    };
  }

  onEmloyeeChanged(_: any) {
    this.employeeData.SearchString = "";
    if (this.employeeId != null && this.employeeId > 0)
      this.employeeData.SearchString = `1=1 and p.EmployeeId = ${this.employeeId}`;
    else
      this.employeeData.SearchString = "1=1";

      this.getEmpProjectPertformance();
  }

  getEmpProjectPertformance() {
    this.isloading = true;
    this.workingDuration = [];
    this.httpProject.post('projects/getProjectMemberByFilter', this.employeeData).then((res:ResponseModel) => {
      if (res.ResponseBody) {
        this.bindData(res.ResponseBody);
        this.isloading = false;
        this.isPageReady = true
      }
    }).catch(e => {
      this.isloading = false;
    })
  }

  resetFilter() {
    this.employeeId = null;
    this.autoCompleteModal = {
      data: [],
      placeholder: "All result"
    };
    this.autoCompleteModal.data.push({
      text: 'All',
      value: 0
    });
    let empData = GetEmployees();
    empData.forEach(x => {
      x.text = `[${x.value}]` + " " + x.text;
    })
    this.autoCompleteModal = {
      data: this.autoCompleteModal.data.concat(empData),
      placeholder: "Select Employee",
      className: "normal"
    };
    this.employeeData = new Filter();
  }
}

interface ProjectMember {
  ProjectMemberDetailId: number,
  ProjectId: number,
  EmployeeId: number,
  FullName: string,
  Email: string,
  IsActive: boolean,
  MemberType: number,
  RoleName: string,
  FilePath: string,
  FileName: string,
  FullPath: string,
  AllocatedMinutes: number
}

interface WorkingDuration {
  ShiftDuration: number,
  WorkingHours: number,
  Percentage: string
}
