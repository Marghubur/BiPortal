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
  projectId: number = 0;
  target: HTMLElement = null;
  isSectionEdited: boolean = true;
  sectionIndex: number = -1;
  activeEvent: any = null;
  targetElem: HTMLElement = null;
  pannelstyle: any = {};
  htmlText: any = null;
  isloading: boolean  = false;
  isWikiAdded: boolean = false;
  isEdit: boolean = false;
  topics: Array<string> = [];

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
    this.targetElem = e.target;
    e.preventDefault();
    this.popover.classList.remove('d-none');
    let menutop = 0;
    let menuleft = 0;
    if (e.pageY >= (window.innerHeight - 200))
      menutop= window.innerHeight - 250;
    else
      menutop = e.pageY;

    if (e.pageX > window.innerWidth - 200)
      menuleft=  window.innerWidth - 300;
    else
      menuleft = e.pageX;
    this.popover.setAttribute('style', `left: ${menuleft}px; top: ${menutop}px`);
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
    this.isWikiAdded = false;
    this.http.get(`Project/GetAllWiki/${this.projectId}`).then(res => {
      if (res.ResponseBody) {
        let data = res.ResponseBody;
        if (data.DocumentationDetail != null && data.DocumentationDetail != '[]') {
          // this.projectDetail.SectionDescription = res.ResponseBody.DocumentationDetail;
          this.htmlText = res.ResponseBody.DocumentationDetail;
          // this.topics = this.htmlText.split("<div>").filter(x => x.includes("##"));
          // if (this.topics.length > 0) {
          //   for (let i = 0; i < this.topics.length; i++) {
          //     this.topics[i] = this.topics[i].replace("</div>", '');
          //   }
          // }
          this.isWikiAdded = true;
        }
        else
          this.projectDetail.SectionDescription = null;
        this.projectDetail.Title = data.Title;
        this.editableFlag = false;
        Toast("Wiki page loaded successfully.");
      }

      this.initForm();
      this.isLoaded = true;
    })
  }

  initForm() {
    this.wikiForm = this.fb.group({
      WikiSection: new FormControl(this.projectDetail.SectionName),
      WikiSectionDetail: new FormControl(this.sanitize.bypassSecurityTrustHtml(this.projectDetail.SectionDescription  as string))
    });
  }

  addTitlePopUp() {
    this.isWikiAdded = true;
    this.isEdit = true;
    this.projectDetail.Title = '[Add Title]';
    this.titleValue = '';
    this.titleValue = '[Add Section Title]';
    this.projectDetail.SectionName =  this.titleValue;

    let titleTag = document.createElement("div");
    titleTag.className="fw-bold fs-4";
    titleTag.appendChild(document.createTextNode('[Add Title]'));
    let sectionTag = document.createElement("div");
    sectionTag.appendChild(document.createTextNode('[Add Section Detail]'));
    let value = titleTag.outerHTML + sectionTag.outerHTML;
    this.projectDetail.SectionDescription = value;
    this.initForm();
    this.titleValue = '';
    // if (this.target == null) {
    //   let target = <HTMLElement>document.getElementsByClassName("enable-section")[0];
    //   if (target)
    //     this.target = target;
    //   else
    //     ErrorToast("Please select section first");
    // }
    // this.target.appendChild(titleTag);
    // this.target.appendChild(sectionTag);
    // this.closePopOver();
  }

  addHorizontalLine() {
    let tag = document.createElement("hr");
    tag.className="w-100";
    this.targetElem.insertAdjacentElement("afterend", tag);
    this.closePopOver();
  }

  editSubSection(e: any, i: number = 0) {
    let value = e.target.innerText;
    this.projectDetail.SectionName = '';
    this.projectDetail.SectionName =  value;
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

  textAlignment(e: any, align: string) {
    e.stopPropagation();
    e.preventDefault();
    let value = this.targetElem;
    if (value.classList.contains('text-end'))
      value.classList.remove("text-end");
    else if (value.classList.contains('text-start'))
      value.classList.remove("text-start");
    else if (value.classList.contains('text-center'))
      value.classList.remove("text-center");

    if (align == 'right')
      value.classList.add("text-end");
    else if (align == 'left')
      value.classList.add("text-start");
    else if (align == 'center')
      value.classList.add("text-center");

    this.target.focus();
  }

  textFont(e: any, type: string) {
    e.stopPropagation();
    e.preventDefault();
    let value = this.targetElem;
    if (type == 'bold') {
      if (value.classList.contains('fw-bold'))
        value.classList.remove("fw-bold");
      else
      value.classList.add("fw-bold");
    }
    else if (type == 'italic') {
      if (value.classList.contains('fst-italic'))
        value.classList.remove("fst-italic");
      else
        value.classList.add("fst-italic");
    }
    else if (type == 'underline') {
      if (value.classList.contains('text-decoration-underline'))
        value.classList.remove("text-decoration-underline");
      else
        value.classList.add("text-decoration-underline");
    }
    this.target.focus();
  }

  fontSize(e: any, type: string) {
    e.stopPropagation()
    e.preventDefault();
    let value = this.targetElem;
    if (value.classList.contains('fs-6'))
      value.classList.remove("fs-6");
    else if (value.classList.contains('fs-5'))
      value.classList.remove("fs-5");
    else if (value.classList.contains('fs-4'))
      value.classList.remove("fs-4");
    else if (value.classList.contains('fs-3'))
      value.classList.remove("fs-3");

    if (type == 'fs-6')
      value.classList.add("fs-6");
    else if (type == 'fs-5')
      value.classList.add("fs-5");
    else if (type == 'fs-4')
      value.classList.add("fs-4");
    else if (type == 'fs-3')
      value.classList.add("fs-3");
    this.target.focus();
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

  // deleteSection(i: number) {
  //   this.projectDetail.ProjectContent.splice(i, 1);
  //   let project = this.wikiForm.get('Wikis') as FormArray;
  //   project.removeAt(i);
  //   if (project.length == 1) {
  //     this.projectDetail.ProjectContent.splice(0, 1);
  //     project.removeAt(0);
  //   }
  // }

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
    this.targetElem.insertAdjacentElement('afterend', tag);
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
    this.targetElem.insertAdjacentElement('beforebegin', tag);
    this.target.focus();
    this.selectedText(tag);
    this.closePopOver();
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
    this.targetElem.appendChild(dv);
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
    this.targetElem.appendChild(dv);
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

  enablePosition(e: any) {
    this.targetElem = e.target;
  }

  addImage() {
    let tag = document.createElement('div');
    let img = document.createElement('img');
    img.setAttribute('src', this.imageUrl);
    img.setAttribute('style', 'width:44vw;')
    tag.appendChild(img);
    this.targetElem.appendChild(tag);
    $('#addLinkModal').modal('hide');
  }

  saveProjectDetails(e: any) {
    this.isloading = true;
    this.isEdit = false;
    let data = (document.getElementById("richTextField") as HTMLIFrameElement).contentWindow.document.body.innerHTML;
    data = this.removeHeaderTag(data);
    // let headers = data.split("<div>").filter(x => x.includes("##"));
    // if (headers.length > 0) {
    //   for (let i = 0; i < headers.length; i++) {
    //     let newValue = "";
    //     let tagValue = 0;
    //     if (headers[i].includes("##1"))
    //       tagValue = 1;
    //     else if (headers[i].includes("##2"))
    //       tagValue = 2;
    //     else if (headers[i].includes("##3"))
    //       tagValue = 3;
    //     else if (headers[i].includes("##4"))
    //       tagValue = 4;
    //     else if (headers[i].includes("##5"))
    //       tagValue = 5;
    //     else if (headers[i].includes("##6"))
    //       tagValue = 6;

    //     if (headers[i].includes("</div>")) {
    //       newValue = headers[i].replace("</div>", "");
    //       newValue = `<h${tagValue}>`+headers[i]+`</h${tagValue}>`+"</div>"
    //     } else {
    //       newValue = `<h${tagValue}>`+headers[i]+`</h${tagValue}>`
    //     }
    //    data =  data.replace(headers[i], newValue)
    //   }
    // }
    this.splitText();
    data = (document.getElementById("richTextField") as HTMLIFrameElement).contentWindow.document.body.innerHTML;
    this.projectDetail.SectionDescription= data;
    this.projectDetail.ProjectId = this.projectId;
    this.http.post("Project/AddWiki", this.projectDetail).then((res: ResponseModel) => {
      if (res.ResponseBody) {
        this.isloading = false;
        Toast("Project details inserted/ updated successfully");
      }
    }).catch(e => {
      this.isloading = false;
      Error(e);
    })
  }

  removeHeaderTag(data: string) {
    if (data.includes("<h1>"))
      data = data.replaceAll("<h1>", "");

    if (data.includes("</h1>"))
      data = data.replaceAll("</h1>", "");

    if (data.includes("<h2>"))
      data = data.replaceAll("<h2>", "");

    if (data.includes("</h2>"))
      data = data.replaceAll("</h2>", "");

    if (data.includes("<h3>"))
      data = data.replaceAll("<h3>", "");

    if (data.includes("</h3>"))
      data = data.replaceAll("</h3>", "");

    if (data.includes("<h4>"))
      data = data.replaceAll("<h4>", "");

    if (data.includes("</h4>"))
      data = data.replaceAll("</h4>", "");

    if (data.includes("<h5>"))
      data = data.replaceAll("<h5>", "");

    if (data.includes("</h5>"))
      data = data.replaceAll("</h5>", "");

    if (data.includes("<h6>"))
      data = data.replaceAll("<h6>", "");

    if (data.includes("</h6>"))
      data = data.replaceAll("</h6>", "");

    return data;
  }

  splitText() {
    let data = (document.getElementById("richTextField") as HTMLIFrameElement).contentWindow.document.body.innerText;
    let header = data.split("##");
    if (header.length > 0) {
      header = header.filter(x => x != "");
      for (let i = 0; i < header.length; i++) {
        let value =header[i].split("\n")[0]
        let tagValue = 0;
        if (value.includes("1"))
          tagValue = 1;
        else if (value.includes("2"))
          tagValue = 2;
        else if (value.includes("3"))
          tagValue = 3;
        else if (value.includes("4"))
          tagValue = 4;
        else if (value.includes("5"))
          tagValue = 5;
        else if (value.includes("6"))
          tagValue = 6;

        let newValue = `<h${tagValue}>`+value+`</h${tagValue}>`
        data =  data.replace(value, newValue)
      }
      (document.getElementById("richTextField") as HTMLIFrameElement).contentWindow.document.body.innerText = data;
    }
  }

  // saveProjectDetails(e: any) {
  //   e.stopPropagation();
  //   e.preventDefault();
  //   this.editableFlag = false;
  //   let tags = document.querySelector('div[name="content-container"]').innerHTML;
  //   this.projectDetail.SectionDescription= tags;
  //   this.projectDetail.ProjectId = this.projectId;
  //   this.http.post("Project/AddWiki", this.projectDetail).then((res: ResponseModel) => {
  //     if (res.ResponseBody)
  //       Toast("Project details inserted/ updated successfully");
  //   }).catch(e => {
  //     Error(e);
  //   })
  // }

  enableSection() {
    this.target = (<HTMLElement> document.querySelector('div[name="content-container"]'));
    if (this.target) {
      this.target.setAttribute('contenteditable', 'true');
      this.target.classList.add('enable-section', 'py-2');
      this.target.focus();
      if (this.isSectionEdited == true)
        this.isSectionEdited = false;
    }
  }

  deactivateTag() {
    if (this.target) {
      this.target.setAttribute('contenteditable', 'false');
      this.target.classList.remove('enable-section', 'py-2');
      this.target = null;
      this.targetElem = null;
    } else {
      let elem = document.querySelectorAll('div[name="content-container"]');
      elem[0].setAttribute('contenteditable', 'false');
      elem[0].classList.remove('enable-section', 'py-2');
      this.target = null;
      this.targetElem = null;
    }
  }

  // addindex() {
  //   if (!this.projectDetail.ProjectContent[0].SectionName.includes('Index')) {
  //     this.titleValue = '';
  //     this.titleValue = 'Index';
  //     // this.projectDetail.ProjectContent.unshift({
  //     //   SectionName: this.titleValue,
  //     //   SectionDescription: ''
  //     // })
  //     let len = this.wikiForm.controls.Wikis.value.length;
  //     this.sectionIndex = len;
  //     let project = this.wikiForm.get('Wikis') as FormArray;
  //     project.insert(0, this.createIndex());
  //     this.titleValue = '';
  //     this.isSectionEdited = false;
  //   }
  // }

  // createIndex(): FormGroup {
  //   return this.fb.group({
  //     WikiSection: new FormControl(this.titleValue),
  //     WikiSectionDetail: new FormControl(`<p>${this.projectDetail.ProjectContent[1].SectionName}</p>`)
  //   });
  // }

  enableCurrentSection(e: any) {
    this.activeEvent = e;
    e.preventDefault();
    e.stopPropagation();
    //this.target = (<HTMLElement> e.target.closest('div[name="content-container"]'));
    this.target = (<HTMLElement> document.querySelector('div[name="content-container"]'));
    if (this.target) {
      // if (this.target.classList.contains('enable-section')) {
      //   this.deactivateTag();
      //   this.isSectionEdited = true;
      // } else {
      // }
      this.target.setAttribute('contenteditable', 'true');
      this.target.classList.add('enable-section', 'py-2');
      this.target.focus();
      if (this.isSectionEdited == true)
        this.isSectionEdited = false;
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

  editorEdited(e: any) {
    this.isEdit = e;
  }
}

class ProjectWiki {
  ProjectId: number = 0;
  Title: string = '';
  ProjectName: string = '';
  SectionName: string = '';
  SectionDescription: String = '';
}
