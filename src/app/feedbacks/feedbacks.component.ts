import { ApplicationStorage } from "./../../providers/ApplicationStorage";
import { AjaxService } from "src/providers/AjaxServices/ajax.service";
import { CommonService, UserDetail } from "./../../providers/common-service/common.service";
import { FormControl } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { Component, OnInit } from "@angular/core";
import { UserService } from "src/providers/userService";
import { ResponseModel } from "src/auth/jwtService";
declare var $: any;

@Component({
  selector: "app-feedbacks",
  templateUrl: "./feedbacks.component.html",
  styleUrls: ["./feedbacks.component.scss"]
})
export class FeedbacksComponent implements OnInit {
  CommentsData: Array<any> = [];
  // FeedbackForm: FormGroup;
  IsCommentReady: boolean = false;
  constructor(
    private userService: UserService,
    private commonService: CommonService,
    private http: CoreHttpService,
    private storage: ApplicationStorage
  ) {
    this.GetRecentComments();
    // this.FeedbackForm = new FormGroup({
    //   TITLE: new FormControl(""),
    //   Comments: new FormControl(""),
    //   CommentsUid: new FormControl(""),
    //   Email: new FormControl(""),
    //   Company: new FormControl(""),
    //   UserName: new FormControl(""),
    //   CreatedOn: new FormControl("")
    // });
  }

  ngOnInit() { }

  GetRecentComments() {
    let userModel: UserDetail = this.userService.getInstance();
    let emailId = "zaid2292@gmail.com";
    this.http
      .get("ManageUserComments/GetComments?EmailId=", false)
      .then((result: ResponseModel) => {
        if (this.commonService.IsValid(result.ResponseBody)) {
          if (
            typeof result.ResponseBody["Comments"] !== "undefined"
          ) {
            this.IsCommentReady = true;
            this.CommentsData = result.ResponseBody["Comments"];
          }
        } else {
          this.commonService.ShowToast("Not able to fetch recent comments");
        }
      })
      .catch(e => {
        this.commonService.ShowToast("Not able to fetch recent comments");
      });
  }

  ReplyThisComment() { }

  EnableAreaColor(event: any) {
    $(event).removeClass("text-muted");
    $(event).removeClass("invalid-field");
  }

  RemoveInvalidLines(event: any) {
    $(event).removeClass("invalid-field");
  }

  DisableAreaColor(event: any) {
    if (
      $(event)
        .text()
        .trim().length === 0
    ) {
      $(event).addClass("text-muted");
    }
  }

  SubmitCommetform() {
    let InValidField: Array<string> = [];
    // if (this.FeedbackForm.value["Comments"] === "") {
    //   InValidField.push("comments");
    // }

    // if (this.FeedbackForm.value["UserName"] === "") {
    //   InValidField.push("username");
    // }

    if (InValidField.length > 0) {
      let index = 0;
      while (index < InValidField.length) {
        $("#" + InValidField[index]).addClass("error-field");
        index++;
      }
      this.commonService.ShowToast("All (*) marked filed is mandatory.");
      setTimeout(() => {
        $('#comments').removeClass('error-field')
        $('#username').removeClass('error-field')
      }, 10 * 1000);
    } else {
      // this.http
      //   .post("PostUserComments", this.FeedbackForm.value)
      //   .then(result => {
      //     if (this.commonService.IsValid(result)) {
      //       if (this.commonService.IsValid(result)) {
      //         if (typeof result["Table"] !== "undefined") {
      //           this.IsCommentReady = true;
      //           this.CommentsData = result["Table"];
      //         }
      //         this.commonService.ShowToast(
      //           "Your comments submittedt successfully."
      //         );
      //         this.CleanUpForm();
      //       } else {
      //         this.commonService.ShowToast("Not able to fetch recent comments");
      //       }
      //     } else {
      //       this.commonService.ShowToast("Unable to post your comments now.");
      //     }
      //   })
      //   .catch(e => {
      //     this.commonService.ShowToast("Unable to post your comments now.");
      //   });
    }
  }

  CleanUpForm() {
    $("#title").val("");
    $("#comments").val("");
    $("#email").val("");
    $("#company").val("");
    $("#username").val("");
  }
}
