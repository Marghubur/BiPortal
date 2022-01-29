import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-blogs",
  templateUrl: "./blogs.component.html",
  styleUrls: ["./blogs.component.scss"]
})
export class BlogsComponent implements OnInit {
  BlogDetailEntries: Array<BlogDetail> = [];
  ArticleId: string = "29370275";
  constructor() {}

  ngOnInit() {
    this.BlogDetailEntries.push(
      {
        UserName: "Raja",
        EmailId: "raj@gmail.com",
        BlogTitle: "Java in detail",
        CreatedOn: "10/09/2019"
      },
      {
        UserName: "Anil",
        EmailId: "anil@gmail.com",
        BlogTitle: "Asp.net Core",
        CreatedOn: "10/09/2019"
      },
      {
        UserName: "Nadeem",
        EmailId: "nadeem@gmail.com",
        BlogTitle: "Angular 7",
        CreatedOn: "10/09/2019"
      },
      {
        UserName: "Rehman",
        EmailId: "rehman@gmail.com",
        BlogTitle: "Sql server",
        CreatedOn: "10/09/2019"
      }
    );
  }
}


export class BlogDetail {
  UserName: string =  "";
  EmailId: string = "";
  BlogTitle: string = "";
  CreatedOn: string = "";
}