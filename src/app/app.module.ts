import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { iNavigation } from 'src/providers/iNavigation';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppHttpIntercepter } from './../auth/app.intercepter';
import { JwtService } from './../auth/jwtService';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastComponent } from './page-components/toast/toast.component'
import { UserService } from 'src/providers/userService';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HomeModule } from './home/home.module';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { RegisterNewOrgComponent } from './register-new-org/register-new-org.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AjaxService } from 'src/providers/AjaxServices/ajax.service';

@NgModule({
  declarations: [
    AppComponent,
    ToastComponent,
    RegisterNewOrgComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HomeModule
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
