import { Component } from '@angular/core';

@Component({
  selector: 'ngx-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
    <span class="created-by">
      Created with ♥ by <b><a href="https://ionate.io" target="_blank">Ionate</a></b> 2020
    </span>
    <div class="socials">
      <a href="https://www.linkedin.com/company/ionate" target="_blank" class="ion ion-social-linkedin"></a>
    </div>
  `,
})
export class FooterComponent {
}
