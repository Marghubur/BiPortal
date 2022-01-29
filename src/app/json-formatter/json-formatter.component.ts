import { Home } from "./../../providers/constants";
import { CommonService } from "./../../providers/common-service/common.service";
import { Component, OnInit } from "@angular/core";
declare var $:any;
import { AppService } from "src/providers/appservice";
import { iNavigation } from "src/providers/iNavigation";

const ReplaceHeader: string = "{{SINGLE-HEADER}}";
const HeaderTemplate: string = `<div class="format-header">{{SINGLE-HEADER}}</div>`;

@Component({
  selector: "app-jsonformatter",
  templateUrl: "./json-formatter.component.html",
  styleUrls: ["./json-formatter.component.scss"]
})
export class JsonFormatterComponent implements OnInit {
  AllHandler: any;
  OutputData: any;
  SelectedOption: string = "";
  wHeight: number = 0;
  $InputContainer: any;
  ActionType: string = "Code";
  IsNoWrap: boolean = true;
  IsExpandedResult: boolean = false;
  constructor(
    private service: AppService,
    private commonService: CommonService,
    private nav: iNavigation
  ) {
    this.wHeight = this.commonService.GetWindowHeight() - 150;
  }

  ngOnInit() {
    this.BindKeydownEvent();
    $("#container-dv").css({ height: this.wHeight + "px" });
  }

  GetSelectOption() {
    // this.SelectedOption = value;
    // alert(value);
  }

  BindKeydownEvent() {
    $("textarea").keydown(function(e: any) {
      const that: any = event;
      if (e.keyCode === 9) {
        // tab was pressed
        // get caret position/selection
        let start = that.selectionStart;
        let end = that.selectionEnd;

        var $this = $(that);

        // set textarea value to: text before caret + tab + text after caret
        $this.val(
          $this.val().substring(0, start) + "\t" + $this.val().substring(end)
        );

        // put caret at right position again
        that.selectionStart = that.selectionEnd = start + 1;

        // prevent the focus lose
        return false;
      }
      return false;
    });
  }

  HandleDeepParse() {}

  Copytoclipboard() {
    let CopyData = JSON.stringify(this.OutputData);
    let elem: any = document.getElementById("dummy");
    $('<input id="dymmy">')
      .val(CopyData)
      .appendTo("body")
      .select();
    document.execCommand(`copy`);
    $("#dymmy").remove();
  }

  GetJsonObject() {}

  ClearBox() {
    $("#div-outlet").empty();
  }

  ParseLowLevelData(Data: any) {
    let FinalObject = null;
    if (Data !== null) {
      let SplittedData = Data.split("\\");
      if (this.commonService.IsValid(SplittedData)) {
        let index = 0;
        let LastType = null;
        let Item = this.RemoveTralingAndPrecedingQuotes(SplittedData.trim());
        while (index < SplittedData.length) {
          switch (SplittedData[index].trim()) {
            case "{":
              LastType = {};
              break;
            case "}":
              LastType = "}";
              break;
            case "[":
              LastType = [];
              break;
            case "]":
              LastType = "]";
              break;
          }
          index++;
        }
      }
    }
  }

  SyntaxHighlight(json: any) {
    let IsNowrap = this.IsNoWrap;
    json = json
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function(match: any) {
        var cls = "number";
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = "key";
          } else {
            if (IsNowrap) {
              cls = "string word-break";
            } else {
              cls = "string word-break wordwrap-text";
            }
          }
        } else if (/true|false/.test(match)) {
          cls = "boolean";
        } else if (/null/.test(match)) {
          cls = "null";
        }

        let Numbering = "";
        if (cls === "key") {
          Numbering = ""; //'<span class="number-span">1</span>';
        }

        if (cls === "key" && match.indexOf("BH$$-") !== -1)
          return (
            Numbering +
            '<span class="action-span" name="actiontag">&#10151;</span><span class="' +
            cls +
            '">' +
            match.replace("BH$$-", "") +
            "</span>"
          );
        else
          return (
            Numbering +
            '<span contenteditable="true" name="content-text" class="' +
            cls +
            '">' +
            match +
            "</span>"
          );
      }
    );
  }

  PasteBeautifiedResult(Content: string) {
    $("#div-outlet").empty();
    let $outlet: any = document.getElementById("div-outlet");
    let PreTag = document.createElement("pre");
    PreTag.setAttribute("id", "jsonparsed-result");
    $outlet.appendChild(PreTag).innerHTML = Content;
    this.ShowOutput();
  }

  ShowOutput() {
    this.HideOutput();
    setTimeout(() => {
      $("#div-outlet").fadeIn();
    }, 100);
  }

  HideOutput() {
    $("#div-outlet").hide();
  }

  ConvertToObject(ContentObject: string) {
    let index = 0;
    try {
      if (this.commonService.IsValidString(ContentObject)) {
        while (index < 5) {
          if (typeof ContentObject === "string")
            ContentObject = JSON.parse(ContentObject);
          else break;
          index++;
        }
      }
    } catch (e) {
      console.log("Invalid json data");
    }
    return ContentObject;
  }

  BeautifyCurrentJson() {
    try {
      let $doc: any = document;
      let $InputArea: any = $doc.getElementById("inputdata");
      let Content = $InputArea.value;
      let ContentObject = this.ConvertToObject(Content);
      if (this.ActionType === "Code")
        ContentObject = this.service.CreateJsonObject(ContentObject, "");
      else if (this.ActionType === "Tree")
        ContentObject = this.service.CreateJsonObject(ContentObject, "BH$$-");
      if (this.commonService.IsValid(ContentObject)) {
        this.$InputContainer = document.getElementById("inputdata");
        this.PasteBeautifiedResult(
          this.SyntaxHighlight(JSON.stringify(ContentObject, undefined, 4))
        );
      }

      this.AllHandler = $doc.getElementById("jsonparsed-result")
        .querySelectorAll('span[name="actiontag"]');
      this.AddDynamicHandler();

      // let HandlerElems = document
      //       .getElementById("jsonparsed-result")
      //       .querySelectorAll('span[name="content-text"]');
      // this.ConvertToEditable(HandlerElems);
    } catch (e) {
      console.log(e);
    }
  }

  ConvertoParsedTreeviewJsonObject() {
      let $doc: any = document;
      this.$InputContainer = document.getElementById("inputdata");
    let Data = this.$InputContainer.value;
    if (Data !== null && Data.trim() !== "") {
      //Data = this.RemoveTralingAndPrecedingQuotes(Data.trim());
      //this.ParseLowLevelData(Data);
      let $InputArea: any = document.getElementById("inputdata");
      let Content = $InputArea.value;
      let JsonObject = this.ConvertToObject(Content); //JSON.parse(Data);
      this.OutputData = null;
      this.OutputData = this.service.CreateJsonTree(JsonObject);
      if (
        Object.keys(this.OutputData).length === 2 &&
        this.OutputData["html"] !== ""
      ) {
        $("#div-outlet")
          .empty()
          .append(this.OutputData["html"]);

        if ($doc.getElementById("main-content").querySelectorAll('div[name="collapse-handler"]') !== null) {
          if ($doc.getElementById("main-content").querySelectorAll('div[name="collapse-handler"]').length > 0) {
            this.AllHandler = $doc
              .getElementById("main-content")
              .querySelectorAll('div[name="collapse-handler"]');
            this.AddDynamicHandler();
          } else {
            setTimeout(() => {
              this.AllHandler = $doc
                .getElementById("main-content")
                .querySelectorAll('div[name="collapse-handler"]');
              this.AddDynamicHandler();
            }, 2000);
          }
        } else {
          setTimeout(() => {
            this.AllHandler = $doc
              .getElementById("main-content")
              .querySelectorAll('div[name="collapse-handler"]');
            this.AddDynamicHandler();
          }, 2000);
        }
        let HandlerElems = $doc
          .getElementById("div-outlet")
          .querySelectorAll('a[name="actionlink"]');
        this.ConvertToEditable(HandlerElems);
      }
    }
  }

  ConvertToEditable(HandlerElems: any) {
    if (HandlerElems.length > 0) {
      let CurrentElem = null;
      let index = 0;
      while (index < HandlerElems.length) {
        CurrentElem = null;
        CurrentElem = HandlerElems[index];
        CurrentElem.addEventListener("click", () => {
          let $e: any = event;
          $e.stopPropagation();
          let $elem = $($e.currentTarget).closest(
            'div[name="collapse-handler"]'
          );
          if (
            $elem
              .find('img[name="plus"]')
              .closest("a")
              .hasClass("d-none")
          ) {
            $elem
              .find('img[name="plus"]')
              .closest("a")
              .removeClass("d-none");
            $elem
              .find('img[name="minus"]')
              .closest("a")
              .addClass("d-none");

            $elem
              .parent()
              .find('div[name="content-box"]')
              .addClass("d-none");
          } else {
            $elem
              .find('img[name="plus"]')
              .closest("a")
              .addClass("d-none");
            $elem
              .find('img[name="minus"]')
              .closest("a")
              .removeClass("d-none");

            $elem
              .parent()
              .find('div[name="content-box"]')
              .removeClass("d-none");
          }
        });
        index++;
      }
    }
  }

  AddDynamicHandler() {
    if (this.AllHandler.length > 0) {
      let CurrentElem = null;
      let index = 0;
      while (index < this.AllHandler.length) {
        CurrentElem = null;
        CurrentElem = this.AllHandler[index];
        CurrentElem.addEventListener("click", () => {
          // let $elem = $(event.currentTarget).closest('div[class="content-dv"]');
          // if ($elem.find('div[name="content-box"]').hasClass("d-none")) {
          //   $elem.find('img[name="plus"]').addClass("d-none");
          //   $elem.find('img[name="minus"]').removeClass("d-none");
          //   $elem.find('div[name="content-box"]').removeClass("d-none");
          // } else {
          //   $elem.find('img[name="plus"]').removeClass("d-none");
          //   $elem.find('img[name="minus"]').addClass("d-none");
          //   $elem.find('div[name="content-box"]').addClass("d-none");
          // }
        });
        index++;
      }
    }
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this.commonService.IsValid(this.AllHandler)) {
      if (this.AllHandler.length > 0) {
        let CurrentElem = null;
        let index = 0;
        while (index < this.AllHandler.length) {
          CurrentElem = null;
          CurrentElem = this.AllHandler[index];
          CurrentElem.removeEventListener("click", () => {
            console.log("Event removed");
          });
          index++;
        }
      }
    }
  }

  RemoveTralingAndPrecedingQuotes(Data: string) {
    let LastPosition = Data.lastIndexOf('"');
    let Len = Data.length;
    let SingleQuoteLastPosition = Data.lastIndexOf('"');
    let ModifiedData = Data;
    if (Data.indexOf('"') === 0 && Len - LastPosition === 1) {
      ModifiedData = Data.substr(1, Data.length - 2);
    }

    if (Data.indexOf("'") === 0 && Len - SingleQuoteLastPosition === 1) {
      ModifiedData = Data.substr(1, Data.length - 2);
    }
    return ModifiedData;
  }

  CopyDivToClipboard(ElemId: any) {
    let doc: any = document;
    let win: any = window;
    var range = doc.createRange();
    range.selectNode(doc.getElementById(ElemId));
    win.getSelection().removeAllRanges(); // clear current selection
    win.getSelection().addRange(range); // to select text
    document.execCommand("copy");
    //window.getSelection().removeAllRanges(); // to deselect
  }

  CopyTextareaToClipboard() {
    let doc: any = document;
    let win: any = window;
    var range = document.createRange();
    range.selectNode(doc.getElementById("inputdata"));
    win.getSelection().removeAllRanges(); // clear current selection
    win.getSelection().addRange(range); // to select text
    document.execCommand("copy");
  }

  ToggleActionType() {
    $("#action-dropdown").toggleClass("showmodal");
  }

  BindActionName(Type: string) {
    this.ActionType = Type;
    //this.ToggleActionType();
    this.BeautifyCurrentJson();
  }

  wraptext() {
    this.IsNoWrap = !this.IsNoWrap;
    this.BeautifyCurrentJson();
  }

  StringifyObject() {
    try {
      let $InputArea: any = document.getElementById("inputdata");
      let Content = $InputArea.value;
      let ContentObject = this.ConvertToObject(Content);
      ContentObject = this.service.CreateJsonObject(ContentObject, "");

      if (this.commonService.IsValid(ContentObject)) {
        $InputArea.value = "";
        $InputArea.value = JSON.stringify(ContentObject);
      }
    } catch (e) {
      console.log(e);
    }
  }

  ExpandResult() {
    this.IsExpandedResult = !this.IsExpandedResult;
  }

  GenerateSampleJson(Lines: string) {
    let Data = this.SampleJsonData(Lines);
    $("#inputdata").val("");
    setTimeout(() => {
      $("#inputdata").val(Data);
    }, 100);
  }

  SampleJsonData(lines: string) {
    let InnerContent1 = `{
                            "WebFunction_Id": 105,
                            "WebFunction_Nm": "TruckerLanding",
                            "WebFunction_Dsc": "My Dashboard",
                            "WebFunctionCaption": "My Dashboard",
                            "ParentWebFunction_Id": null,
                            "WebFunctionType_Cd": "M",
                            "Status_Cd": "A",
                            "DisplayOrder_Nbr": 1,
                            "WebFunctionSrcPath": "somepath",
                            "Assembly_Nm": null,
                            "HelpSrcPath": null,
                            "GlobalFunction_Flg": "Y"
                        },
                        {
                            "WebFunction_Id": 110,
                            "WebFunction_Nm": "TruckerNames",
                            "WebFunction_Dsc": "My Appointments",
                            "WebFunctionCaption": "My Appointments",
                            "ParentWebFunction_Id": null,
                            "WebFunctionType_Cd": "M",
                            "Status_Cd": "A",
                            "DisplayOrder_Nbr": 2,
                            "WebFunctionSrcPath": null,
                            "Assembly_Nm": null,
                            "HelpSrcPath": null,
                            "GlobalFunction_Flg": "Y"
                        }`;
    let InnerContent2 = `{
                            "WebFunction_Id": 111,
                            "WebFunction_Nm": "TruckerNames",
                            "WebFunction_Dsc": "Add My Appointments",
                            "WebFunctionCaption": "Add My Appointments",
                            "ParentWebFunction_Id": 110,
                            "WebFunctionType_Cd": "C",
                            "Status_Cd": "I",
                            "DisplayOrder_Nbr": 3,
                            "WebFunctionSrcPath": null,
                            "Assembly_Nm": null,
                            "HelpSrcPath": null,
                            "GlobalFunction_Flg": "Y"
                        },
                        {
                            "WebFunction_Id": 112,
                            "WebFunction_Nm": "TruckerNames",
                            "WebFunction_Dsc": "Manage Appointments",
                            "WebFunctionCaption": "Manage Appointments",
                            "ParentWebFunction_Id": 110,
                            "WebFunctionType_Cd": "C",
                            "Status_Cd": "A",
                            "DisplayOrder_Nbr": 1,
                            "WebFunctionSrcPath": null,
                            "Assembly_Nm": null,
                            "HelpSrcPath": null,
                            "GlobalFunction_Flg": "Y"
                        },
                        {
                            "WebFunction_Id": 113,
                            "WebFunction_Nm": "TruckerNames",
                            "WebFunction_Dsc": "Cancel Appointments",
                            "WebFunctionCaption": "Cancel Appointments",
                            "ParentWebFunction_Id": 110,
                            "WebFunctionType_Cd": "C",
                            "Status_Cd": "A",
                            "DisplayOrder_Nbr": 2,
                            "WebFunctionSrcPath": null,
                            "Assembly_Nm": null,
                            "HelpSrcPath": null,
                            "GlobalFunction_Flg": "Y"
                        }, {
                          "WebFunction_Id": 110,
                          "WebFunction_Nm": "TruckerNames",
                          "WebFunction_Dsc": "My Appointments",
                          "WebFunctionCaption": "My Appointments",
                          "ParentWebFunction_Id": null,
                          "WebFunctionType_Cd": "M",
                          "Status_Cd": "A",
                          "DisplayOrder_Nbr": 2,
                          "WebFunctionSrcPath": null,
                          "Assembly_Nm": null,
                          "HelpSrcPath": null,
                          "GlobalFunction_Flg": "Y"
                      }`;

    let Content = "";
    if (lines === "10") {
      Content = InnerContent1;
    } else {
      Content = InnerContent2;
    }
    let Data = `{
                  "userMessages": [],
                  "status": {
                      "Version": {
                          "Major": 1,
                          "Minor": 1,
                          "Build": -1,
                          "Revision": -1,
                          "MajorRevision": -1,
                          "MinorRevision": -1
                      },
                      "Content": null,
                      "StatusCode": 200,
                      "ReasonPhrase": "OK",
                      "Headers": [],
                      "RequestMessage": null,
                      "IsSuccessStatusCode": true
                  },
                  "responseBody": {
                      "AccessToken": "Z9Ul4WUpxiVzw09GoL0xsZG-IAakgHG-jCLCVS2-2V0",
                      "RefreshToken": "dkZyEI7ZLqzAqHuYgC98bL3qQySGh2DlU",
                      "WebFunctionJSON": [
                          ${Content}
                      ],
                      "UserData": {
                          "User_Id": 123,
                          "Login_Nm": "userlg",
                          "Email_Addr": "someuser@mail.com",
                          "First_Nm": "Amit",
                          "Last_Nm": "Amasodf098",
                          "Company_Id": 147,
                          "Telephone_Num": "9989876765",
                          "Disabled_Flg": "N",
                          "ResetPwdOnNextLogin_Flg": "N",
                          "Plate_Nbr": null,
                          "Addr_1": "113 bond drive",
                          "City_Nm": "Hyderabad",
                          "State_Cd": "HD",
                          "Postal_Cd": "500008",
                          "Country_Nm": null,
                          "CompanyType_Cd": "T",
                          "MTO_Cd": "ADKFAHSFDA"
                      }
                  }
              }`;

    return Data;
  }
}
