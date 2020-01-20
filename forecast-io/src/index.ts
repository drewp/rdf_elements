import {
  LitElement,
  html,
  customElement,
  property,
  unsafeCSS,
} from "lit-element";
import style from "./style.styl";

@customElement("forecast-io")
export class ForecastIo extends LitElement {
  static get styles() {
    return unsafeCSS(style);
  }

  @property({ type: String }) src: string = "#";

  @property({ type: String }) lat: string = "0.000";
  @property({ type: String }) lon: string = "0.000";
  @property({ type: String }) cacheBuster: string = "";

  render() {
    return html`
      <iframe
        id="embedWeather"
        height="100%"
        src="https://forecast.io/embed/?ts=${this.cacheBuster}#lat=${this
          .lat}&lon=${this.lon}&color=#FFFFFF&text-color=#FFFFFF"
      ></iframe>
    `;
  }

  connectedCallback() {
    super.connectedCallback();

    this.refresh();
    setInterval(this.refresh.bind(this), 7200000);
  }
  refresh() {
    this.cacheBuster = "" + Date.now();
  }
}
