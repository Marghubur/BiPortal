import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { SocialLoginModule, SocialAuthServiceConfig } from 'angularx-social-login';
import {
  GoogleLoginProvider
} from 'angularx-social-login';

// Pipe
import { JoinString } from 'src/pipes/JoinString';

import { AjaxService } from 'src/providers/ajax.service';
import { ApplicationStorage } from 'src/providers/ApplicationStorage';
import { AppService } from 'src/providers/appservice';
import { AutoPlayService } from 'src/providers/AutoPlayService';
import { CommonService } from 'src/providers/common-service/common.service';
import { iNavigation } from 'src/providers/iNavigation';
import { MetaServices } from 'src/providers/MetaServices';
import { PageCache } from 'src/providers/PageCache';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CodegeneratorComponent } from './codegenerator/codegenerator.component';
import { FeedbacksComponent } from './feedbacks/feedbacks.component';
import { FooterComponent } from './footer/footer.component';
import { GeneratedresultComponent } from './generatedresult/generatedresult.component';
import { JsonFormatterComponent } from './json-formatter/json-formatter.component';
import { SamplepageComponent } from './samplepage/samplepage.component';
import { TabledsampledataComponent } from './tabledsampledata/tabledsampledata.component';
import { UploadscriptComponent } from './uploadscript/uploadscript.component';
import { UserprofileComponent } from './userprofile/userprofile.component';
import { AppHttpIntercepter } from './../auth/app.intercepter';
import { JwtService } from './../auth/jwtService';
import { UserService } from './../providers/userService';
import { FullDateFormatter } from './../providers/FullDateFormatter';
import { LiveurlComponent } from './liveurl/liveurl.component';
import { BuilderModule } from './builder/builder.module';
import { UtilModule } from './util/util.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from "./layout/layout.module";
import { DateFormatter } from 'src/providers/DateFormatter';

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    JsonFormatterComponent,
    TabledsampledataComponent,
    FeedbacksComponent,
    GeneratedresultComponent,
    JoinString,
    SamplepageComponent,
    UploadscriptComponent,
    UserprofileComponent,
    CodegeneratorComponent,
    LiveurlComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    RouterModule,
    LayoutModule,
    FormsModule,
    HttpClientModule,
    BuilderModule,
    UtilModule,
    BrowserAnimationsModule,
    SocialLoginModule
  ],
  providers: [
    AppService,
    AjaxService,
    CommonService,
    ApplicationStorage,
    iNavigation,
    PageCache,
    AutoPlayService,
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
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '842843933399-o1h7driu2ebaaqtpib5jbcoqdt0v08vs.apps.googleusercontent.com'
            )
          }
        ]
      } as SocialAuthServiceConfig,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
