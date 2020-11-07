import { Component } from '@angular/core';
import { WafService } from '../../service/waf.service';
import { WhitelistCandidates } from '../model/whitelist-candidates';
import { WafGenerateWhitelistConfig } from './waf-generate-whitelist-config';

@Component({
  selector: 'waf-generate-whitelist',
  styleUrls: [('./waf-generate-whitelist.component.scss')],
  templateUrl: './waf-generate-whitelist.component.html'
})
export class WafGenerateWhitelistComponent {

  static GENERATE_WHITELIST = 'generateWhitelist';

  modalHeader: string = 'Generate WAF Whitelist';
  modalContent: string;

  _config: WafGenerateWhitelistConfig;

  status = {
    inProgress: {
      generateWhitelist: false
    }
  };

  constructor(
              // private activeModal: NgbActiveModal,
              private wafService: WafService) {
  }

  set config(config: WafGenerateWhitelistConfig) {
    this._config = config;
    if (this._config.generateAnotherWhitelist) {
      this.modalContent = `<p>Would you like to generate whitelist candidates?</p>`;
    } else {
      this.modalContent = `<p>Your service does not have any whitelist generated yet.</p>
      <p>Would you like to generate a new whitelist candidates?</p>`;
    }
  }

  get config(): WafGenerateWhitelistConfig {
    return this._config;
  }

  generateWhitelist() {
    this.requestStarted(WafGenerateWhitelistComponent.GENERATE_WHITELIST);
    this.wafService.generateWhiteListCandidates(this.config.serviceInstance)
      .subscribe(
        whitelistCandidates => this.closeModal(whitelistCandidates),
        () => this.dismissModal());
  }

  closeModalWithEmptyWhitelistCandidates() {
    this.closeModal(this.emptyWhitelistCandidates());
  }

  private emptyWhitelistCandidates(): WhitelistCandidates {
    return {
      entries: [],
      serviceInstanceId: this.config.serviceInstance.id,
      tenantId: this.config.serviceInstance.tenantId,
      type: 'type'
    };
  }

  closeModal(whitelistCandidates: WhitelistCandidates) {
    // this.activeModal.close(whitelistCandidates);
  }

  dismissModal() {
    // this.activeModal.dismiss()
  }

  private requestStarted(action: string) {
    this.status.inProgress[action] = true;
  }
}
