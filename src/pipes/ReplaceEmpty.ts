import { CommonService } from "../providers/common-service/common.service";
import { PipeTransform, Pipe } from "@angular/core";

@Pipe({ name: "replaceempty" })
export class ReplaceEmpty implements PipeTransform {
  constructor(private commonService: CommonService) {}
  transform(secontPart: string, firstPart: string): string {
    let NewName = "";
    if (firstPart === null || firstPart === "") {
      NewName = secontPart;
    } else {
        NewName = firstPart;
    }
    return NewName;
  }
}
