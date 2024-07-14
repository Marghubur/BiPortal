import { Component, OnInit } from '@angular/core';
import { ErrorToast } from 'src/providers/common-service/common.service';
declare var $: any;

@Component({
  selector: 'app-decision-making',
  templateUrl: './decision-making.component.html',
  styleUrls: ['./decision-making.component.scss']
})
export class DecisionMakingComponent implements OnInit {
  isLoading: boolean = false;
  allUsers: Array<User> = [];
  user: User = {Name: '', Email: '', UserId: 0};
  question: Question = {CompanyName: '', IsPointType: false, MinPoint: 0, MaxPoint: 0, Question: '', UserName: ''};
  pointsRange: Array<number> = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  selectedQuestion: Question = {CompanyName: '', IsPointType: true, MinPoint: 0, MaxPoint: 8, Question: 'dsdsds', UserName: ''};
  answers: Array<Answer> = [];
  isAnswerSubmitte: boolean = false;
  currentUser: User = {Name: '', Email: '', UserId: 0};
  selectAnswer: any = null;
  isFlipped: boolean = false;
  dichotomousAnswer: {Yes: number, No: number, YesBar: number, NoBar: number} = {Yes: 0, No: 0, NoBar: 0, YesBar: 0};
  pointTypeAnwer:Array<{Key: number, Value: number, GraphHeight: number}> = [];

  ngOnInit(): void {
    this.answers.push({
      CompanyName: this.selectedQuestion.CompanyName,
      Question: this.selectedQuestion.Question,
      UserName: this.currentUser.Name,
      IsCorrect: false,
      Point: 0
    }, {
      CompanyName: this.selectedQuestion.CompanyName,
      Question: this.selectedQuestion.Question,
      UserName: this.currentUser.Name,
      IsCorrect: false,
      Point: 1
    }, {
      CompanyName: this.selectedQuestion.CompanyName,
      Question: this.selectedQuestion.Question,
      UserName: this.currentUser.Name,
      IsCorrect: false,
      Point: 2
    }, {
      CompanyName: this.selectedQuestion.CompanyName,
      Question: this.selectedQuestion.Question,
      UserName: this.currentUser.Name,
      IsCorrect: false,
      Point: 3
    }, {
      CompanyName: this.selectedQuestion.CompanyName,
      Question: this.selectedQuestion.Question,
      UserName: this.currentUser.Name,
      IsCorrect: false,
      Point: 4
    }, {
      CompanyName: this.selectedQuestion.CompanyName,
      Question: this.selectedQuestion.Question,
      UserName: this.currentUser.Name,
      IsCorrect: true,
      Point: 5
    }, {
      CompanyName: this.selectedQuestion.CompanyName,
      Question: this.selectedQuestion.Question,
      UserName: this.currentUser.Name,
      IsCorrect: true,
      Point: 6
    }, {
      CompanyName: this.selectedQuestion.CompanyName,
      Question: this.selectedQuestion.Question,
      UserName: this.currentUser.Name,
      IsCorrect: true,
      Point: 7
    }, {
      CompanyName: this.selectedQuestion.CompanyName,
      Question: this.selectedQuestion.Question,
      UserName: this.currentUser.Name,
      IsCorrect: true,
      Point: 7
    }, {
      CompanyName: this.selectedQuestion.CompanyName,
      Question: this.selectedQuestion.Question,
      UserName: this.currentUser.Name,
      IsCorrect: true,
      Point: 8
    }, {
      CompanyName: this.selectedQuestion.CompanyName,
      Question: this.selectedQuestion.Question,
      UserName: this.currentUser.Name,
      IsCorrect: false,
      Point: 8
    }, {
      CompanyName: this.selectedQuestion.CompanyName,
      Question: this.selectedQuestion.Question,
      UserName: this.currentUser.Name,
      IsCorrect: false,
      Point: 8
    }, {
      CompanyName: this.selectedQuestion.CompanyName,
      Question: this.selectedQuestion.Question,
      UserName: this.currentUser.Name,
      IsCorrect: false,
      Point: 1
    }, {
      CompanyName: this.selectedQuestion.CompanyName,
      Question: this.selectedQuestion.Question,
      UserName: this.currentUser.Name,
      IsCorrect: false,
      Point: 1
    }, {
      CompanyName: this.selectedQuestion.CompanyName,
      Question: this.selectedQuestion.Question,
      UserName: this.currentUser.Name,
      IsCorrect: false,
      Point: 5
    }, {
      CompanyName: this.selectedQuestion.CompanyName,
      Question: this.selectedQuestion.Question,
      UserName: this.currentUser.Name,
      IsCorrect: false,
      Point: 5
    }, {
      CompanyName: this.selectedQuestion.CompanyName,
      Question: this.selectedQuestion.Question,
      UserName: this.currentUser.Name,
      IsCorrect: false,
      Point: 5
    }, {
      CompanyName: this.selectedQuestion.CompanyName,
      Question: this.selectedQuestion.Question,
      UserName: this.currentUser.Name,
      IsCorrect: false,
      Point: 5
    }, {
      CompanyName: this.selectedQuestion.CompanyName,
      Question: this.selectedQuestion.Question,
      UserName: this.currentUser.Name,
      IsCorrect: false,
      Point: 5
    }, {
      CompanyName: this.selectedQuestion.CompanyName,
      Question: this.selectedQuestion.Question,
      UserName: this.currentUser.Name,
      IsCorrect: false,
      Point: 5
    }, {
      CompanyName: this.selectedQuestion.CompanyName,
      Question: this.selectedQuestion.Question,
      UserName: this.currentUser.Name,
      IsCorrect: false,
      Point: 5
    }, {
      CompanyName: this.selectedQuestion.CompanyName,
      Question: this.selectedQuestion.Question,
      UserName: this.currentUser.Name,
      IsCorrect: true,
      Point: 5
    })

  }

  calculateAnswerResponse() {
    this.dichotomousAnswer = {Yes: 0, No: 0, NoBar: 0, YesBar: 0};
    if (!this.selectedQuestion.IsPointType) {
      let yes = this.answers.filter(x => x.IsCorrect).length;
      let no = this.answers.filter(x => !x.IsCorrect).length;
      this.dichotomousAnswer = {
        No: no,
        Yes: yes,
        YesBar: (yes* 12)/this.answers.length,
        NoBar: (no* 12)/this.answers.length
      }
    } else {
      this.pointTypeAnwer = [];
      for (let i = 0; i <= this.selectedQuestion.MaxPoint; i++) {
       this.pointTypeAnwer.push({
        Key: i,
        Value: this.answers.filter(x => x.Point == i).length,
        GraphHeight: (this.answers.filter(x => x.Point == i).length /this.answers.length)  * 12
       })
      }
    }
  }

  addUserPopup() {
    this.user = {Name: '', Email: '', UserId: 0};
    $("#addDecisionMakerUserModal").modal('show');
  }

  addUser() {
    if (!this.user.Name) {
      ErrorToast("Please enter user name");
      return;
    }

    if (!this.user.Email) {
      ErrorToast("Please enter email");
      return;
    }

    if (!this.validateEmail(this.user.Email)) {
      ErrorToast("Please enter a valid email");
      return;
    }

    let userId = 1;
    if (this.allUsers.length > 0)
      userId = this.allUsers[this.allUsers.length - 1].UserId + 1;

    let elem = document.getElementById(`box${userId}`);
    elem.classList.remove('opacity-0');
    elem.innerText = this.user.Name;

    this.user.UserId = userId;
    this.allUsers.push(this.user);
    this.currentUser = this.user;
    $("#addDecisionMakerUserModal").modal('hide');
  }

  validateEmail(email: string): boolean {
    let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailPattern.test(email);
  }

  questionPopup() {
    this.question = {CompanyName: '', IsPointType: false, MinPoint: 0, MaxPoint: 0, Question: '', UserName: ''};
    this.question.UserName = this.currentUser.Email;
    $("#generateQuestionModal").modal('show');
  }

  addQuestion() {
    if (!this.question.CompanyName) {
      ErrorToast("Please enter company name");
      return;
    }

    if (!this.question.Question) {
      ErrorToast("Please enter question");
      return;
    }

    if (!this.question.UserName) {
      ErrorToast("Please enter user name");
      return;
    }

    if (this.question.IsPointType && this.question.MaxPoint == 0) {
      ErrorToast("Please select max point");
      return;
    }

    this.selectedQuestion = this.question;
    $("#generateQuestionModal").modal('hide');
  }

  saveAnswer() {
    if (this.selectAnswer >= 0 || this.selectAnswer == true || this.selectAnswer == false) {
      this.answers.push({
        CompanyName: this.selectedQuestion.CompanyName,
        UserName: this.currentUser.Name,
        Question: this.selectedQuestion.Question,
        Point: this.selectedQuestion.IsPointType ? this.selectAnswer : 0,
        IsCorrect: !this.selectedQuestion.IsPointType ? this.selectAnswer : null
      });
      this.isAnswerSubmitte = true;
    } else {
      ErrorToast("Please select your response");
    }
  }

  changeAnswer(e: any) {
    let value = e.target.value;
    if (!this.selectedQuestion.IsPointType)
      this.selectAnswer = value;
    else
      this.selectAnswer = Number(value);
  }

  viewAnswer() {
    this.isFlipped = !this.isFlipped;
    this.calculateAnswerResponse();
  }
}

interface User {
  UserId: number,
  Name: string,
  Email: string
}

interface Question {
  CompanyName: string,
  UserName: string,
  Question: string,
  IsPointType: boolean,
  MinPoint: number,
  MaxPoint: number
}

interface Answer {
  CompanyName: string,
  UserName: string,
  Question: string,
  Point: number,
  IsCorrect: boolean
}
