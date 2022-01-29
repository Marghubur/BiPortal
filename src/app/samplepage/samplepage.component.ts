import { CommonService } from "./../../providers/common-service/common.service";
import { Home } from "./../../providers/constants";
import { Component, OnInit } from "@angular/core";
import { iNavigation } from "src/providers/iNavigation";

@Component({
  selector: "app-samplepage",
  templateUrl: "./samplepage.component.html",
  styleUrls: ["./samplepage.component.scss"]
})
export class SamplepageComponent implements OnInit {
  SampleDataArray: Array<any> = [];
  IsbuildData: boolean = false;

  constructor(private nav: iNavigation, private commonService: CommonService) {
    this.Init();
  }

  ngOnInit() {}

  Init() {
    this.SampleDataArray.push({
      name: "Student Data"
    });

    this.SampleDataArray.push({
      name: "Person Data"
    });

    this.SampleDataArray.push({
      name: "Employee Data"
    });

    this.SampleDataArray.push({
      name: "Cities Data"
    });

    this.SampleDataArray.push({
      name: "Cars Data"
    });
  }

  GenerateTable() {
    this.IsbuildData = true;
  }
}
