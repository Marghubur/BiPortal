import { Component, OnInit } from '@angular/core';
import { ResponseModel } from 'src/auth/jwtService';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { SERVICE } from 'src/providers/constants';
declare var $: any;

@Component({
  selector: 'app-org-structure',
  templateUrl: './org-structure.component.html',
  styleUrls: ['./org-structure.component.scss']
})
export class OrgStructureComponent implements OnInit {
  isLoaded: boolean = false;
  orgTree: Array<any> = [];
  company: any = null;

  constructor(
    private http: AjaxService,
    private local: ApplicationStorage
  ) { }

  ngOnInit(): void {
    this.company = this.local.findRecord("Companies")[0];
    if (this.company) {
      this.loadTree();
    }
  }

  loadTree() {
    this.http.get(`orgtree/getOrganizationHierarchy/${this.company.CompanyId}`, SERVICE.FILTER)
      .then((respone: ResponseModel) => {
        if (respone) {
          this.orgTree = respone.ResponseBody;
          if (this.orgTree.length == 0) {
            this.orgTree = [{
              "RoleId": 1,
              "ParentNode": 0,
              "RoleName": "CEO",
              "CompanyId": this.company.CompanyId,
              "IsActive": 1
            }];
          }

          Toast("Tree structure loaded successfully.");
          this.isLoaded = true;
        } else {
          ErrorToast("Fail to add");
        }
      }).catch(e => {
        ErrorToast(e.error);
      });
  }

  saveTree(result: Array<any>) {
    if (result && result.length > 0) {
      this.http.post("orgtree/addOrganizationHierarchy", result, SERVICE.FILTER)
        .then((respone: ResponseModel) => {
          if (respone) {
            Toast(respone.ResponseBody);
          } else {
            ErrorToast("Fail to add");
          }
        }).catch(e => {
          ErrorToast(e.error)
        });
    } else {
      WarningToast("Your are trying to save empty tree!!!");
    }
  }
}
