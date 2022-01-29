import { Component, OnInit } from '@angular/core';
import { AjaxService } from 'src/providers/ajax.service';
import { CommonService } from 'src/providers/common-service/common.service';

@Component({
  selector: 'app-userprofile',
  templateUrl: './userprofile.component.html',
  styleUrls: ['./userprofile.component.scss']
})
export class UserprofileComponent implements OnInit {

  constructor(private http: AjaxService, private common: CommonService) { }

  ngOnInit() {
    this.loadData("www.google.com");
  }

  readExcelData(e: any) { }

  loadData(Uri: string) {
    this.http.get(Uri).then(response => {
      this.common.ShowToast("www.google.com page loaded successfully");
      alert(response);
    }).catch(e => {
      this.common.ShowToast("www.google.com page failed to load.");
      alert(JSON.stringify(e));
    })
  }
}
