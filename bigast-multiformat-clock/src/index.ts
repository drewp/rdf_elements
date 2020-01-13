import { LitElement, html, customElement, property } from "lit-element";

import { VersionedGraph } from "streamed-graph";
import { getStringValue } from "streamed-graph";
import { DataFactory } from "n3";
const { namedNode } = DataFactory;

import { DomBind } from "@polymer/polymer/lib/elements/dom-bind.js";
// for the web page
export { DomBind } from "@polymer/polymer/lib/elements/dom-bind.js";

@customElement("bigast-multiformat-clock")
export class BigastMultiformatClock extends LitElement {
  @property({ type: Object })
  graph!: VersionedGraph;

  @property({ type: String })
  format: string | undefined;

  @property({ type: String }) room_localDate: string = "";
  @property({ type: String }) room_localMonthDay: string = "";
  @property({ type: String }) room_localDayOfWeek: string = "";
  @property({ type: String }) room_localTimeToSecond: string = "";

  connectedCallback() {
    super.connectedCallback();
    const dombind = this.parentElement!.querySelector(
      "streamed-graph#envGraph"
    ) as DomBind;
    (dombind.addEventListener as any)(
      "graph-changed",
      this.onGraphVersionChanged.bind(this)
    );
  }

  onGraphVersionChanged(ev: CustomEvent) {
    if (ev.detail && ev.detail.graph) {
      this.graph = ev.detail.graph as VersionedGraph;
      this.onGraphChanged(this.graph);
    }
  }

  onGraphChanged(newGraph: VersionedGraph) {
    const subj = namedNode(
      "http://projects.bigasterisk.com/device/environment"
    );
    const room = "http://projects.bigasterisk.com/room/";
    this.room_localDate = getStringValue(
      this.graph.store,
      subj,
      namedNode(room + "localDate")
    );
    this.room_localMonthDay = getStringValue(
      this.graph.store,
      subj,
      namedNode(room + "localMonthDay")
    );
    this.room_localDayOfWeek = getStringValue(
      this.graph.store,
      subj,
      namedNode(room + "localDayOfWeek")
    );
    this.room_localTimeToSecond = getStringValue(
      this.graph.store,
      subj,
      namedNode(room + "localTimeToSecond")
    );
  }

  /**
   * Implement `render` to define a template for your element.
   */
  render() {
    if (this.format == "timeOfDay") {
      return html`
        ${this.room_localTimeToSecond}
      `;
    } else {
      return html`
        <div>${this.room_localDate}</div>
        <div>${this.room_localMonthDay}</div>
        <div>${this.room_localDayOfWeek}</div>
        <div>${this.room_localTimeToSecond}</div>
      `;
    }
  }
}
