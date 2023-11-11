import { Component, ElementRef, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ResponseModel } from 'src/auth/jwtService';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';
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
  selectHierarchyNode: any = null;
  selectedChildNodes: Array<any> = [];
  isDeleteAllNodes: boolean = true;
  remainingDesignation: Array<any> = [];

  constructor(
    private sanitizer: DomSanitizer,
    private elementRef: ElementRef,
    private http: AjaxService,
    private local: ApplicationStorage
  ) { }

  getNextNodeIndex() {
    var index = 0;
    if (this.orgTree.length > 0) {
      var list = this.orgTree.sort((a,b) => a.RoleId > b.RoleId ? 1 : -1)
      index = list[list.length - 1].RoleName;
    }

    return index + 1
  }

  addedNewMember() {
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
    if (this.memberDesignation != -1) {
      this.isLoaded = false;
      this.orgTree.push({
        "RoleId": this.getNextNodeIndex(),
        "ParentNode": this.memberDesignation,
        "RoleName": this.memberName.toLocaleUpperCase(),
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
    let value = this.elementRef.nativeElement.querySelector('div[id="tree-node"]');
    value.querySelectorAll('div[data-name="edit-tree"]').forEach(item => {
      item.addEventListener("dblclick", this.bindEvent.bind(this));
    });

    value.querySelectorAll('i[data-name="add-tree"]').forEach(item => {
      item.addEventListener("click", this.bindAddEvent.bind(this));
    });

    value.querySelectorAll('button').forEach(item => {
      item.addEventListener("click", this.bindNewName.bind(this));
    });

    value.querySelectorAll('i[data-name="delete-tree"]').forEach(item => {
      item.addEventListener("click", this.bindDeleteEvent.bind(this));
    });

    // value.querySelectorAll('i[data-name="cancel-tree"]').forEach(item => {
    //   item.addEventListener("click", this.bindCanvelEvent.bind(this));
    // });

    value.querySelectorAll('.form-group').forEach(item => {
      item.addEventListener("blur", this.bindCanvelEvent.bind(this));
    });

    value.querySelectorAll('.form-group').forEach(item => {
      item.addEventListener("keypress", this.onEnterBineNewName.bind(this));
    });
  }

  onEnterBineNewName(e: any) {
    if (e.key === "Enter") {
      e.preventDefault();
      var name = e.currentTarget.closest('div').querySelector('input').value;
      let pIndex = Number(e.currentTarget.getElementsByTagName("button")[0].getAttribute("title"));
      let index = Number(e.currentTarget.getElementsByTagName("button")[0].getAttribute("index"));
      let item = this.orgTree.find(x => x.RoleId == index);
      this.isLoaded = false;
      if (item.RoleName == "") {
        this.memberDesignation = pIndex;
        this.orgTree = this.orgTree.filter(x => x.RoleId != index);
        if (this.orgTree.length > 0) {
          this.memberName = name;
          this.addedNewMember();
          this.isLoaded = true;
        }
      } else {
        item.RoleName = name.toLocaleUpperCase();
        this.getWorkFlowTree();
        this.isLoaded = true;
        this.memberName = "";
        this.memberDesignation = 0;
      }
    }
  }

  bindNewName(e: any) {
    var name = e.currentTarget.closest('div').querySelector('input').value;
    let pIndex = Number(e.currentTarget.getAttribute("title"));
    let index = Number(e.currentTarget.getAttribute("index"));
    let item = this.orgTree.find(x => x.RoleId == index);
    this.isLoaded = false;
    if (item.RoleName == "") {
      this.memberDesignation = pIndex;
      this.orgTree = this.orgTree.filter(x => x.RoleId != index);
      if (this.orgTree.length > 0) {
        this.memberName = name;
        this.addedNewMember();
        this.isLoaded = true;
      }
    } else {
      item.RoleName = name.toLocaleUpperCase();
      this.getWorkFlowTree();
      this.isLoaded = true;
      this.memberName = "";
      this.memberDesignation = 0;
    }
  }

  bindCanvelEvent(e: any) {
    this.isLoaded = false;
    this.getWorkFlowTree();
    this.isLoaded = true;
  }

  bindEvent(e: any) {
    let index = Number(e.currentTarget.getAttribute("data-index"));
    let value = this.orgTree.find(x => x.RoleId == index);
    if (value) {
      e.currentTarget.querySelector(".p-box").classList.add("d-none");
      e.currentTarget.querySelector(".form-group").classList.remove("d-none");
      e.currentTarget.querySelector(".form-control").value = value.RoleName;
      e.currentTarget.querySelector(".form-control").focus();
      let elem = document.querySelectorAll(`i[data-index='${index}']`);
      if (elem && elem.length > 0) {
        elem.forEach(x => {
          if(!x.classList.contains("fa-xmark"))
            x.classList.add("d-none");
        });
      }
    //   this.memberName = value.Name;
    //   this.memberDesignation = value.ParentNode;

    }
  }

  bindAddEvent(e: any) {
    let index = Number(e.currentTarget.getAttribute("data-index"));
    if (index != -1) {
      this.memberDesignation = index;
      this.addedNewMember();
    }
  }

  bindDeleteEvent(e: any) {
    let value = Number(e.currentTarget.getAttribute("data-index"));
    let data = this.orgTree.find(x => x.RoleId == value);
    this.selectHierarchyNode = null;
    this.isDeleteAllNodes = true;
    if (data && data.RoleName != "") {
      this.selectHierarchyNode = data;
      this.selectedChildNodes = this.orgTree.filter(x => x.ParentNode == this.selectHierarchyNode.RoleId);
      this.remainingDesignation = this.orgTree.filter(x => x.RoleId != value);
      $("#delteHierarchyModal").modal('show');
    } else {
      this.orgTree = this.orgTree.filter(x => x.RoleId != value);
    }
    this.getWorkFlowTree();
  }

  delteHerarchyNode() {
    if (this.selectedChildNodes.length > 0) {
      if (this.isDeleteAllNodes) {
        this.deleteInnerNode(this.selectHierarchyNode.RoleId);
      } else {
        if (this.memberDesignation > 0)
          this.orgTree.filter(x => x.ParentNode == this.selectHierarchyNode.RoleId).map(x => x.ParentNode = this.memberDesignation);
        else {
          ErrorToast("Please select parent node");
          return;
        }
      }
    }

    this.orgTree = this.orgTree.filter(x => x.RoleId != this.selectHierarchyNode.RoleId);
    $("#delteHierarchyModal").modal('hide');
    this.getWorkFlowTree();
  }

  deleteInnerNode(node: number) {
    if (node > 0) {
      let child = this.orgTree.filter(x => x.ParentNode == node);
      if (child && child.length > 0) {
        child.forEach(x => {
          this.deleteInnerNode(x.RoleId);
        })
      } else {
        this.orgTree = this.orgTree.filter(x => x.RoleId != node);
      }
    }
  }

  ngOnInit(): void {
    this.company = this.local.findRecord("Companies")[0];
    this.loadTree();
  }

  getUserNameOrAddNew(name: string, pIndex: number, index: number) {
    var html = '';
    if (name == null || name == "") {
      html = `<div class="form-group text-start mt-3 d-flex simple-br-r border">
                  <input type="text" class="form-control form-control-mini border-0" name="memberName" autofocus>
                  <button name="btn-add" title="${pIndex}" index="${index}" class="px-2 border-0 btn-add">
                    <i class="fa-solid fa-plus"></i>
                  </button>
              </div>`;
    } else {
      html = `<div class="p-box text-truncate">${name}</div>
              <div class="form-group text-start mt-3 d-flex simple-br-r border d-none">
                <input type="text" class="form-control form-control-mini border-0" name="memberName" value=${name} autofocus>
                <button name="btn-add" title="${pIndex}" index="${index}" class="px-2 border-0 btn-add">
                  <i class="fa-solid fa-plus"></i>
                </button>
              </div>`;
    }

    return html;
  }

  getInnerNode(nodes: Array<any>, rootTree: Array<any>) {
    var parentNode = "";
    var subRootNode = "";
    var i = 0;
    while (i < nodes.length) {
      subRootNode = "";
      var childs = rootTree.filter(x => x.ParentNode == nodes[i].RoleId);
      if (childs.length > 0) {
        subRootNode += this.getInnerNode(rootTree.filter(x => x.ParentNode == nodes[i].RoleId), rootTree);
      } else {
        let addIcon = `<i class="fa-solid fa-plus position-absolute add-icon" data-name="add-tree" data-bs-toggle="tooltip" data-bs-title="Add" data-index=${nodes[i].RoleId}></i>`;
        if (nodes[i].ParentNode ==1) {
          parentNode += `<li>
                        <a href="javascript:void(0);" class="position-relative border">
                          {{addIcon}}
                          <div class="member-view-box mb-1">
                            <div class="member-image">
                              <img src="assets/images/faces/face.jpg" alt="Member">
                            </div>
                            <div data-name="edit-tree" data-index=${nodes[i].RoleId}>
                              ${this.getUserNameOrAddNew(nodes[i].RoleName, nodes[i].ParentNode, nodes[i].RoleId)}
                            </div>
                          </div>
                          <i class="fa-solid fa-trash-can position-absolute delete-icon" data-bs-toggle="tooltip" data-bs-title="Delete" data-name="delete-tree" data-index=${nodes[i].RoleId}></i>
                        </a>
                      </li>`;
        } else {
          parentNode += `<li>
                        <a href="javascript:void(0);" class="position-relative border">
                          {{addIcon}}
                          <div class="member-view-box mb-1" data-name="edit-tree" data-index=${nodes[i].RoleId}>
                            ${this.getUserNameOrAddNew(nodes[i].RoleName, nodes[i].ParentNode, nodes[i].RoleId)}
                          </div>
                          <i class="fa-solid fa-trash-can position-absolute delete-icon" data-bs-toggle="tooltip" data-bs-title="Delete" data-name="delete-tree" data-index=${nodes[i].RoleId}></i>
                        </a>
                      </li>`;
        }
        if (nodes[i].RoleName)
        parentNode = parentNode.replace("{{addIcon}}", addIcon);
        else
        parentNode = parentNode.replace("{{addIcon}}", "");

        i++;
        continue;
      }

      if (nodes[i].ParentNode == 0 || nodes[i].ParentNode == 1) {
        parentNode += `<li>
                      <a href="javascript:void(0);" class="position-relative border">
                        <i class="fa-solid fa-plus position-absolute add-icon" data-bs-toggle="tooltip" data-bs-title="Add" data-name="add-tree" data-index=${nodes[i].RoleId}></i>
                        <div class="member-view-box mb-1">
                          <div class="member-image">
                            <i class="fa-solid fa-pencil position-absolute edit-icon"></i>
                            <img src="assets/images/faces/face.jpg" alt="Member">
                          </div>
                          <div data-name="edit-tree" data-index=${nodes[i].RoleId}>
                            <div class="p-box text-truncate">${nodes[i].RoleName}</div>
                            <div class="form-group text-start mt-3 d-flex simple-br-r border d-none">
                              <input type="text" class="form-control form-control-mini border-0" name="memberName" value=${nodes[i].RoleName} autofocus>
                              <button name="btn-add" title="${nodes[i].ParentNode}" index="${nodes[i].RoleId}" class="px-2 border-0 btn-add">
                                <i class="fa-solid fa-plus"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                        <i class="fa-solid fa-trash-can position-absolute delete-icon" data-name="delete-tree" data-bs-toggle="tooltip" data-bs-title="Delete" data-index=${nodes[i].RoleId}></i>
                      </a>
                      <ul>
                        ${subRootNode}
                      </ul>
                    </li>`;
      } else {
        parentNode += `<li>
                      <a href="javascript:void(0);" class="position-relative border">
                        <i class="fa-solid fa-plus position-absolute add-icon" data-bs-toggle="tooltip" data-bs-title="Add" data-name="add-tree" data-index=${nodes[i].RoleId}></i>
                        <div class="member-view-box mb-1" data-name="edit-tree" data-index=${nodes[i].RoleId}>
                          <div class="p-box text-truncate" >${nodes[i].RoleName}</div>
                          <div class="form-group text-start mt-3 d-flex simple-br-r border d-none">
                            <input type="text" class="form-control form-control-mini border-0" name="memberName" value=${nodes[i].RoleName} autofocus>
                            <button name="btn-add" title="${nodes[i].ParentNode}" index="${nodes[i].RoleId}" class="px-2 border-0 btn-add">
                              <i class="fa-solid fa-plus"></i>
                            </button>
                          </div>
                        </div>
                        <i class="fa-solid fa-trash-can position-absolute delete-icon" data-name="delete-tree" data-bs-toggle="tooltip" data-bs-title="Delete" data-index=${nodes[i].RoleId}></i>
                      </a>
                      <ul>
                        ${subRootNode}
                      </ul>
                    </li>`;
      }

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
      }).catch(e => {
        ErrorToast(e.error)
      })
  }

  loadTree() {
    this.http.get(`ef/filter/getOrganizationHierarchy/${this.company.CompanyId}`, true)
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
          this.getWorkFlowTree();
          Toast("Tree structure loaded successfully.");
          this.isLoaded = true;
        } else {
          ErrorToast("Fail to add");
        }
      }).catch(e => {
        ErrorToast(e.error);
      })
  }

  resetTree() {
    this.memberName = "";
    this.memberDesignation = 0;
  }

  ngOnDestroy(): void {
    let value = this.elementRef.nativeElement.querySelector('div[id="tree-node"]');
    value.querySelectorAll('div[data-name="edit-tree"]').forEach(item => {
      item.removeEventListener("dblclick", this.bindEvent.bind(this));
    });

    value.querySelectorAll('i[data-name="add-tree"]').forEach(item => {
      item.removeEventListener("click", this.bindAddEvent.bind(this));
    });

    value.querySelectorAll('button').forEach(item => {
      item.removeEventListener("click", this.bindNewName.bind(this));
    });

    value.querySelectorAll('i[data-name="delete-tree"]').forEach(item => {
      item.removeEventListener("click", this.bindDeleteEvent.bind(this));
    });

    value.querySelectorAll('.form-group').forEach(item => {
      item.removeEventListener("blur", this.bindCanvelEvent.bind(this));
    });

    value.querySelectorAll('.form-group').forEach(item => {
      item.removeEventListener("keypress", this.onEnterBineNewName.bind(this));
    });
  }

}
