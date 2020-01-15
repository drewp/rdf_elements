import { LitElement, html, customElement, property } from "lit-element";

import { VersionedGraph } from "streamed-graph";
import { getStringValue } from "streamed-graph";
import { DataFactory } from "n3";
const { namedNode } = DataFactory;

@customElement("bigast-graph-value")
export class BigastGraphValue extends LitElement {
  @property({ type: Object })
  graph!: VersionedGraph;

  // this has got to go
  @property({ type: String }) graphSelector: string = "streamed-graph";

  @property({ type: String }) subj: string = "";
  @property({ type: String }) pred: string = "";

  @property({ type: String }) displayValue: string = "...";
  @property({ type: String }) missing: string = "(none)";

  @property({ type: String }) label: string = "";
  @property({ type: String }) numberAs: string = ""; // 'minutes'

  @property({ type: String }) valueClass: string = "";

  connectedCallback() {
    super.connectedCallback();
    const graphEl = this.parentElement!.ownerDocument!.querySelector(
      this.graphSelector
    );
    if (!graphEl) {
      return;
    }
    (graphEl.addEventListener as any)(
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
    let dv = getStringValue(
      this.graph.store,
      namedNode(this.subj),
      namedNode(this.pred),
      this.missing
    );
    if (dv == this.missing) {
      // wrong sometimes
      this.displayValue = dv;
      return;
    }
    if (this.numberAs == "minutes") {
      const mins = parseFloat(dv); // wrong- it shouldn't have become a string
      if (mins == 0) {
        dv = "0";
      } else if (mins == 1) {
        dv = "1 min";
      } else if (mins < 60) {
        dv = `${mins} mins`;
      } else {
        const hrs = Math.round(((mins / 60) * 10) / 10);
        dv = `${hrs} hours`;
      }
    } else if (this.numberAs == "degreeF") {
      this.valueClass = "tempF";
      dv = `${dv}℉`;
    } else if (this.numberAs == "watts") {
      dv = `${dv}W`;
    }

    this.displayValue = dv;
  }

  render() {
    return html`
      <style>
        :host {
          white-space: nowrap;
        }
        .tempF {
          color: pink;
          width: 4em;
          display: inline-block;
        }
      </style>
      ${this.label}:
      <span class="${this.valueClass}">${this.displayValue}</span>
    `;
  }
}
