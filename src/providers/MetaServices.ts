import { Injectable } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";

@Injectable()
export class MetaServices {
  constructor(private title: Title, private meta: Meta) {}

  UpdateMeta(title: string, url: string, desc: string, keywords: string) {
    this.UpdateTitle(title);
    this.UpdateDescription(desc);
    this.UpdateOgUrl(url);
    this.UpdateSearchKeyword(keywords);
  }

  UpdateTitle(title: string) {
    this.title.setTitle(title);
  }

  UpdateOgUrl(url: string) {
    this.meta.updateTag({ name: "og:url", content: url });
  }

  UpdateDescription(desc: string) {
    this.meta.updateTag({ name: "description", content: desc });
  }

  UpdateSearchKeyword(keywords: string) {
    this.meta.updateTag({ name: "keyword", content: keywords });
  }
}
