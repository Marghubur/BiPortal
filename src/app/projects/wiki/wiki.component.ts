import { Component, OnInit } from '@angular/core';
declare var $: any;

@Component({
  selector: 'app-wiki',
  templateUrl: './wiki.component.html',
  styleUrls: ['./wiki.component.scss']
})
export class WikiComponent implements OnInit {
  isLoaded: boolean = true;
  projectDetail: ProjectWiki = new ProjectWiki();
  titleValue: string = '';

  constructor() { }

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

}

class ProjectWiki {
  Section: Array<string> = [];
  SubSection: Array<String> = [];
  ProjectName: string = '';
}