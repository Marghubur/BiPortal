import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AjaxService } from 'src/providers/ajax.service';
import { iNavigation } from 'src/providers/iNavigation';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppHttpIntercepter } from './../auth/app.intercepter';
import { JwtService } from './../auth/jwtService';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastComponent } from './toast/toast.component'
import { LayoutModule } from "./layout/layout.module"
import { UserService } from 'src/providers/userService';
import { NgChartsModule } from 'ng2-charts';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HomeModule } from './home/home.module';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';

@NgModule({
  declarations: [
    AppComponent,
    ToastComponent,
    // InitialpageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    HttpClientModule,
    BrowserAnimationsModule,
    // NgChartsModule,
    // NgbModule,
    // FormsModule,
    // ReactiveFormsModule,
    HomeModule
    // LayoutModule
  ],
  providers: [
    AjaxService,
    iNavigation,
    JwtService,
    ApplicationStorage,
    UserService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AppHttpIntercepter,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(){
    console.log("App module loaded");
  }
 }
