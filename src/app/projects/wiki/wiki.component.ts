import { AfterViewChecked, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ResponseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { ErrorToast, Toast } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';
declare var $: any;

@Component({
  selector: 'app-wiki',
  templateUrl: './wiki.component.html',
  styleUrls: ['./wiki.component.scss']
})
export class WikiComponent implements OnInit, AfterViewChecked {
  popover: HTMLElement = null;
  isLoaded: boolean = true;
  projectDetail: ProjectWiki = null;
  titleValue: string = '';
  imageUrl: string = '';
  anchorLink: string = '';
  tag: HTMLElement = null;
  editableFlag: boolean = false;
  wikiForm: FormGroup = null;
  WikiDetails: Array<WikiDetail> = [];
  projectId: number = 0;
  target: HTMLElement = null;
  isSectionEdited: boolean = true;
  sectionIndex: number = -1;
  activeEvent: any = null;

  constructor(private fb: FormBuilder,
              private nav:iNavigation,
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
    if (this.target == null) {
      let target = <HTMLElement>document.getElementsByClassName("enable-section")[0];
      if (target)
        this.target = target;
      else
        ErrorToast("Please select section first");
    }
  }

  closePopOver(){
    this.popover.classList.add('d-none');
  }

  ngOnInit(): void {
    this.WikiDetails = [];
    this.projectDetail= new ProjectWiki();
    this.projectDetail.ProjectName= "";
    let data = this.nav.getValue();
    if (data){
      this.projectDetail.ProjectName = data.ProjectName;
      this.projectDetail.ProjectId = data.ProjectId;
      this.projectId = data.ProjectId;
      //this.initForm();

      this.loadData();
    } else {
      ErrorToast("Invalid project selected");
    }
  }

  loadData() {
    this.isLoaded = false;
    this.editableFlag = false;
    this.http.get(`Project/GetAllWiki/${this.projectId}`).then(res => {
      if (res.ResponseBody) {
        let data = JSON.parse(res.ResponseBody.DocumentationDetail);
        this.projectDetail.Title = data.Title;
        this.projectDetail.ProjectContent = data.ProjectContent;
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

  adddProject() {
    let project = this.wikiForm.get('Wikis') as FormArray;
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
    this.projectDetail.Title = '[Add Title]';
    this.projectDetail.ProjectContent = [];
  }

  editSubSection(e: any, i: number) {
    let value = e.target.innerText;
    let project = this.wikiForm.get('Wikis') as FormArray;
    this.projectDetail.ProjectContent[i].SectionName = '';
    this.projectDetail.ProjectContent[i].SectionName =  value;
    //this.wikiForm.get('Wikis')['controls'][i].get('WikiSection').setValue(value);
  }

  editProjectTitle(e: any) {
    let value = e.target.value;
    this.projectDetail.Title =  value;
  }

 async tractPressEvent(e: any) {
    switch(e.key){
      case "esc":
        this.closePopOver();
        break;
    }
  }

  // addsection() {
  //   this.titleValue = '';
  //   this.titleValue = '[Add Section Title]';
  //   this.projectDetail.ProjectContent.push( {
  //     SectionName: this.titleValue,
  //     SectionDescription: ''
  //   });

  //   let len = this.wikiForm.controls.Wikis.value.length;
  //   this.sectionIndex = len;
  //   this.adddProject();
  //   this.titleValue = '';
  //   this.closePopOver();
  //   this.isSectionEdited = false;
  // }

  editCurrentSection() {
    this.editableFlag = !this.editableFlag;
  }

  deleteSection(i: number) {
    this.projectDetail.ProjectContent.splice(i, 1);
    let project = this.wikiForm.get('Wikis') as FormArray;
    project.removeAt(i);
    if (project.length == 1) {
      this.projectDetail.ProjectContent.splice(0, 1);
      project.removeAt(0);
    }
  }

  trackElement(e: any) {
    alert(e);
  }


  addParagraph() {
    let divtag = document.createElement("div");
    divtag.setAttribute('style', 'margin-top: 3rem;');
    let tag = document.createElement("p");
    tag.className="mb-0";
    tag.appendChild(document.createTextNode('YOUR TEXT'));
    divtag.appendChild(tag);
    if (this.target == null) {
      let target = <HTMLElement>document.getElementsByClassName("enable-section")[0];
      if (target)
        this.target = target;
      else
        ErrorToast("Please select section first");
    }
    this.target.appendChild(divtag);
    this.target.focus();
    this.selectedText(tag);
  }

  selectedText(tag: any) {
    let selection = window.getSelection();
    let range = document.createRange();
    range.selectNodeContents(tag);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  addParagraphBelow() {
    if (this.target == null) {
      let target = <HTMLElement>document.getElementsByClassName("enable-section")[0];
      if (target)
        this.target = target;
      else
        ErrorToast("Please select section first");
    }
    let tag = document.createElement("p");
    tag.className="mb-0";
    tag.appendChild(document.createTextNode('YOUR TEXT'));
    this.target.appendChild(tag);
    this.target.focus();
    this.selectedText(tag);
    this.closePopOver();
  }

  addParagraphAbove() {
    if (this.target == null) {
      let target = <HTMLElement>document.getElementsByClassName("enable-section")[0];
      if (target)
        this.target = target;
      else
        ErrorToast("Please select section first");
    }
    let tag = document.createElement("p");
    tag.className="mb-0";
    tag.appendChild(document.createTextNode('YOUR TEXT'));
    this.target.appendChild(tag);
    this.target.focus();
    this.selectedText(tag);
  }

  enableListItem() {
    if (this.target == null) {
      let target = <HTMLElement>document.getElementsByClassName("enable-section")[0];
      if (target)
        this.target = target;
      else
        ErrorToast("Please select section first");
    }
    let dv = document.createElement('div');
    let ol = document.createElement('ol');
    let anc = document.createElement('a');
    anc.setAttribute('href', 'javascript:void(0)')
    let text = document.createTextNode("[ YOUR TEXT HERE ]");
    anc.appendChild(text);
    ol.setAttribute('type', '1');
    let li = document.createElement("li");
    li.appendChild(anc);
    ol.appendChild(li);
    dv.appendChild(ol);
    this.target.appendChild(dv);
    this.closePopOver();
    anc.focus();
    this.selectedText(anc);
  }

  enableBulletItem() {
    if (this.target == null) {
      let target = <HTMLElement>document.getElementsByClassName("enable-section")[0];
      if (target)
        this.target = target;
      else
        ErrorToast("Please select section first");
    }
    let dv = document.createElement('div');
    let ul = document.createElement('ul');
    let li = document.createElement("li");
    ul.appendChild(li);
    dv.appendChild(ul);
    this.target.appendChild(dv);
    this.closePopOver();
    this.target.focus();
  }

  disabeSection() {
    //this.target = null;
    this.closePopOver();
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
    if (this.target == null) {
      let target = <HTMLElement>document.getElementsByClassName("enable-section")[0];
      if (target)
        this.target = target;
      else
        ErrorToast("Please select section first");
    }
    this.target.appendChild(tag);
    $('#addLinkModal').modal('hide');
  }

  saveProjectDetails(e: any) {
    e.stopPropagation();
    e.preventDefault();
    this.editableFlag = false;
    for (let i = 0; i < this.projectDetail.ProjectContent.length; i++) {
      let tags = document.querySelectorAll('div[name="content-container"]')[i].innerHTML;
      this.projectDetail.ProjectContent[i].SectionDescription = tags;
    }
    this.projectDetail.ProjectId = this.projectId;
    this.http.post("Project/AddWiki", this.projectDetail).then((res: ResponseModel) => {
      if (res.ResponseBody)
        Toast("Project details inserted/ updated successfully");
    }).catch(e => {
      Error(e);
    })
  }

  enableSection(index: number) {
    let elem = (document.querySelectorAll('div[name="content-container"]'))
    this.target = (<HTMLElement> document.querySelectorAll('div[name="content-container"]')[index]);
    for (let i = 0; i < elem.length; i++) {
      elem[i].setAttribute('contenteditable', 'false');
      elem[i].classList.remove('enable-section', 'py-2');
    }
    if (this.target) {
      this.target.setAttribute('contenteditable', 'true');
      this.target.classList.add('enable-section', 'py-2');
      this.target.focus();
      this.isSectionEdited = false;
    }
  }

  deactivateTag() {
    if (this.target) {
      this.target.setAttribute('contenteditable', 'false');
      this.target.classList.remove('enable-section', 'py-2');
      this.target = null;
      this.isSectionEdited = true;
    } else {
      let elem = document.querySelectorAll('div[name="content-container"]');
      for (let i = 0; i < elem.length; i++) {
        elem[i].setAttribute('contenteditable', 'false');
        elem[i].classList.remove('enable-section', 'py-2');
      }
      this.target = null;
      this.isSectionEdited = true;
    }
  }

  addindex() {
    if (!this.projectDetail.ProjectContent[0].SectionName.includes('Index')) {
      this.titleValue = '';
      this.titleValue = 'Index';
      this.projectDetail.ProjectContent.unshift({
        SectionName: this.titleValue,
        SectionDescription: ''
      })
      let len = this.wikiForm.controls.Wikis.value.length;
      this.sectionIndex = len;
      let project = this.wikiForm.get('Wikis') as FormArray;
      project.insert(0, this.createIndex());
      this.titleValue = '';
      this.isSectionEdited = false;
    }
  }

  createIndex(): FormGroup {
    return this.fb.group({
      WikiSection: new FormControl(this.titleValue),
      WikiSectionDetail: new FormControl(`<p>${this.projectDetail.ProjectContent[1].SectionName}</p>`)
    });
  }

  enableCurrentSection(e: any) {
    this.activeEvent = e;
    e.preventDefault();
    e.stopPropagation();
    this.target = (<HTMLElement> e.target.closest('div[name="content-container"]'));
    if (this.target) {
      if (this.target.classList.contains('enable-section')) {
        this.deactivateTag();
        this.isSectionEdited = true;
      } else {
        this.target.setAttribute('contenteditable', 'true');
        this.target.classList.add('enable-section', 'py-2');
        this.target.focus();
        this.isSectionEdited = false;
      }
    }
  }

  pasteCopiedContent(e: any) {
    e.preventDefault();
    let items = (this.activeEvent.clipboardData || this.activeEvent.orignalEvent.clipboardData).items;
    let blob = null;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image/png') === 0)
        blob = items[i].getAsFile();
    }
    if (blob != null) {
      var reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = (event: any) => {
        this.imageUrl = event.target.result;
      };
      this.addImage();
    }
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
