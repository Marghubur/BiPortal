import { Component, OnInit } from "@angular/core";
declare var $:any;
import { iNavigation } from "src/providers/iNavigation";
import { GraphicsDb } from "src/providers/constants";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {
  isLoggedIn: boolean = false;
  isLoading: boolean = false;
  constructor(private nav: iNavigation) {}

  ngOnInit() {}

  showmodal() {
    $("#modal").modal("showmodal");
  }

  StartGraphicalDatabase() {
    this.nav.navigate(GraphicsDb, null);
  }

  click() {
    this.isLoading = !this.isLoading;
  }
}
