import { Component } from '@angular/core';
import { CommonService } from 'src/providers/common-service/common.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
  isLoading: boolean = false;

  constructor(private common: CommonService){
    this.common.isLoading.subscribe(res => {
      this.isLoading = res;
    })
   }
}
