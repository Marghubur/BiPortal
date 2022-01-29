import { AjaxService } from "src/providers/ajax.service";
import { CommonService } from "./../../providers/common-service/common.service";
import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { environment } from '../../../src/environments/environment'
declare var $: any;

@Component({
  selector: "app-generatedresult",
  templateUrl: "./generatedresult.component.html",
  styleUrls: ["./generatedresult.component.scss"]
})
export class GeneratedresultComponent implements OnInit {
  BindingData: any;
  IsEmptyRow: boolean = false;
  TotalHeaders: number = 0;
  FilePath: string = "";
  IsValidScriptPath: boolean = false;
  @Output() ClosePopup = new EventEmitter();
  @Input()
  set GeneratedScriptFileName(data: string) {
    this.IsValidScriptPath = false;
    this.FilePath = "";
    if (this.commonService.IsValid(data)) {
      this.IsValidScriptPath = true;
      this.FilePath =
        environment.baseUrl.replace("api/", "") + "DynamicScript/" + data;
    }
  }

  @Input()
  set ResultSet(data: any) {
    this.BindingData = data;
  }
  constructor(
    private commonService: CommonService,
    private ajax: AjaxService
  ) { }

  ngOnInit() {
    if (!this.commonService.IsValid(this.BindingData)) {
      this.commonService.ShowToast("Found empty result.");
    } else {
      this.commonService.ShowToast("Data generated successfully.");
    }
  }

  ActivatePanel(sectionId: string, index: string) {
    let $event: any = event;
    this.ActivateCurrentPanel($($event.currentTarget));
    let NextSection = sectionId + index;
    if ($("#" + NextSection).length > 0) {
      $("#generated_grid")
        .find('div[name="dynamic-grid-section"]')
        .addClass("d-none");
      $("#" + NextSection).removeClass("d-none");
    }
  }

  ActivateCurrentPanel($Current: any) {
    $Current
      .closest("ul")
      .find('a[name="action-anc"]')
      .removeClass("active");
    $Current.addClass("active");
  }

  GoBackPage() {
    this.ClosePopup.emit();
  }

  CopyToClipboard() {
    let $event: any = event;
    let field: any = $event.currentTarget
      .closest("div")
      .closest('div[name="selector-div"]')
      .querySelector("textarea");
    field.select();
    document.execCommand("copy");
  }

  ExportToText() { }

  ExportToExcel() { }
}
