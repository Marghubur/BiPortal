import { Component, Input, OnInit } from '@angular/core';

/*----------------------- how to use ---------------


  <app-image-loader 
    [Url]="'imagepath.png'"
    [ClassName]="'custom-class-name'">
  </app-image-loader>

----------------------------------------------------*/


@Component({
  selector: 'app-image-loader',
  templateUrl: './image-loader.component.html',
  styleUrls: ['./image-loader.component.scss']
})
export class ImageLoaderComponent implements OnInit {
  @Input()
  set url(url: string) {
    this.imageUrl = url;
  }

  @Input()
  set className(className: string) {
    this._className = className;
  }

  @Input()
  set autofit(flag: number) {
    if(flag == 1) {
      this._className = "w-auto";
    }
  }

  _className: string = null;
  imageUrl: string = "";
  isLoading: boolean = true;
  constructor() { }

  ngOnInit(): void {
  }

  hideLoader() {
    if(this.imageUrl && this.imageUrl !== "")
      this.isLoading = !this.isLoading;
  }
}
