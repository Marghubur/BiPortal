import { HttpHeaders, HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { JwtService } from "./jwtService";
import { Observable } from "rxjs/internal/Observable";
import { Injectable } from "@angular/core";
import { CommonService } from "src/providers/common-service/common.service";
import { finalize } from "rxjs";

@Injectable()
export class AppHttpIntercepter implements HttpInterceptor {

    constructor(private tokenHelper: JwtService,
                private common: CommonService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.common.isLoading.next(true);
        request = this.addToken(request);
        return next.handle(request).pipe(
          finalize(() => {
            this.common.isLoading.next(false);
          })
        );
    }

    addToken(request: HttpRequest<any>): HttpRequest<any> {
        if(request.url.toLowerCase().endsWith("authenticate")) {
            return request.clone({
                headers: new HttpHeaders({
                    "Authorization": `Bearer ${this.tokenHelper.getJwtToken()}`,
                    "companyCode": this.tokenHelper.getCompanyCode()
                })
            });
        } else if(request.url.toLowerCase().endsWith("forgotpassword")) {
          return request.clone({
              headers: new HttpHeaders({
                  "Authorization": `Bearer ${this.tokenHelper.getJwtToken()}`,
                  "companyCode": this.tokenHelper.getCompanyCode()
              })
          });
        } else {
          switch (request.method.toLocaleLowerCase()) {
            case "post":
              return request.clone({
                  headers: new HttpHeaders({
                      "Authorization": `Bearer ${this.tokenHelper.getJwtToken()}`
                  })
              });
            default:
              return request.clone({
                  headers: new HttpHeaders({
                      "Content-Type": "application/json; charset=utf-8",
                      "Accept": "application/json",
                      "Authorization": `Bearer ${this.tokenHelper.getJwtToken()}`
                  })
              });
          }
        }
    }
}
