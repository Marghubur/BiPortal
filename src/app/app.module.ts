import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

// import { SocialLoginModule, SocialAuthServiceConfig } from 'angularx-social-login';
// import {
//   GoogleLoginProvider
// } from 'angularx-social-login';

// Pipe
import { AjaxService } from 'src/providers/ajax.service';
import { iNavigation } from 'src/providers/iNavigation';
import { MetaServices } from 'src/providers/MetaServices';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FooterComponent } from './footer/footer.component';
import { AppHttpIntercepter } from './../auth/app.intercepter';
import { JwtService } from './../auth/jwtService';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './login/login.component';
import { ToastComponent } from './toast/toast.component'
import { LayoutModule } from "./layout/layout.module"
import { UserService } from 'src/providers/userService';

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    ToastComponent,
    // FeedbacksComponent,
    // JoinString,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    // FormsModule,
    // ReactiveFormsModule,
    HttpClientModule,
    // UtilModule,
    BrowserAnimationsModule,
    LayoutModule
  ],
  providers: [
    AjaxService,
    // ApplicationStorage,
    iNavigation,
    // PageCache,
    JwtService,
    UserService,
    // DateFormatter,
    // FullDateFormatter,
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
