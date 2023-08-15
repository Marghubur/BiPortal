import { Injectable } from "@angular/core";

@Injectable()
export class ServiceMapper {
    public MapService(route: string): string {
        let controller = "";
        switch(controller) {
            case "employee":
            case "client":
                route = route.replace("dn/core", "dn/employee-service");
            case "leave":
                route = route.replace("dn/core", "dn/leave-service");
        }

        return route;
    }
}