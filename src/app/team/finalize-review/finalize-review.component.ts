import { Component, OnInit } from '@angular/core';
import { GetRoles } from 'src/providers/ApplicationStorage';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { UserService } from 'src/providers/userService';
declare var $: any;
declare var bootstrap: any;
import 'bootstrap';
import { ResponseModel } from 'src/auth/jwtService';
import { iNavigation } from 'src/providers/iNavigation';
import { ManageAppraisalCategory, ManageReview, SERVICE } from 'src/providers/constants';

@Component({
  selector: 'app-finalize-review',
  templateUrl: './finalize-review.component.html',
  styleUrls: ['./finalize-review.component.scss']
})
export class FinalizeReviewComponent implements OnInit {
  isPageReady: boolean = false;
  isLoading: boolean = false;
  userDetail: any = null;
  designation: Array<any> = null;
  isSubmitted: boolean = false;
  allAppraisalFinalizer: Array<any> = [];
  allMemberAppraisalFinalizer: Array<any> = [];
  isObjectivesReady: boolean = false;
  selectedEmploye: any = null;
  objectives: Array<any> = [];
  userNameIcon: string = null;
  appraisalReviewStatus: number = 0;

  constructor(private http: AjaxService,
              private user: UserService,
              private nav: iNavigation) {}

  ngOnInit(): void {
    this.userDetail = this.user.getInstance();
    this.designation = GetRoles();
    this.loadData();
  }

  loadData() {
    this.isPageReady = false;
    this.http.get("promotion/getApprovePromotionAndHike", SERVICE.PERFORMANCE).then((res: ResponseModel) => {
      if (res.ResponseBody) {
        let finalizeAppraisalData = res.ResponseBody;
        if (finalizeAppraisalData && finalizeAppraisalData.length > 0) {
          let result = finalizeAppraisalData.reduce((a, b) => {
            a[b.ProjectName] = a[b.ProjectName] || [];
            a[b.ProjectName].push(b);
            return a;
          }, Object.create(null));

          let keys = Object.keys(result);
          let i = 0;
          while(i < keys.length) {
            let teams = [];
            let value = result[keys[i]].map(x => x.Team);
            if (value && value.length > 0) {
              value.forEach(x => {
                if (teams.indexOf(x) == -1)
                  teams.push(x);
              });
            }
            let members = [];
            let member = result[keys[i]].map(x => x.FullName);
            if (member && member.length > 0) {
              member.forEach(x => {
                if (members.indexOf(x) == -1)
                  members.push(x);
              });
            }
            this.allAppraisalFinalizer.push({
              MemberName:members ,
              ManagerName: result[keys[i]][0].ManagerName,
              ProjectManagerId: result[keys[i]][0].ProjectManagerId,
              ProjectDescription: result[keys[i]][0].ProjectDescription,
              ProjectName: result[keys[i]][0].ProjectName,
              ReactedOn: result[keys[i]][0].ReactedOn,
              Status: result[keys[i]][0].Status,
              ProjectId: result[keys[i]][0].ProjectId,
              Team: teams
            });
            i++;
          }
        }
        Toast("Record found");
        this.isPageReady = true;
      }
    }).catch(e => {
      this.isPageReady = true;
    })
  }

  getAppraisalFinalize() {
    this.isLoading = true;
    this.http.get(`promotion/getPromotionAndHike/${this.userDetail.UserId}`, SERVICE.PERFORMANCE).then((res: ResponseModel) => {
      if (res.ResponseBody) {
        this.allMemberAppraisalFinalizer = res.ResponseBody;
        this.appraisalReviewStatus = this.allAppraisalFinalizer[0].Status;
        console.log(this.allMemberAppraisalFinalizer)
        $("#viewMemberModal").modal('show');
        Toast("Finalizer record found");
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  approvedAppraisal() {
    this.isLoading = true;
    this.http.post("promotion/approveAppraisalReviewDetail", this.allMemberAppraisalFinalizer, SERVICE.PERFORMANCE).then((res: ResponseModel) => {
      if (res.ResponseBody) {
        $("#viewMemberModal").modal('hide');
        Toast("Finalizer record approved successfully");
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  rejectAppraisal() {
    this.isLoading = true;
    this.http.post("promotion/rejectAppraisalReviewDetail", this.allMemberAppraisalFinalizer, SERVICE.PERFORMANCE).then((res: ResponseModel) => {
      if (res.ResponseBody) {
        $("#viewMemberModal").modal('hide');
        Toast("Finalizer record rejected successfully");
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

  showOffCanvas(item: any) {
    this.selectedEmploye = item;
    if (item && this.selectedEmploye.EmployeeId > 0) {
      var offcanvasRight = document.getElementById('riviewObjectiveFinalizeOffCanvas');
      var bsOffcanvas = new bootstrap.Offcanvas(offcanvasRight);
      $("#viewMemberModal").modal('hide');
      this.loadReviewDetail()
      bsOffcanvas.show();
    }
  }

  loadReviewDetail() {
    this.isObjectivesReady = false;
    let designationId = 0;
    this.http.get(`performance/getEmployeeObjective/${designationId}/${this.selectedEmploye.CompanyId}/${this.selectedEmploye.EmployeeId}`, SERVICE.PERFORMANCE).then(res => {
      if (res.ResponseBody && res.ResponseBody.length > 0) {
        this.objectives = res.ResponseBody;
        this.getUserNameIcon(this.selectedEmploye.FirstName, this.selectedEmploye.LastName);
        Toast("Employee performance objective data loaded successsfully");
        this.isObjectivesReady = true;
      } else {
        WarningToast("No objective details found. Please contact to admin.");
        this.isObjectivesReady = true;
      }
    }).catch(err => {
      ErrorToast(err.error);
      this.isObjectivesReady = true;
    })
  }

  getUserNameIcon(first: string, last: string) {
    this.userNameIcon = first[0]+""+last[0];
  }

 }
