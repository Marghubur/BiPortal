import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { Toast } from 'src/providers/common-service/common.service';
declare var $: any;

@Component({
  selector: 'app-wiki',
  templateUrl: './wiki.component.html',
  styleUrls: ['./wiki.component.scss']
})
export class WikiComponent implements OnInit, AfterViewChecked {
  isLoaded: boolean = true;
  projectDetail: ProjectWiki = new ProjectWiki();
  titleValue: string = '';
  imageUrl: string = '';
  anchorLink: string = '';
  tag: HTMLElement = null;
  editableFlag: boolean = false;
  wikiForm: FormGroup = null;

  constructor(private fb: FormBuilder,
              private sanitize: DomSanitizer,
              private http: AjaxService) { }

  ngAfterViewChecked(): void {
    $('[data-bs-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });

    $('[data-bs-toggle="tooltip"]').on('click', function () {
      $(this).tooltip('dispose');
    });

    this.tag = document.getElementById('content-container');
  }

  ngOnInit(): void {
    this.projectDetail.ProjectName= "HIRINGBELL ACCOUNTS";
    this.loadData();
    this.initForm();
  }

  loadData() {
    this.editableFlag = false;
    this.http.get("Project/GetAllProject").then(res => {
      if (res.ResponseBody && res.ResponseBody.length > 0) {
        if (res.ResponseBody[0].DocumentationDetail) {
          let value = JSON.parse(res.ResponseBody[0].DocumentationDetail);
          //value = this.sanitize.bypassSecurityTrustUrl(res.ResponseBody[0].DocumentationDetail);
          document.getElementById('main-container').innerHTML = value;
        }
        if (res.ResponseBody[0].PageIndexDetail) {
          let value = JSON.parse(res.ResponseBody[0].PageIndexDetail);
          //value = this.sanitize.bypassSecurityTrustUrl(res.ResponseBody[0].PageIndexDetail);
          document.getElementById('side-menu-item').innerHTML = value;
        }
        this.editableFlag = false;
        Toast("Record found");
      }
    })
  }

  initForm() {
    this.wikiForm = this.fb.group({
      Projects: this.fb.array([this.ProjectForm(this.titleValue)])
    })
  }

  ProjectForm(value : string) {
    return this.fb.group({
      WikiSection: new FormControl('')
    })
  }

  AdProject() {
    let project = this.wikiForm.get('Projects') as FormArray;
    project.push(this.ProjectForm(this.titleValue));
    $("#addTitleModal").modal('hide');
  }

  addTitlePopUp() {
    this.titleValue = '';
    $("#addTitleModal").modal('show');
  }

  addSectionPopUp() {
    $("#addSectionModal").modal('show');
  }

  addSection() {
    if(this.titleValue && this.titleValue != '') {
      this.projectDetail.Section = this.titleValue;
      this.titleValue = '';
      $("#addSectionModal").modal('hide');
    }
  }

  editCurrentSection() {
    this.editableFlag = !this.editableFlag;
  }

  trackElement(e: any) {
    alert(e);
  }

  addTitle() {
    if(this.titleValue && this.titleValue != '') {
      this.projectDetail.Section = this.titleValue;
      this.titleValue = '';
      $("#addTitleModal").modal('hide');
    }
  }

  addSubSection(e: any) {
    this.projectDetail.SubSection = '';
    let value = e.target.innerText;
    if(value && value != '') {
      this.projectDetail.SubSection = value ;
    }
  }

  addTextPopUp() {
    this.titleValue = '';
    $("#addTextModal").modal('show');
  }

  addText() {
    if(this.titleValue && this.titleValue != '') {
      let tag = document.createElement("p");
      tag.className="mb-0";
      let text = document.createTextNode(this.titleValue);
      tag.appendChild(text);
      this.tag.appendChild(tag);
      this.titleValue = '';
      $("#addTextModal").modal('hide');
    }
  }

  enableListItem() {
    let dv = document.createElement('div');
    let ol = document.createElement('ol');
    ol.setAttribute('type', '1');
    let li = document.createElement("li");
    ol.appendChild(li);
    dv.appendChild(ol);
    this.tag.appendChild(dv);
  }

  addLinkPopUp() {
    this.titleValue = '';
    this.anchorLink = null;
    $("#addLinkModal").modal('show');
  }

  addLink() {
    if(this.titleValue && this.titleValue != '') {
      let img = document.createElement('img');
      let tag = document.createElement("a");
      if (this.anchorLink && this.anchorLink != '') {
        tag.setAttribute('href', this.anchorLink);
        tag.setAttribute('target', '_blank')
      }
      else
        tag.setAttribute('href', 'javascript:void(0)');

      let text = document.createTextNode(this.titleValue);
      tag.appendChild(text);
      this.tag.appendChild(tag);
      this.titleValue = '';
      $("#addLinkModal").modal('hide');
    }
  }

  addListPopUp() {
    this.titleValue = '';
    this.anchorLink = null;
    $("#addListModal").modal('show');
  }

  addList() {
    if(this.titleValue && this.titleValue != '') {
      let tag = document.createElement("ul");
      tag.className="mb-0";
      let subTag = document.createElement('li');
      if (this.anchorLink && this.anchorLink != '') {
        let anchor = document.createElement("a");
        anchor.setAttribute('href', this.anchorLink);
        anchor.setAttribute('target', '_blank')
        let text = document.createTextNode(this.titleValue);
        anchor.appendChild(text);
        subTag.appendChild(anchor);
      } else {
        let text = document.createTextNode(this.titleValue);
        subTag.appendChild(text);
      }
      tag.appendChild(subTag);
      let elem = document.querySelector('[data-name="editable-div"]');
      elem.appendChild(tag);
      this.titleValue = '';
      $("#addListModal").modal('hide');
    }
  }

  fireBrowser() {
    $('#insert-image').click();
  }

  uploadImage(event: any) {
    this.imageUrl = '';
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event: any) => {
        this.imageUrl = event.target.result;
      };
    }
  }

  addImage() {
    let tag = document.createElement('div');
    let img = document.createElement('img');
    img.setAttribute('src', this.imageUrl);
    img.setAttribute('style', 'width:44vw;')
    tag.appendChild(img);
    this.tag.appendChild(tag);
    $('#addLinkModal').modal('hide');
  }

  saveProjectDetails() {
    this.editableFlag = false;
    let value = document.getElementById('main-container').innerHTML;
    let sidemenu = document.getElementById('side-menu-item').innerHTML;
    let project = {
      DocumentationDetail: value,
      PageIndexDetail: sidemenu,
      ProjectName: "HiringBell"
    }
    this.http.post("Project/AddProject", project).then((res: ResponseModel) => {
      if (res.ResponseBody)
        Toast(res.ResponseBody);
    }).catch(e => {
      Error(e);
    })
  }

}

class ProjectWiki {
  Section: string = '';
  SubSection: String = '';
  ProjectName: string = '';
}
