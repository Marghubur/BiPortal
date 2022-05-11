import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

// import { SocialLoginModule, SocialAuthServiceConfig } from 'angularx-social-login';
// import {
//   GoogleLoginProvider
// } from 'angularx-social-login';

// Pipe
import { JoinString } from 'src/pipes/JoinString';

import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { CommonService } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';
import { MetaServices } from 'src/providers/MetaServices';
import { PageCache } from 'src/providers/PageCache';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FeedbacksComponent } from './feedbacks/feedbacks.component';
import { FooterComponent } from './footer/footer.component';
import { AppHttpIntercepter } from './../auth/app.intercepter';
import { JwtService } from './../auth/jwtService';
import { UserService } from './../providers/userService';
import { FullDateFormatter } from './../providers/FullDateFormatter';
import { UtilModule } from './util/util.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DateFormatter } from 'src/providers/DateFormatter';
import { LoginComponent } from './login/login.component';
import { LayoutModule } from './layout/layout.module';

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    FeedbacksComponent,
    JoinString,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    UtilModule,
    BrowserAnimationsModule,
    LayoutModule
  ],
  providers: [
    AjaxService,
    CommonService,
    ApplicationStorage,
    iNavigation,
    PageCache,
    JwtService,
    UserService,
    DateFormatter,
    FullDateFormatter,
    MetaServices,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AppHttpIntercepter,
      multi: true
    },
    // {
    //   provide: 'SocialAuthServiceConfig',
    //   useValue: {
    //     autoLogin: false,
    //     providers: [
    //       {
    //         id: GoogleLoginProvider.PROVIDER_ID,
    //         provider: new GoogleLoginProvider(
    //           '842843933399-o1h7driu2ebaaqtpib5jbcoqdt0v08vs.apps.googleusercontent.com'
    //         )
    //       }
    //     ]
    //   } as SocialAuthServiceConfig,
    // }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
