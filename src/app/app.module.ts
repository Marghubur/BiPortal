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
import { HomeComponent } from './home/home.component';
import { IautocompleteComponent } from './iautocomplete/iautocomplete.component';
import { JsonFormatterComponent } from './json-formatter/json-formatter.component';
import { LoginComponent } from './login/login.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SamplepageComponent } from './samplepage/samplepage.component';
import { TabledsampledataComponent } from './tabledsampledata/tabledsampledata.component';
import { UploadscriptComponent } from './uploadscript/uploadscript.component';
import { UserprofileComponent } from './userprofile/userprofile.component';
import { AppHttpIntercepter } from './../auth/app.intercepter';
import { JwtService } from './../auth/jwtService';
import { UserService } from './../providers/userService';
import { LiveurlComponent } from './liveurl/liveurl.component';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { AdminModule } from './admin/admin.module';
import { BuilderModule } from './builder/builder.module';
import { UtilModule } from './util/util.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BreadcrumsComponent } from './breadcrums/breadcrums.component';
import { NgChartsModule } from 'ng2-charts';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { SidemenuComponent } from './sidemenu/sidemenu.component';
import { PaginationComponent } from './pagination/pagination.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    JsonFormatterComponent,
    TabledsampledataComponent,
    HomeComponent,
    IautocompleteComponent,
    LoginComponent,
    FeedbacksComponent,
    GeneratedresultComponent,
    JoinString,
    SamplepageComponent,
    UploadscriptComponent,
    UserprofileComponent,
    CodegeneratorComponent,
    LiveurlComponent, 
    BreadcrumsComponent,
    SidemenuComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    RouterModule,
    FormsModule,
    HttpClientModule,
    NgxDocViewerModule,
    AdminModule,
    BuilderModule,
    UtilModule,
    BrowserAnimationsModule,
    SocialLoginModule,
    NgChartsModule,
    CarouselModule 
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
