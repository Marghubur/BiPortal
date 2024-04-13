import { Component, OnInit } from '@angular/core';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ResponseModel } from 'src/auth/jwtService';
import { CoreHttpService } from 'src/providers/AjaxServices/core-http.service';
import { ProjectHttpService } from 'src/providers/AjaxServices/project-http.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { Filter } from 'src/providers/userService';
declare var $: any;

@Component({
  selector: 'app-capacity-management',
  templateUrl: './capacity-management.component.html',
  styleUrls: ['./capacity-management.component.scss']
})
export class CapacityManagementComponent implements OnInit {
  isPageReady: boolean = false;
  projectData: Filter = null;
  projectDetail: Array<any> = [];
  isReady: boolean = false;
  shiftTimes: Array<number> = [];
  projectMembers: Array<any> = [];
  today: Date = new Date();
  daysOfWeek: Array<any> = [];
  isLoading: boolean = false;
  selectedMember: any = null;
  model: NgbDateStruct;
  
  constructor(private http: CoreHttpService,
              private projectHttp: ProjectHttpService) {}

  ngOnInit(): void {
    this.projectData = new Filter();
    for (let index = 0; index < 24; index++) {
      this.shiftTimes.push(index);
    }

    this.getDaysofWeek();
    //this.loadData();
    this.projectDetail.push({
      ProjectName: "A",
      ProjectId: 1
    });
    this.isPageReady = true;
    this.getProjectMembers(1);
  }

  getDaysofWeek() {
    this.daysOfWeek = [
      { day: 'Mon', id: 1, isEnabled: false },
      { day: 'Tue', id: 2, isEnabled: false  },
      { day: 'Wed', id: 3, isEnabled: false  },
      { day: 'Thu', id: 4, isEnabled: false  },
      { day: 'Fri', id: 5, isEnabled: false  },
      { day: 'Sat', id: 6, isEnabled: false  },
      { day: 'Sun', id: 7, isEnabled: false  }
    ];
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

  selectProject(e: any) {
    let value = e.target.value;
    if (value) {
      this.getProjectMembers(Number(value));
    }
  }

  getProjectMembers(projectId: number) {
    this.isReady = false;
    this.projectHttp.get(`projects/getProjectMemeberDetail/${projectId}`).then((response: ResponseModel) => {
      if(response.ResponseBody) {
        this.projectMembers = response.ResponseBody;
        if (this.projectMembers && this.projectMembers.length > 0) {
          this.projectMembers.forEach(x => {
            if (x.FilePath && x.FileName)
              x.ImgUrl = `${this.http.GetImageBasePath()}${x.FilePath}/${x.FileName}`;
            else
              x.ImgUrl = "assets/images/faces/face.jpg"
          })
        }
        this.isReady = true;
      }
    }).catch(e => {
      ErrorToast(e.error);
      this.isReady = true;
    });
  }

  addWOrkingHrsPopup(index: number, item: any) {
    this.selectedMember = item;
    this.selectedMember.From = index;
    this.selectedMember.To = 0;
    this.getDaysofWeek();
    $("#workingHrsModal").modal('show');
  }

  toggleDays(id: number) {
    let item = this.daysOfWeek.find(x => x.id == id);
    if(!item.isEnabled) {
      item.isEnabled = true;
    } else {
      item.isEnabled = false;
    }
  }

  updateTime() {
    this.selectedMember.To = Number(this.selectedMember.To.split(":")[0]);
    console.log(this.selectedMember);
    $("#workingHrsModal").modal('hide');
  }

  onDateSelection(e: NgbDateStruct) {
    let date = new Date(e.year, e.month - 1, e.day);
    this.today = date;
  }
}
