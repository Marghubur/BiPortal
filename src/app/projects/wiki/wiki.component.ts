import { AfterViewChecked, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
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
  popover: HTMLElement = null;
  isLoaded: boolean = true;
  projectDetail: ProjectWiki = new ProjectWiki();
  titleValue: string = '';
  imageUrl: string = '';
  anchorLink: string = '';
  tag: HTMLElement = null;
  editableFlag: boolean = false;
  wikiForm: FormGroup = null;
  WikiDetails: Array<WikiDetail> = [];
  projectId: number = 0;
  target: HTMLElement = null;
  isSectionEdited: boolean = false;
  sectionIndex: number = -1;

  constructor(private fb: FormBuilder,
              private sanitize: DomSanitizer,
              private http: AjaxService,
              private renderer: Renderer2
              ) { }

  ngAfterViewChecked(): void {
    $('[data-bs-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });

    $('[data-bs-toggle="tooltip"]').on('click', function () {
      $(this).tooltip('dispose');
    });

    //this.tag = document.getElementById('content-container');
    this.popover = (<HTMLElement> document.getElementById('popoverTemplate'));
  }

  manipulateSection(e: any){
    e.preventDefault();
    this.popover.classList.remove('d-none');
    this.popover.setAttribute('style', `left: ${e.pageX}px; top: ${e.pageY}px`);
  }

  closePopOver(){
    this.popover.classList.add('d-none');
  }

  ngOnInit(): void {
    this.WikiDetails = []
    this.projectDetail.Title = 'HiringBel';
    this.projectDetail.ProjectName= "HiringBel Documentation";
    this.loadData();
  }

  loadData() {
    this.isLoaded = false;
    this.editableFlag = false;
    this.http.get("Project/GetAllProject").then(res => {
      if (res.ResponseBody && res.ResponseBody.length > 0) {
        this.projectId = res.ResponseBody[0].ProjectId;
        if (res.ResponseBody[0].DocumentationDetail) {
          this.projectDetail = JSON.parse(res.ResponseBody[0].DocumentationDetail);
        }

        this.editableFlag = false;
        Toast("Wiki page loaded successfully.");
      }

      this.initForm();
      this.isLoaded = true;
    })
  }

  initForm() {
    this.wikiForm = this.fb.group({
      Wikis: this.buildWiki()
    });
  }

  ProjectForm(value : WikiDetail) {
    return this.fb.group({
      WikiSection: new FormControl(value.SectionName),
      WikiSectionDetail: new FormControl(value.SectionDescription)
    })
  }

  adddProject() {
    let project = this.wikiForm.get('Wikis') as FormArray;
    let index = project.value.findIndex(x => x.WikiSection == '');
    if (index == 0)
      project.removeAt(index);
    project.push(this.createWiki());
  }

  buildWiki(): FormArray {
    let data = this.projectDetail.ProjectContent;
    let dataArray: FormArray = this.fb.array([]);
    if(data != null && data.length > 0) {
      let i = 0;
      while(i < data.length) {
        dataArray.push(this.fb.group({
          WikiSection: new FormControl(data[i].SectionName),
          WikiSectionDetail: new FormControl(this.sanitize.bypassSecurityTrustHtml(data[i].SectionDescription  as string))
        }));
        i++;
      }
    }

    return dataArray;
  }

  createWiki(): FormGroup {
    return this.fb.group({
      WikiSection: new FormControl(this.titleValue),
      WikiSectionDetail: new FormControl('')
    });
  }

  addTitlePopUp() {
    this.titleValue = '';
    $("#addTitleModal").modal('show');
  }


  addSubTitlePopUp() {
    this.titleValue = '';
    $("#addSubTitleModal").modal('show');
  }

  addSubTitle() {
    if(this.titleValue && this.titleValue != '') {
      this.projectDetail.ProjectContent.push( {
        SectionName: this.titleValue,
        SectionDescription: ''
      });
      
      let len = this.wikiForm.controls.Wikis.value.length;
      this.sectionIndex = len;
      this.adddProject();
      this.titleValue = '';
      $("#addSubTitleModal").modal('hide');
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
      this.projectDetail.Title = this.titleValue;
      this.titleValue = '';
      $("#addTitleModal").modal('hide');
    }
  }

  addParagraph() {
    let divtag = document.createElement("div");
    divtag.setAttribute('style', 'margin-top: 3rem;');
    let tag = document.createElement("p");
    tag.className="mb-0";
    tag.appendChild(document.createTextNode('YOUR TEXT'));
    divtag.appendChild(tag);
    this.target.appendChild(divtag);
    this.target.focus();
    let selection = window.getSelection();
    let range = document.createRange();
    range.selectNodeContents(tag);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  enableListItem() {
    let dv = document.createElement('div');
    let ol = document.createElement('ol');
    ol.setAttribute('type', '1');
    let li = document.createElement("li");
    ol.appendChild(li);
    dv.appendChild(ol);
    this.target.appendChild(dv);
  }

  addLinkPopUp() {
    this.titleValue = '';
    this.anchorLink = null;
    this.imageUrl = '';
    $("#addLinkModal").modal('show');
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
    this.target.appendChild(tag);
    $('#addLinkModal').modal('hide');
  }

  saveProjectDetails() {
    this.editableFlag = false;
    for (let i = 0; i < this.projectDetail.ProjectContent.length; i++) {
      let tags = document.querySelectorAll('div[name="content-container"]')[0].innerHTML;
      this.projectDetail.ProjectContent[i].SectionDescription = tags;
    }
    this.projectDetail.ProjectId = this.projectId;
    this.http.post("Project/AddProject", this.projectDetail).then((res: ResponseModel) => {
      if (res.ResponseBody)
        Toast(res.ResponseBody);
    }).catch(e => {
      Error(e);
    })
  }

  enableCurrentSection(e: any) {
    e.preventDefault();
    e.stopPropagation();
    this.target = (<HTMLElement> e.target.closest('div[name="content-container"]'));
    if (this.target) {
      if (this.target.classList.contains('enable-section')) {
        this.deactivateTag();
        this.isSectionEdited = false;
      } else {
        this.target.setAttribute('contenteditable', 'true');
        this.target.classList.add('enable-section');
        this.target.focus();
        this.isSectionEdited = true;
      }
    }
  }

  deactivateTag() {
    this.target.setAttribute('contenteditable', 'false');
    this.target.classList.remove('enable-section');
  }
}

class ProjectWiki {
  ProjectId: number = 0;
  Title: string = '';
  ProjectName: string = '';
  ProjectContent: Array<WikiDetail> = [];
}

class WikiDetail {
  SectionName: string = '';
  SectionDescription: String = '';
}
