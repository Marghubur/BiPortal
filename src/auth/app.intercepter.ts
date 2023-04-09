import { HttpHeaders, HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { JwtService } from "./jwtService";
import { Observable } from "rxjs/internal/Observable";
import { Injectable } from "@angular/core";

@Injectable()
export class AppHttpIntercepter implements HttpInterceptor {

    constructor(private tokenHelper: JwtService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        request = this.addToken(request);
        return next.handle(request);
    }

    addToken(request: HttpRequest<any>): HttpRequest<any> {
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
