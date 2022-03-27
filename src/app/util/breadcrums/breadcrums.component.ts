import { Component, OnInit } from '@angular/core';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-breadcrums',
  templateUrl: './breadcrums.component.html',
  styleUrls: ['./breadcrums.component.scss']
})
export class BreadcrumsComponent implements OnInit {
  routePath: Array<any> = [];
  constructor(private nav: iNavigation) { }

  ngOnInit(): void {
    let value = this.nav.getRouteList();
    let i = 0;
    while(i < value.length) {
      this.routePath.push({
        name: value[i].Key.replace("admin/", ""),
        path: value[i].Key
      });
      i++;
    }
  }

  changeRouter(path: string) {
    this.nav.navigateWithoutArgs(path);
  }
}
