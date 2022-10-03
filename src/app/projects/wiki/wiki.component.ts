import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  editableFlag: boolean = true;

  constructor() { }

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
    this.projectDetail.Section = ['Section 1', 'Section - 2', 'Section -3'];
    this.projectDetail.SubSection = ['Sub Section 1', 'Sub Section - 2', 'Sub Section -3'];
  }

  addSectionPopUp() {
    $("#addSectionModal").modal('show');
  }

  addSection() {
    if(this.titleValue && this.titleValue != '') {
      this.projectDetail.Section.push(this.titleValue);
      this.titleValue = '';
      $("#addSectionModal").modal('hide');
    }
  }

  addSubSectionPopUp() {
    $("#addSubSectionModal").modal('show');
  }

  addSubSection() {
    if(this.titleValue && this.titleValue != '') {
      this.projectDetail.Section.push(this.titleValue);
      this.titleValue = '';
      $("#addSubSectionModal").modal('hide');
    }
  }

  editCurrentSection() {
    this.editableFlag = !this.editableFlag;
  }

  trackElement(e: any) {
    alert(e);
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

}

class ProjectWiki {
  Section: Array<string> = [];
  SubSection: Array<String> = [];
  ProjectName: string = '';
}
