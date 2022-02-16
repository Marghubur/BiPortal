import { Injectable } from "@angular/core";
import { Toast } from "src/providers/common-service/common.service";
import { AccessToken, AccessTokenExpiredOn, Master, NotFound, ServerError, Success, UnAuthorize } from "src/providers/constants";

@Injectable()
export class JwtService {
    getJwtToken() {
        let Token = localStorage.getItem(AccessToken);
        return Token;
    }

    setJwtToken(token: string, expiredOn: string) {
        localStorage.setItem(AccessTokenExpiredOn, expiredOn);
        if (token !== null && token !== "") {
            localStorage.setItem(AccessToken, token);
        }
    }

    setLoginDetail(data: any): Boolean {
        let res: LoginResponse = data as LoginResponse;
        let flag: Boolean = false;
        if(res !== undefined && res !== null) {
            if(res.Menu !== null && res.ReportColumnMapping !== null && res.UserDetail !== null) {
                this.removeJwtToken();
                this.setJwtToken(res.UserDetail["Token"], res.UserDetail["TokenExpiryDuration"]);
                localStorage.setItem(Master, JSON.stringify(res));
                flag = true;
            }
        }
        return flag;
    }

    removeJwtToken() {
        localStorage.removeItem(AccessToken);
        localStorage.removeItem(AccessTokenExpiredOn);
        localStorage.removeItem(Master);
    }
}

export function IsValidResponse(response: ResponseModel) {
    if (response !== null)
        return HandleResponseStatus(response.HttpStatusCode);
    else
        return false;
}

export function HandleResponseStatus(statusCode: number): boolean {
    let flag = false;
    switch (statusCode) {
        case Success:
            flag = true;
            break;
        case UnAuthorize:
            let token = localStorage.getItem("access_token");
            if(token !== null && token != "")
                document.getElementById("sessionexpiredBox").classList.remove('d-none');
            else
                localStorage.clear();
            Toast("Unauthorized access. Please login again.");
            break;
        case NotFound:
            Toast("Page not found. Please chech your Url.");
            break;
        case ServerError:
            Toast("Getting server error. Please contact to admin.");
            break;
        default:
            Toast("Unknown error occured. Please contact to admin.");
            break;
    }

    return flag;
}

export interface ResponseModel {
    AuthenticationToken: string;
    HttpStatusCode: number;
    HttpStatusMessage: string;
    ResponseBody: any;
}

export class LoginResponse {
    Menu: any = null;
    ReportColumnMapping: any = null;
    UserDetail: any = null;
}
