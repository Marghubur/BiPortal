import { Component, OnInit } from '@angular/core';
import { ProjectWiki } from 'src/providers/constants';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
  isLoaded: boolean = true;
  
  constructor(private nav: iNavigation) { }

  ngOnInit(): void {
  }

  loadWiki() {
    this.nav.navigate(ProjectWiki, { 
      ProjectId: 0
    });
  }
}
