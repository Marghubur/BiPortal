import { Component, ElementRef, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ResponseModel } from 'src/auth/jwtService';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';
declare var $: any;

@Component({
  selector: 'app-org-structure',
  templateUrl: './org-structure.component.html',
  styleUrls: ['./org-structure.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OrgStructureComponent implements OnInit, OnDestroy {
  isLoaded: boolean = false;
  node: any = null;
  memberName: string = "";
  memberDesignation: number = 0;
  orgTree: Array<any> = [];
  company: any = null;

  constructor(
    private sanitizer: DomSanitizer,
    private elementRef: ElementRef,
    private http: AjaxService,
    private local: ApplicationStorage
  ) { }

  addedNewMember() {
    if(this.memberDesignation != -1) {
      this.isLoaded = false;
      this.orgTree.push({ 
        "Node": this.orgTree.length + 1, 
        "ParentNode": this.memberDesignation, 
        "Name": this.memberName.toLocaleUpperCase(), 
        "CompanyId": this.company.CompanyId, 
        "IsActive": 1 
      });
      this.getWorkFlowTree();
      this.isLoaded = true;
      this.memberName = "";
      this.memberDesignation = 0;
    } else {
      WarningToast("Please select the parent node.");
    }
  }

  bindEventToNodes() {
    this.elementRef.nativeElement
      .querySelector('div[id="tree-node"]')
      .querySelectorAll('a').forEach(item => {
        item.addEventListener("click", this.bindEvent.bind(this));
      });
  }

  bindEvent(e: any) {
    var tag = e.currentTarget.querySelector('.popover-container');
    tag.classList.toggle('show-popover');
  }

  ngOnInit(): void {
    this.company =  this.local.findRecord("Companies")[0];
    this.loadTree();
  }

  getInnerNode(nodes: Array<any>, rootTree: Array<any>) {
    var parentNode = "";
    var subRootNode = "";
    var i = 0;
    while (i < nodes.length) {
      subRootNode = "";
      var childs = rootTree.filter(x => x.ParentNode == nodes[i].Node);
      if (childs.length > 0) {
        subRootNode += this.getInnerNode(rootTree.filter(x => x.ParentNode == nodes[i].Node), rootTree);
      } else {
        parentNode += `<li>
                      <a href="javascript:void(0);" class="position-relative border">
                        <i class="fa-solid fa-plus position-absolute add-icon"></i>
                        <div class="member-view-box">                            
                            <div class="p-box">${nodes[i].Name}</div>                            
                        </div>
                      </a>
                    </li>`;
        i++;
        continue;
      }

      parentNode += `<li>
                    <a href="javascript:void(0);" class="position-relative border">
                      <i class="fa-solid fa-plus position-absolute add-icon"></i>
                      <div class="member-view-box">                            
                          <div class="p-box">${nodes[i].Name}</div>                            
                      </div>
                    </a>
                    <ul>
                      ${subRootNode}
                    </ul>
                  </li>`;

      i++;
    }

    return parentNode;
  }

  getWorkFlowTree() {   
    var rootIterator = this.orgTree.filter(x => x.ParentNode == 0);
    var i = 0;
    let rootTree = '';
    while (i < rootIterator.length) {
      rootTree = this.getInnerNode(rootIterator, this.orgTree);
      i++;
    }

    this.node = this.sanitizer.bypassSecurityTrustHtml(`<ul id="d-ul">${rootTree}</ul>`);

    setTimeout(() => {
      this.bindEventToNodes();
      // document.getElementById("d-ul").querySelectorAll('a').forEach(item => {
      //   item.addEventListener("click", () => {
      //     alert("working");
      //   });
      // });
    }, 1000);
  }

  saveTree() {
    this.http.post("ef/filter/addOrganizationHierarchy", this.orgTree, true)
    .then((respone: ResponseModel) => {
      if (respone) {
        Toast(respone.ResponseBody);
      } else {
        ErrorToast("Fail to add");
      }
    })
  }

  loadTree() {
    this.http.get(`ef/filter/getOrganizationHierarchy/${this.company.CompanyId}`, true)
    .then((respone: ResponseModel) => {
      if (respone) {
        this.orgTree = respone.ResponseBody;
        if (this.orgTree.length == 0) {
          this.orgTree = [{ 
            "Node": 1, 
            "ParentNode": 0, 
            "Name": "CEO", 
            "CompanyId": this.company.CompanyId, 
            "IsActive": 1 
          }];
        }
        this.getWorkFlowTree();
        Toast("Tree structure loaded successfully.");
        this.isLoaded = true;
      } else {
        ErrorToast("Fail to add");
      }
    })
  }

  ngOnDestroy(): void {
    document.getElementById("d-ul").querySelectorAll('a').forEach(item => {
      item.removeEventListener("click", () => { });
    });
  }
}
