import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { ResopnseModel } from 'src/auth/jwtService';
import { AjaxService } from 'src/providers/ajax.service';
import { CommonService } from 'src/providers/common-service/common.service';

@Component({
  selector: 'app-liveurl',
  templateUrl: './liveurl.component.html',
  styleUrls: ['./liveurl.component.scss']
})
export class LiveurlComponent implements OnInit {
  savedUrl: Array<any> = [];
  currentTabName: string = "resources";
  resourcesList: Array<any> = [];
  routeList: Array<any> = [];
  currentSavedUrlItem: any = {};
  constructor(private http: AjaxService, private common: CommonService) { }

  manageTabs(e: any, tagName: string) {
    $('#tap-header').find('a').removeClass('active');
    this.currentTabName = tagName;
    e.target.classList.add('active');
  }

  ngOnInit(): void {
    this.currentSavedUrlItem = {
      savedUrlId: 0,
      method: "",
      url: ""
    };

    this.loadData();
    this.initPageData();
    this.buildRouteList();
    this.savedUrl = new Array<any>();
  }

  SaveUrl() {
    this.http.post("LiveUrl/saveliveUrl", this.currentSavedUrlItem).then((res: ResopnseModel) => {
      let result = res.ResponseBody;
      if(result['Table'] !== null){
        this.savedUrl = result['Table'];
      }      
    });
  }

  addNewUrl() {
    event.stopPropagation();
    alert("add");
  }

  getOptions() {
    event.stopPropagation();
    alert("options");
  }

  deleteUrl(){
    event.stopPropagation();
    alert("delete");
  }

  initPageData(){
    this.resourcesList.push({
      title: "users",
      url: "",
      pageSize: 100,
      description: "get users json data contains name, address, mobile, email etc"      
    },{
      title: "sports",
      url: "",
      pageSize: 100,
      description: "sprorts related json data e.g player name, matches year etc"      
    },{
      title: "books",
      url: "",
      pageSize: 100,
      description: "book and their auther data in json"      
    },{
      title: "students",
      url: "",
      pageSize: 100,
      description: "some useful studnet related json data"      
    })
  }

  buildRouteList(){
    this.routeList.push({
      title: "GET",
      url: "",
      pageSize: 100,
      description: "/student"      
    },{
      title: "GET",
      url: "",
      pageSize: 100,
      description: "/users"      
    },{
      title: "GET",
      url: "",
      pageSize: 100,
      description: "/books_and_authors"      
    },{
      title: "POST",
      url: "",
      pageSize: 100,
      description: "/students"      
    },{
      title: "POST",
      url: "",
      pageSize: 100,
      description: "/users"      
    },{
      title: "PUT",
      url: "",
      pageSize: 100,
      description: "/student"      
    },{
      title: "DELETE",
      url: "",
      pageSize: 100,
      description: "/book_and_authors"      
    },{
      title: "DELETE",
      url: "",
      pageSize: 100,
      description: "/users"      
    });
  }

  getCurrentUrl(itemId: number) {
    let currentSavedItem = this.savedUrl.filter(x=>x.savedUrlId === itemId);
    if(currentSavedItem.length > 0) {
      this.currentSavedUrlItem = currentSavedItem[0];      
    }
  }

  loadData() {
    let searchModal: any = {
      SearchString: "1=1",
      PageIndex: 1,
      PageSize: 10,
      SortBy: ""
    };

    this.http.post("liveurl/loadpagedata", searchModal).then((res: ResopnseModel) => {
      let result = res.ResponseBody;
      if(result['Table'] !== null){
        this.savedUrl = result['Table'];
      }
    });    
  }

  ReloadPage(){
    this.loadData();
  }
}
