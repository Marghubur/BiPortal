import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { ErrorToast, Toast, WarningToast } from 'src/providers/common-service/common.service';

declare var bootstrap: any;

@Component({
  selector: 'app-bot-tree-view',
  templateUrl: './bot-tree-view.component.html',
  styleUrls: ['./bot-tree-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BotTreeViewComponent implements OnInit, OnDestroy {
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

  @Output() onSave = new EventEmitter();
  @Output() onRemove = new EventEmitter();
  @Input() isViewMode: boolean = true;
  @Input()
  set inputTree(data: any) {
    if (data) {
      this.orgTree = data;
      this.getWorkFlowTree();
      this.isLoaded = true;
    } else {
      WarningToast("No tree structure found");
    }
  }

  constructor(
    private sanitizer: DomSanitizer,
    private elementRef: ElementRef,
    private local: ApplicationStorage
  ) { }

  ngOnInit(): void {
    this.company = this.local.findRecord("Companies")[0];
    console.log(this.isViewMode)
  }

  getNextNodeIndex() {
    var index = 0;
    if (this.orgTree.length > 0) {
      var list = this.orgTree.sort((a, b) => a.RoleId > b.RoleId ? 1 : -1)
      index = list[list.length - 1].RoleId;
    }

    return index + 1
  }

  addedNewMember(isDarpartment: boolean) {
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
        "IsActive": 1,
        "IsDarpartment": isDarpartment
      });
      this.getWorkFlowTree();
      this.isLoaded = true;
      this.memberName = "";
      this.memberDesignation = 0;
    } else {
      WarningToast("Please select the parent node.");
    }
  }

  enableInTree(e: any) {
    this.onRemove.emit(e);
  }

  bindEventToNodes() {
    let value = this.elementRef.nativeElement.querySelector('div[id="tree-node"]');
    if (this.isViewMode) {
      value.querySelectorAll('.member-view-box').forEach(item => {
        item.addEventListener("click", this.enableInTree.bind(this));
      });
    } else {
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

      value.querySelectorAll('.member-view-box').forEach(item => {
        item.addEventListener("blur", this.bindCanvelEvent.bind(this));
      });

      value.querySelectorAll('i[data-name="cancel-tree"]').forEach(item => {
        item.addEventListener("click", this.bindCanvelEvent.bind(this));
      });

      value.querySelectorAll('.form-group').forEach(item => {
        item.addEventListener("keypress", this.onEnterBindNewName.bind(this));
      });
    }
  }

  onEnterBindNewName(e: any) {
    if (e.key === "Enter") {
      e.preventDefault();
      var name = e.currentTarget.closest('div').querySelector('input').value;
      let pIndex = Number(e.currentTarget.getElementsByTagName("button")[0].getAttribute("title"));
      let index = Number(e.currentTarget.getElementsByTagName("button")[0].getAttribute("index"));
      let item = this.orgTree.find(x => x.RoleId == index);
      let isDepartment = e.currentTarget.closest('div').previousElementSibling.querySelector('input').checked;
      this.isLoaded = false;
      if (item.RoleName == "") {
        this.memberDesignation = pIndex;
        this.orgTree = this.orgTree.filter(x => x.RoleId != index);
        if (this.orgTree.length > 0) {
          this.memberName = name;
          this.addedNewMember(isDepartment);
          this.isLoaded = true;
        }
      } else {
        item.RoleName = name.toLocaleUpperCase();
        item.IsDepartment = isDepartment;
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
    let isDepartment = e.currentTarget.closest('div').previousElementSibling.querySelector('input').checked;
    this.isLoaded = false;
    if (item.RoleName == "") {
      this.memberDesignation = pIndex;
      this.orgTree = this.orgTree.filter(x => x.RoleId != index);
      if (this.orgTree.length > 0) {
        this.memberName = name;
        this.addedNewMember(isDepartment);
        this.isLoaded = true;
      }
    } else {
      item.RoleName = name.toLocaleUpperCase();
      item.IsDepartment = isDepartment;
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
      e.currentTarget.querySelector(".form-check").classList.remove("d-none");
      e.currentTarget.previousElementSibling.classList.add("d-none");
      if (value.IsDepartment)
        e.currentTarget.querySelector(".form-check-input").checked = true;
      else
        e.currentTarget.querySelector(".form-check-input").checked = false;
      let elem = document.querySelectorAll(`i[data-index='${index}']`);
      if (elem && elem.length > 0) {
        elem.forEach(x => {
          if (!x.classList.contains("fa-xmark"))
            x.classList.add("d-none");
        });
      }
    }
  }

  bindAddEvent(e: any) {
    let index = Number(e.currentTarget.getAttribute("data-index"));
    if (index != -1) {
      this.memberDesignation = index;
      this.addedNewMember(false);
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
      this.toggleModal(true);
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
    this.toggleModal(true);
    this.getWorkFlowTree();
  }

  toggleModal(openFlag: boolean) {
    var myModal = new bootstrap.Modal(document.getElementById('delteHierarchyModal'));
    if (openFlag) {
      myModal.show();
    } else {
      myModal.hide();
    }
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


  getUserNameOrAddNew(name: string, pIndex: number, index: number) {
    var html = '';
    if (name == null || name == "") {
      html = `<div class="form-check w-100 d-flex">
                <input class="form-check-input" type="checkbox" name="department">
                <label class="form-check-label ps-2" >
                  Is Department
                </label>
              </div>
              <div class="form-group text-start d-flex simple-br-r border">
                <input type="text" class="form-control form-control-mini border-0" name="memberName" autofocus>
                <button name="btn-add" title="${pIndex}" index="${index}" class="px-2 border-0 btn-add">
                  <i class="fa-solid fa-plus"></i>
                </button>
              </div>`;
    } else {
      html = `<div class="p-box text-truncate">${name}</div>
              <div class="form-check w-100 d-flex d-none">
                <input class="form-check-input" type="checkbox" name="department">
                <label class="form-check-label ps-2" >
                  Is Department
                </label>
              </div>
              <div class="form-group text-start d-flex simple-br-r border d-none">
                <input type="text" class="form-control form-control-mini border-0" name="memberName" value=${name} autofocus>
                <button name="btn-add" title="${pIndex}" index="${index}" class="px-2 border-0 btn-add">
                  <i class="fa-solid fa-plus"></i>
                </button>
                <i class="fa-solid fa-xmark position-absolute cancel-icon" data-name="cancel-tree" data-bs-toggle="tooltip" data-bs-title="Cancel" data-index=${index}></i>
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
      let department = `<div class="text-end pe-1 pt-1">
                          <span class="badge rounded-pill text-bg-success">Department</span>
                        </div>`
      var childs = rootTree.filter(x => x.ParentNode == nodes[i].RoleId);
      if (childs.length > 0) {
        subRootNode += this.getInnerNode(rootTree.filter(x => x.ParentNode == nodes[i].RoleId), rootTree);
      } else {
        let addIcon = `<i class="fa-solid fa-plus position-absolute add-icon" data-name="add-tree" data-bs-toggle="tooltip" data-bs-title="Add" data-index=${nodes[i].RoleId}></i>`;
        let deactiveClass="";
        if (!nodes[i].IsActive) {
          deactiveClass = "hide-node";
        }
        if (nodes[i].ParentNode == 1) {
          parentNode += `<li>
                        <a href="javascript:void(0);" class="position-relative border no-department">
                          {{addIcon}}
                          {{Department}}
                          <div class="member-view-box  ${deactiveClass}">
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
                        <a href="javascript:void(0);" class="position-relative border no-department">
                          ${
                            this.isViewMode ? '' :
                            '{{addIcon}}'
                          }
                          {{Department}}
                          <div class="member-view-box  ${deactiveClass}" data-name="edit-tree" data-index=${nodes[i].RoleId}>
                            ${this.getUserNameOrAddNew(nodes[i].RoleName, nodes[i].ParentNode, nodes[i].RoleId)}
                          </div>
                          ${
                            this.isViewMode ? '' :
                            `<i class="fa-solid fa-trash-can position-absolute delete-icon" data-bs-toggle="tooltip" data-bs-title="Delete" data-name="delete-tree" data-index=${nodes[i].RoleId}></i>`
                          }
                        </a>
                      </li>`;
        }
        if (nodes[i].RoleName)
          parentNode = parentNode.replace("{{addIcon}}", addIcon);
        else
          parentNode = parentNode.replace("{{addIcon}}", "");

        if (nodes[i].IsDepartment) {
          parentNode = parentNode.replace("{{Department}}", department);
          parentNode = parentNode.replace("no-department", "department-box");
        }
        else {
          parentNode = parentNode.replace("{{Department}}", "");
          parentNode = parentNode.replace("no-department", "");
        }

        i++;
        continue;
      }
      let deactiveClass = "";
      if (!nodes[i].IsActive) {
        deactiveClass = "hide-node";
      }
      if (nodes[i].ParentNode == 0 || nodes[i].ParentNode == 1) {
        parentNode += `<li>
                      <a href="javascript:void(0);" class="position-relative border no-department">
                        <i class="fa-solid fa-plus position-absolute add-icon" data-bs-toggle="tooltip" data-bs-title="Add" data-name="add-tree" data-index=${nodes[i].RoleId}></i>
                        {{Department}}
                        <div class="member-view-box  ${deactiveClass}">
                          <div class="member-image">
                            <i class="fa-solid fa-pencil position-absolute edit-icon"></i>
                            <img src="assets/images/faces/face.jpg" alt="Member">
                          </div>
                          <div data-name="edit-tree" data-index=${nodes[i].RoleId}>
                            <div class="p-box text-truncate">${nodes[i].RoleName}</div>
                            <div class="form-check w-100 d-flex d-none">
                              <input class="form-check-input" type="checkbox" name="department">
                              <label class="form-check-label ps-2" >
                                Is Department
                              </label>
                            </div>
                            <div class="form-group text-start d-flex simple-br-r border d-none">
                              <input type="text" class="form-control form-control-mini border-0" name="memberName" value=${nodes[i].RoleName} autofocus>
                              <button name="btn-add" title="${nodes[i].ParentNode}" index="${nodes[i].RoleId}" class="px-2 border-0 btn-add">
                                <i class="fa-solid fa-plus"></i>
                              </button>
                              <i class="fa-solid fa-xmark position-absolute cancel-icon" data-name="cancel-tree" data-bs-toggle="tooltip" data-bs-title="Cancel" data-index=${nodes[i].RoleId}></i>
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
                      <a href="javascript:void(0);" class="position-relative border no-department">
                        ${this.isViewMode ?
                          '' :
                          `<i class="fa-solid fa-plus position-absolute add-icon" data-bs-toggle="tooltip" data-bs-title="Add" data-name="add-tree" data-index=${nodes[i].RoleId}></i>`
                        }

                        {{Department}}
                        <div class="member-view-box  ${deactiveClass}" data-name="edit-tree" data-index=${nodes[i].RoleId}>
                          <div class="p-box text-truncate" >${nodes[i].RoleName}</div>
                          <div class="form-check w-100 d-flex d-none">
                              <input class="form-check-input" type="checkbox" name="department">
                              <label class="form-check-label ps-2" >
                                Is Department
                              </label>
                            </div>
                          <div class="form-group text-start d-flex simple-br-r border d-none">
                            <input type="text" class="form-control form-control-mini border-0" name="memberName" value=${nodes[i].RoleName} autofocus>
                            <button name="btn-add" title="${nodes[i].ParentNode}" index="${nodes[i].RoleId}" class="px-2 border-0 btn-add">
                              <i class="fa-solid fa-plus"></i>
                            </button>
                            <i class="fa-solid fa-xmark position-absolute cancel-icon" data-name="cancel-tree" data-bs-toggle="tooltip" data-bs-title="Cancel" data-index=${nodes[i].RoleId}></i>
                          </div>
                        </div>

                        ${this.isViewMode ?
                          '' :
                          `<i class="fa-solid fa-trash-can position-absolute delete-icon" data-name="delete-tree" data-bs-toggle="tooltip" data-bs-title="Delete" data-index=${nodes[i].RoleId}></i>`
                        }
                      </a>
                      <ul>
                        ${subRootNode}
                      </ul>
                    </li>`;
      }
      if (nodes[i].IsDepartment) {
        parentNode = parentNode.replace("{{Department}}", department);
        parentNode = parentNode.replace("no-department", "department-box");
      }
      else {
        parentNode = parentNode.replace("{{Department}}", "");
        parentNode = parentNode.replace("no-department", "");
      }

      i++;
    }

    return parentNode;
  }

  getWorkFlowTree() {
    var i = 0;
    let rootTree = '';
    if(this.orgTree.length > 0) {
      rootTree = this.getInnerNode([this.orgTree[0]], this.orgTree);
    }


    this.node = this.sanitizer.bypassSecurityTrustHtml(`<ul id="d-ul">${rootTree}</ul>`);

    setTimeout(() => {
      this.bindEventToNodes();
    }, 1000);
  }

  saveTree() {
    this.onSave.emit(this.orgTree);
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
      item.removeEventListener("keypress", this.onEnterBindNewName.bind(this));
    });

    value.querySelectorAll('i[data-name="cancel-tree"]').forEach(item => {
      item.addEventListener("click", this.bindCanvelEvent.bind(this));
    });
  }
}
