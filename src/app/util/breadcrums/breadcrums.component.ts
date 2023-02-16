import { Component, Input, OnInit } from '@angular/core';
import { iNavigation } from 'src/providers/iNavigation';

@Component({
  selector: 'app-breadcrums',
  templateUrl: './breadcrums.component.html',
  styleUrls: ['./breadcrums.component.scss']
})
export class BreadcrumsComponent implements OnInit {
  routePath: Array<any> = [];
  titleText: string = "";
  subTitleText: string = "";

  constructor(private nav: iNavigation) { }

  @Input() 
  set title(text: string) {
    if (text) {
      this.titleText = text;
    }
  }

  @Input() 
  set subtitle(text: string) {
    if (text) {
      this.subTitleText = text;
    }
  }

  ngOnInit(): void {
    let value = this.nav.getRouteList();
    let i = 0;
    while(i < value.length) {
      let sliceses = value[i].Key.split("/");
      this.routePath.push({
        name: sliceses[sliceses.length - 1],
        path: value[i].Key
      });
      i++;
    }
  }

  changeRouter(path: string) {
    this.nav.navigateWithoutArgs(path);
  }
}
