import { Component, OnInit } from '@angular/core';
import { GetRoles } from 'src/providers/ApplicationStorage';
import { AjaxService } from 'src/providers/ajax.service';
import { Toast } from 'src/providers/common-service/common.service';
import { UserService } from 'src/providers/userService';
declare var $: any;
declare var bootstrap: any;
import 'bootstrap';
import { ResponseModel } from 'src/auth/jwtService';

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

  constructor(private http: AjaxService,
              private user: UserService) {}

  ngOnInit(): void {
    this.userDetail = this.user.getInstance();
    this.designation = GetRoles();
    this.loadData();
  }

  loadData() {
    this.isPageReady = false;
    this.http.get("eps/promotion/getApprovePromotionAndHike", true).then((res: ResponseModel) => {
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
            this.allAppraisalFinalizer.push({
              MemberName: result[keys[0]].map(x => x.FullName),
              ManagerName: result[keys[0]][0].ManagerName,
              ProjectManagerId: result[keys[0]][0].ProjectManagerId,
              ProjectDescription: result[keys[0]][0].ProjectDescription,
              ProjectName: result[keys[0]][0].ProjectName,
              ReactedOn: result[keys[0]][0].ReactedOn,
              Status: result[keys[0]][0].Status,
              Team: result[keys[0]].map(x => x.Team),
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

  getAppraisalFinalize(mangerId) {
    this.isLoading = true;
    this.http.get(`eps/promotion/getPromotionAndHike/${mangerId}`, true).then((res: ResponseModel) => {
      if (res.ResponseBody) {
        this.allMemberAppraisalFinalizer = res.ResponseBody;
        if (this.allMemberAppraisalFinalizer.length > 0) {
          let status = this.allMemberAppraisalFinalizer.filter(x => x.Status == 9);
          $("#viewMemberModal").modal('show');
        }
        Toast("Finalizer record found");
        this.isLoading = false;
      }
    }).catch(e => {
      this.isLoading = false;
    })
  }

 }
