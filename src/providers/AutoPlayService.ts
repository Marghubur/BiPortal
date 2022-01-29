import { CommonService } from "./common-service/common.service";
import { AutoPlayMessages, Home, JsonFormatter } from "./constants";
import { Injectable } from "@angular/core";
import { iNavigation } from "./iNavigation";
declare var $:any;

export const topleft = { left: "10%", top: "35%" };
export const topright = { right: "10%", top: "370px" };
export const bottomleft = { right: "10%", top: "370px" };
export const bottomright = { right: "10%", top: "370px" };
export const initial = { left: "10%", top: "25%" };

export const QUERY = [
  {
    message: "Click the bottom to format your json string.",
    focus: 'div[id="jsonformatter-dv"]',
    click: "json-formatter",
    goto: JsonFormatter,
    nextCmdOnSamePage: false,
    fillValues: []
  },
  {
    message:
      "Type your stringified json on left and will get parsed result on right screen.",
    focus: 'textarea[id="inputdata"]',
    click: "",
    goto: Home,
    nextCmdOnSamePage: false,
    fillValues: []
  },
  {
    message: "Click the bottom for sql sample data with customization.",
    focus: 'a[id="home-clicktogo"]',
    click: "home-clicktogo",
    goto: "",
    nextCmdOnSamePage: false,
    showPage: false,
    fillValues: []
  },
  {
    message: "Enter table name(s) in below input fields.",
    focus: 'input[name="dynamic-table-name"]',
    click: "",
    goto: "",
    nextCmdOnSamePage: true,
    showPage: true,
    fillValues: [
      {
        id: "tableNameContainer",
        find: 'input[name="dynamic-table-name"]',
        value: "UserDetail"
      }
    ]
  },
  {
    message: "Use [Add table] button to add more table(s).",
    focus: 'a[id="anc-addtable"]',
    click: "enableTableColumns",
    goto: "",
    nextCmdOnSamePage: true,
    fillValues: []
  },
  {
    message: "Now fill the column detail below.",
    focus: 'tbody[name="table-generater"] tr:nth-child(1)',
    click: "",
    goto: "",
    nextCmdOnSamePage: false,
    fillValues: [
      {
        id: "dynamic-grid-table",
        find: 'tbody[name="table-generater"] tr:eq(0) input[name="ColumnName"]',
        value: "UserName"
      },
      {
        id: "dynamic-grid-table",
        find:
          'tbody[name="table-generater"] tr:eq(0) input[name="iautofill-textfield"]',
        value: "varchar"
      },
      {
        id: "dynamic-grid-table",
        find:
          'tbody[name="table-generater"] tr:eq(0) input[name="autocomplete"]',
        value: "varchar"
      },
      {
        id: "dynamic-grid-table",
        find: 'tbody[name="table-generater"] tr:eq(0) input[name="Size"]',
        value: "50"
      }
    ]
  },
  {
    message:
      "Now select action type and press [Generate] button to get output.",
    focus: 'button[id="btn-generatescript"]',
    click: "",
    goto: "",
    nextCmdOnSamePage: false,
    fillValues: []
  }
];

interface AutoPlayTrackerDetail {
  availableQueries: number;
  runningCounter: number;
}

@Injectable()
export class AutoPlayService {
  private PageLevelCounter: number = 0;
  private DefaultTimeout: number = 5 * 1000;
  private $ButtonId: any = "";
  private IsAutoPlayEnabled: boolean = false;
  private CurrentPageName: string = Home;
  private $highlightDv: any;
  private left: number = 0;
  private top: number = 0;

  constructor(private nav: iNavigation, private common: CommonService) {}

  HideFadeScreen() {
    $("#fadescreen").addClass("d-none");
    $("#popmessanger").addClass("d-none");
  }

  StopAutoPlay() {
    this.ClearMessage();
    $("#fadescreen").addClass("d-none");
    $("#popmessanger").addClass("d-none");
    this.SetAutoPlayValue(false);
    if (localStorage.getItem("autoPlayQuery") !== null) {
      localStorage.removeItem("autoPlayQuery");
    }
  }

  InitQuery(): AutoPlayTrackerDetail {
    return {
      availableQueries: 0,
      runningCounter: 0
    };
  }

  RegisterQueryDetail() {
    let cmds = QUERY;
    let pageQuery: AutoPlayTrackerDetail = this.InitQuery();
    if (typeof cmds !== "undefined" && cmds !== null && cmds.length > 0) {
      let $cmdCount = cmds.length;
      pageQuery.availableQueries = $cmdCount;
      pageQuery.runningCounter = 0;
      localStorage.setItem("autoPlayQuery", JSON.stringify(pageQuery));
    }
  }

  GetCounter(): number {
    let runningCounter = -1;
    let autoPlay: any = localStorage.getItem("autoPlayQuery");
    if (autoPlay !== null) {
      let $storedDetail: AutoPlayTrackerDetail = this.InitQuery();
      $storedDetail = JSON.parse(autoPlay);
      runningCounter = $storedDetail.runningCounter;
    }
    return runningCounter;
  }

  IncrementCounter() {
    let autoPlay: any = localStorage.getItem("autoPlayQuery");
    if (autoPlay !== null) {
      let $storedDetail: AutoPlayTrackerDetail = this.InitQuery();
      $storedDetail = JSON.parse(autoPlay);
      let NewCounter = $storedDetail.runningCounter + 1;
      if (NewCounter < $storedDetail.availableQueries) {
        $storedDetail.runningCounter = NewCounter;
        localStorage.setItem("autoPlayQuery", JSON.stringify($storedDetail));
      } else {
        this.StopAutoPlay();
        console.log("Stop auto play");
        this.common.ShowToast("Stop auto play");
      }
    }
  }

  InitAutoPlay() {
    this.RegisterQueryDetail();
    this.StartAutoPlay();
  }

  NextStep() {
    setTimeout(() => {
      this.StartAutoPlay();
    }, 100);
  }

  StartAutoPlay() {
    this.$highlightDv = $("#highlight-dv");
    let cmds = QUERY;
    let CmdIndex = this.GetCounter();
    if (cmds !== null && cmds.length > 0 && CmdIndex !== -1) {
      let cmd = cmds[CmdIndex];
      setTimeout(() => {
        if (cmd.focus !== "") {
          let $elem = $.find(cmd.focus);
          if ($elem !== null) {
            $elem = $($elem);
            this.top = $elem.offset().top - 5;
            this.left = $elem.offset().left - 5;
            this.$highlightDv.css({
              "margin-top": this.top,
              "margin-left": this.left,
              width: $elem.outerWidth() + 10,
              height: $elem.outerHeight() + 10
            });
          }
        }
      }, 1000);
      this.GenerateMessage(cmd.message, initial);
      if (cmd.fillValues.length > 0) {
        this.BindFieldValues(cmd);
      }
      if (cmd.nextCmdOnSamePage) {
        if (cmd.click !== "") {
          this.ClickButton(cmd);
        } else {
          this.NextCmd();
        }
      } else if (cmd.click !== "") {
        this.ClickButton(cmd);
      } else if (cmd.goto !== "") {
        this.UrlNavigation(cmd.goto);
      } else {
        this.NextCmd();
      }
    } else {
      this.StopAutoPlay();
    }
  }

  BindFieldValues(cmd: any) {
    setTimeout(() => {
      let index = 0;
      while (index < cmd.fillValues.length) {
        if ($("#" + cmd.fillValues[index].id) !== null) {
          let Field = $("#" + cmd.fillValues[index].id).find(
            cmd.fillValues[index].find
          );
          Field.val(cmd.fillValues[index].value);
        }
        index++;
      }
    }, 2000);
  }

  NextCmd(NewWiitTime: number = 0) {
    let TimerDefaultTime = this.DefaultTimeout;
    if (NewWiitTime > 0) {
      TimerDefaultTime = NewWiitTime;
    }
    setTimeout(() => {
      this.IncrementCounter();
      this.StartAutoPlay();
    }, TimerDefaultTime);
  }

  UrlNavigation(PageName: any) {
    setTimeout(() => {
      this.ClearMessage();
      this.IncrementCounter();
      this.nav.navigate(PageName, null);
    }, this.DefaultTimeout);
  }

  ClickButton($cmd: any) {
    let $clickableAction = $("#" + $cmd.click);
    if ($clickableAction !== null) {
      setTimeout(() => {
        this.ClearMessage();
        this.IncrementCounter();
        $clickableAction[0].click();
        if ($cmd.nextCmdOnSamePage) this.StartAutoPlay();
      }, this.DefaultTimeout);
    }
  }

  ClearMessage() {
    $("#pop-msg").empty();
  }

  GenerateMessage(Messages: any, Style: any) {
    let FinalTemplate = "";
    let root = document.documentElement;
    root.style.setProperty("--auto-play-frame-no", Messages.length);
    FinalTemplate += `<div class="typewriter-text">${Messages}</div>`;
    this.ClearMessage();
    $("#pop-msg").append(FinalTemplate);
    $("#popmessanger").css(Style);
    $("#fadescreen").removeClass("d-none");
    $("#popmessanger").removeClass("d-none");
  }

  LocateSection(ComponentId: string) {
    try {
      $("#main-scroller").animate(
        { scrollTop: $("#" + ComponentId).offset().top - 450 },
        "slow"
      );
    } catch (e) {}
  }

  GetAutoPlayValue(): boolean {
    return this.IsAutoPlayEnabled;
  }

  SetAutoPlayValue(flag: boolean) {
    this.IsAutoPlayEnabled = flag;
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
      if (this.$ButtonId !== undefined && this.$ButtonId !== null) {
        if (HighlightTag !== undefined && HighlightTag !== null) {
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
      console.log("Gettring some error. Please try later.");
    }
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
    if (Messages !== null && Messages !== "") {
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
}
