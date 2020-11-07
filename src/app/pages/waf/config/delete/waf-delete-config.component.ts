import { Component } from '@angular/core';
import { ServiceInstance } from '../../model/service-instance';

@Component({
  selector: 'waf-delete-config',
  styleUrls: [('./waf-delete-config.component.scss')],
  templateUrl: './waf-delete-config.component.html'
})
export class WafDeleteConfigComponent {

  modalHeader: string = 'Delete WAF Configuration';
  modalContent: string;

  constructor(
    // private activeModal: NgbActiveModal
  ) {
  }

  set serviceInstance(serviceInstance: ServiceInstance) {
    this.modalContent = `Please confirm that you would like to remove WAF configuration for ${serviceInstance.name}.`;
  }

  dismissModal() {
    // this.activeModal.dismiss();
  }

  closeModal() {
    // this.activeModal.close();
  }
}
