import { Home, TableSampleData, AutoPlayMessages } from "./../constants";
import { Injectable, ElementRef } from "@angular/core";
import { ApplicationStorage } from "./../ApplicationStorage";
import * as $ from 'jquery';

const AllowedKey = [8, 9, 46];
@Injectable({
  providedIn: "root"
})
export class CommonService {
  LoaderEnableByAjax: boolean = false;
  LoaderEnableByPageNavigator: boolean = false;
  private CurrentPageName: string = Home;
  private ApplicationMenu: any;
  private DefaultUserImagePath: string = "assets/img/user.jpg";
  private IsAutoPlayEnabled: boolean = false;
  private PageLevelCounter: number = 0;
  private WindowHeight: number = 0;
  private WindowWidth: number = 0;
  DefaultTimeout: number = 8 * 1000;
  $ButtonId: any = "";
  constructor() { }

  public GetWindowHeight(): number {
    return this.WindowHeight;
  }

  public GetWindowWidth(): number {
    return this.WindowWidth;
  }

  public SetWindowdDetail(windowHeight: number, windowWidth: number) {
    this.WindowHeight = windowHeight;
    this.WindowWidth = windowWidth;
  }

  public SetCurrentPageName(Name: string) {
    if (this.IsValidString(Name)) {
      this.CurrentPageName = Name;
    }
  }

  public GetAutoPlayPageCount() {
    return this.PageLevelCounter;
  }

  SetAutoPlayValue(AutoPlayFlag: boolean) {
    if (typeof AutoPlayFlag === "boolean")
      this.IsAutoPlayEnabled = AutoPlayFlag;
  }

  GetAutoPlayValue(): boolean {
    return this.IsAutoPlayEnabled;
  }

  public SetApplicationMenu() {
    let key = "ApplicationMenu";
    let Data: any = localStorage.getItem("master");
    let ResultingData = null;
    if (this.IsValid(Data)) {
      Data = JSON.parse(Data);
      let DataKeys = Object.keys(Data);
      if (DataKeys.length > 0) {
        let index = 0;
        while (index < DataKeys.length) {
          if (DataKeys[index].toLocaleLowerCase() === key.toLocaleLowerCase()) {
            ResultingData = Data[DataKeys[index]];
            break;
          }
          index++;
        }
      }
    }
    if (this.IsValid(ResultingData) && ResultingData.length > 0) {
      let MenuData = JSON.parse(ResultingData[0].Menu);
      if (this.IsValid(MenuData)) {
        this.ApplicationMenu = MenuData;
      }
    }
  }

  public GetApplicationMenu(): any {
    if (this.ApplicationMenu === undefined || this.ApplicationMenu === null)
      this.SetApplicationMenu();
    return this.ApplicationMenu;
  }

  public GetCurrentPageName() {
    return this.CurrentPageName;
  }

  public DefaultUserImage(): string {
    return this.DefaultUserImagePath;
  }

  public IsValid(Value: any): boolean {
    let Flag: boolean = false;
    if (
      Value !== null &&
      Value !== undefined &&
      Value !== "" &&
      Value !== "{}"
    ) {
      let ValueDataType = typeof Value;
      if (ValueDataType !== "undefined") {
        if (ValueDataType === "string") {
          if (Value.trim().length > 0) {
            Flag = true;
          }
        } else if (ValueDataType === "object") {
          if (Array.isArray(Value)) {
            if (Value.length > 0) Flag = true;
          } else {
            if (Object.keys(Value).length > 0) Flag = true;
          }
        }
      }
    }
    return Flag;
  }

  public IsValidString(Data: any): boolean {
    let flag = false;
    let type = typeof Data;
    if (type === "undefined") return flag;
    if (type === "string") {
      if (Data !== null) {
        flag = true;
        if (Data.trim() === "") flag = false;
      }
    } else if (type === "number") flag = true;
    return flag;
  }

  public NumericOnly(e: any): boolean {
    let flag = false;
    if (e >= 48 && e <= 57) flag = true;
    return flag;
  }

  public IsMoney(value: any) {
    let flag = true;
    if (!this.IsNumeric(value)) {
      if (value != ".") {
        flag = false;
      }
    }
    return flag;
  }

  public IsNumeric(data: any): boolean {
    let flag = false;
    try {
      let integerData = parseInt(data);
      if (!isNaN(integerData)) flag = true;
      else flag = false;
    } catch (e) {
      return false;
    }
    return flag;
  }

  public Scrollto(BodyId: string, ToElement: any) {
    $("#" + BodyId).animate({ scrollTop: ToElement.position().top }, "slow");
  }

  public ScrollPageToId(BodyId: string) {
    $("html, body").animate(
      {
        scrollTop: $("#" + BodyId).offset().top - 100
      },
      "slow"
    );
  }

  public AlphaNumericOnly(event: any) { }

  public AlphaOnly(event: any) { }

  public DateFormat(event: any) { }

  public MobileNumberFormat(number: any, count: number) {
    let flag = true;

    if (number >= 48 && number <= 57) {
      if (count > 9) {
        flag = false;
      }
    } else {
      flag = false;
    }
    return flag;
  }

  public HighlightNavMenu() {
    let PageName = location.pathname;
    $('div[name="submenues"]').css({ display: "none" });
    let $elem = $('a[name="' + PageName + '"][type="link"]');
    if ($elem != null) {
      $elem.closest("li").addClass("active active-list");
      $elem.closest('li[name="item-header"]').addClass("active");

      $elem
        .closest('li[name="item-header"]')
        .children("a")
        .addClass("active");

      $elem.closest('div[name="submenues"]').css({ display: "block" });
    }
  }

  ShowLoaderByAjax() {
    if (!this.LoaderEnableByAjax) {
      let $elem = $("#fadeloadscreen");
      if ($elem.length === 1) {
        $("#fadeloadscreen").removeClass("dn");
        this.LoaderEnableByAjax = true;
      }
    }
  }

  HideLoaderByAjax() {
    if (this.LoaderEnableByAjax) {
      let $elem = $("#fadeloadscreen");
      if ($elem.length > 0) {
        $("#fadeloadscreen").addClass("dn");
        this.LoaderEnableByAjax = false;
      }
    }
  }

  ShowLoader() {
    if (!this.LoaderEnableByAjax) {
      let $elem = $("#fadeloadscreen");
      if ($elem.length === 1) {
        $("#fadeloadscreen").removeClass("dn");
      }
    }
  }

  HideLoader() {
    if (!this.LoaderEnableByAjax) {
      let $elem = $("#fadeloadscreen");
      if ($elem.length > 0) {
        $("#fadeloadscreen").addClass("dn");
        this.LoaderEnableByAjax = false;
      }
    }
  }

  ShowToast(Message: string, TimeSpan: number = 5) {
    let $Toast = document.getElementById("toast");
    if ($Toast !== null && $Toast !== undefined) {
      $("#toastmessage").text(Message);
      $Toast.classList.remove("d-none");
      setTimeout(() => {
        HideToast();
      }, TimeSpan * 998);
    }
  }


  public ReadAutoCompleteValue($AutofillObject: any): any {
    let Data = null;
    if ($AutofillObject !== null) {
      if ($AutofillObject.find('input[name="iautofill-textfield"]') !== null) {
        Data = $AutofillObject.find('input[name="iautofill-textfield"]').val();
      }
    }
    return Data;
  }

  public ReadAutoCompleteObject($AutofillObject: any): any {
    let Data = null;
    if ($AutofillObject !== null) {
      if ($AutofillObject.find('input[name="iautofill-textfield"]') !== null) {
        let ParsedValue: any = {};
        let CurrentTypeData = $AutofillObject
          .find('input[name="iautofill-textfield"]')
          .attr("data");
        if (this.IsValidString(CurrentTypeData)) {
          ParsedValue["data"] = JSON.parse(CurrentTypeData);
          ParsedValue["value"] = $AutofillObject
            .find('input[name="iautofill-textfield"]')
            .val();
        }
        Data = ParsedValue;
      }
    }
    return Data;
  }

  LocateSection(ComponentId: string) {
    try {
      $("#main-scroller").animate(
        { scrollTop: $("#" + ComponentId).offset().top - 450 },
        "slow"
      );
    } catch (e) { }
  }

  AutoPlayEventManager(HighlightTag: Array<string>) {
    this.$ButtonId = "";
    switch (this.PageLevelCounter) {
      case 1:
        this.$ButtonId = "json-formatter";
        break;
      case 3:
        this.$ButtonId = "home-clicktogo";
        break;
      case 4:
        this.$ButtonId = "generate-new-custometable";
        break;
    }

    try {
      if (this.IsValidString(this.$ButtonId)) {
        if (this.IsValid(HighlightTag)) {
          setTimeout(() => {
            let index = 0;
            while (index < HighlightTag.length) {
              let offset = $("#" + HighlightTag[index]).offset();
              $("#bouncing_arrow").css({
                top: offset.top + "px",
                left: offset.left + "px"
              });
              $("#" + HighlightTag[index]).addClass("high-z-index");
              index++;
            }
            this.LocateSection(this.$ButtonId);
          }, 4000);
        }

        setTimeout(() => {
          let index = 0;
          while (index < HighlightTag.length) {
            $("#" + HighlightTag[index]).removeClass("high-z-index");
            index++;
          }
          if (
            this.$ButtonId !== null &&
            this.$ButtonId !== "" &&
            $("#" + this.$ButtonId).length > 0
          ) {
            $("#" + this.$ButtonId)[0].click();
          }
        }, this.DefaultTimeout);
      }
    } catch (e) {
      this.ShowToast("Gettring some error. Please try later.");
    }
  }

  GenerateMessage(Messages: any, Style: any) {
    let FinalTemplate = "";
    let root = document.documentElement;
    root.style.setProperty("--auto-play-frame-no", Messages.length);
    FinalTemplate += `<div class="typewriter-text">${Messages}</div>`;
    $("#pop-msg").empty();
    $("#pop-msg").append(FinalTemplate);
    $("#popmessanger").css(Style);
    $("#fadescreen").removeClass("d-none");
    $("#popmessanger").removeClass("d-none");
  }

  ManageArrow(ArrowId: string, Action: any) {
    if (Action) {
      $("#" + ArrowId).removeClass("d-none");
    }
  }

  OperateAutoPlay() {
    this.PageLevelCounter++;
    let ContentPosition = [
      {
        title: "home",
        style: { right: "310px", top: "370px" }
      },
      {
        title: "tablesampledata",
        style: { right: "310px", top: "170px" }
      }
    ];

    let Messages: any = [];
    Messages = AutoPlayMessages[this.PageLevelCounter - 1];
    if (this.IsValid(Messages)) {
      let NewStyle = {};
      let Style = ContentPosition.filter(x => x.title === this.CurrentPageName);
      if (Style.length > 0) {
        NewStyle = Style[0].style;
      }

      this.AutoPlayEventManager(Messages.highlight);
      this.ManageArrow("bouncing_arrow", true);
      this.GenerateMessage(Messages.message, NewStyle);
    }
  }

  InvalidField($elem: any) {
    $elem.addClass("invalid-field");
    setTimeout(() => {
      $elem.removeClass("invalid-field");
    }, 5000);
  }
}

export function ToFixed(amount: number, precision: number): number {
  let value = 0.0;
  let strValue = amount.toString();
  if(strValue.indexOf(".") === -1) {
    value = parseFloat(`${strValue}`);
  } else {
    value = parseFloat(strValue.slice(0, (strValue.indexOf("."))+3))
  }
  return value;
}

export function AddNumbers(data: Array<number>, precision: number): number {
  let value: number = 0;
  if(precision == 0) {
    let i = 0;
    while(i < data.length) {
      value += data[i] * 100;
      i++;
    }

    value = value / 100;
  } else {
    let i = 0;
    while(i < data.length) {
      value += ToFixed(data[i], precision) * 100;
      i++;
    }

    value = value / 100;
  }
  return value;
}

export function Toast(message: string, timeSpan: number = 5) {
  let $Toast = document.getElementById("toast");
  if ($Toast) {
    $Toast.classList.add("success-toast");
    document.getElementById("toastmessage").innerHTML = message;
    $Toast.classList.remove("d-none");
    setTimeout(() => {
      HideToast();
    }, timeSpan * 998);
  }
}

export function ErrorToast(message: string, timeSpan: number = 5) {
  let $Toast = document.getElementById("toast");
  if ($Toast) {
    $Toast.classList.add("error-toast");
    document.getElementById("toastmessage").innerHTML = message;
    $Toast.classList.remove("d-none");
    setTimeout(() => {
      HideToast();
    }, timeSpan * 998);
  }
}

export function WarningToast(message: string, timeSpan: number = 5) {
  let $Toast = document.getElementById("toast");
  if ($Toast) {
    $Toast.classList.add("warning-toast");
    document.getElementById("toastmessage").innerHTML = message;
    $Toast.classList.remove("d-none");
    setTimeout(() => {
      HideToast();
    }, timeSpan * 998);
  }
}

export function HideToast() {
  let $Toast = document.getElementById("toast");
  if ($Toast) {
    $Toast.classList.add("d-none");
    $Toast.classList.remove("error-toast", "success-toast", "warning-toast");
  }
}


export function PlaceEmpty(data: any) {
  if (data === 0)
    return null;
  return data;
}

export function MonthName(monthnumber: number): string {
  let monthName = "";
  if(monthnumber) {
    const date = new Date(2000, monthnumber - 1, 1);
    monthName = date.toLocaleString('default', { month: 'long' });
  }
  return monthName;
}

export function GetStatus(id: number): string {
  let status = "";
  switch(id) {
    case 1:
      status = "Completed";
      break;
    case 3:
      status = "Canceled";
      break;
    case 4:
      status = "Not Generated";
      break;
    case 5:
      status = "Rejected";
      break;
    case 6:
      status = "Raised";
      break;
    default:
      status = "Pending";
      break;
  }
  return status;
}

export class UserDetail {
  AccessToken: string = null;
  Address: string = null;
  City: string = null;
  CompanyName: string = null;
  CreatedOn: Date = null;
  Designation: string = null;
  Dob: Date = null;
  EmailId: string = null;
  FirstName: string = "User";
  LastName: string = "User";
  MediaName: string = null;
  Mobile: string = null;
  Password: string = null;
  RefreshToken: string = null;
  RoleUid: string = null;
  State: string = null;
  Token: string = null;
  TokenExpiryDuration: Date = null;
  UserId: number = null;
}
