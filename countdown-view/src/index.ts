import {
  LitElement,
  html,
  customElement,
  property,
  unsafeCSS,
  css,
} from "lit-element";
import { VersionedGraph } from "streamed-graph";
import style from "./style.styl";
import { DataFactory, Quad_Subject, N3Store } from "n3";
const { namedNode } = DataFactory;

import { Moment, Duration } from "moment";
import moment from "moment";

interface OutRow {
  startDate: string;
  title: string;
  fromNow: Duration;
}

// from https://use.fontawesome.com/releases/v5.12.0/fontawesome-free-5.12.0-web.zip file svgs/solid/sun.svg
// # Icons: CC BY 4.0 License (https://creativecommons.org/licenses/by/4.0/)
// In the Font Awesome Free download, the CC BY 4.0 license applies to all icons
// packaged as SVG and JS file types.
// https://github.com/FortAwesome/Font-Awesome/blob/master/LICENSE.txt
const fontAwesomeSolidSun = html`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path
      d="M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96zm246.4 80.5l-94.7-47.3 33.5-100.4c4.5-13.6-8.4-26.5-21.9-21.9l-100.4 33.5-47.4-94.8c-6.4-12.8-24.6-12.8-31 0l-47.3 94.7L92.7 70.8c-13.6-4.5-26.5 8.4-21.9 21.9l33.5 100.4-94.7 47.4c-12.8 6.4-12.8 24.6 0 31l94.7 47.3-33.5 100.5c-4.5 13.6 8.4 26.5 21.9 21.9l100.4-33.5 47.3 94.7c6.4 12.8 24.6 12.8 31 0l47.3-94.7 100.4 33.5c13.6 4.5 26.5-8.4 21.9-21.9l-33.5-100.4 94.7-47.3c13-6.5 13-24.7.2-31.1zm-155.9 106c-49.9 49.9-131.1 49.9-181 0-49.9-49.9-49.9-131.1 0-181 49.9-49.9 131.1-49.9 181 0 49.9 49.9 49.9 131.1 0 181z"
    />
  </svg>
`;

const expand = (tail: string) =>
  namedNode("http://bigasterisk.com/event#" + tail.replace(/^event:/, ""));

const RDF = { type: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" };

@customElement("countdown-view")
export class CountdownView extends LitElement {
  static get styles() {
    return [
      unsafeCSS(style),
      // svg styles don't work in stylus
      css`
        svg {
          height: 1.3em;
          ￼vertical-align: middle;
          ￼padding-right: 3px;
          fill: yellow;
        }
      `,
    ];
  }

  @property({ type: Object })
  graph!: VersionedGraph;

  // this has got to go
  @property({ type: String }) graphSelector: string = "streamed-graph";

  @property({ type: Array }) rows: OutRow[] = [];

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
      this.onGraphChange(this.graph.store);
    }
  }

  onGraphChange(graph: N3Store) {
    const events = this.graph.store.getSubjects(
      RDF.type,
      expand("CountdownEvent"),
      null
    );

    this.rows = [];
    const now: Moment = moment();

    events.forEach((ev: Quad_Subject) => {
      const startDates = this.graph.store.getObjects(
        ev,
        expand("event:startDate"),
        null
      );
      const titles = this.graph.store.getObjects(
        ev,
        expand("event:title"),
        null
      );
      if (startDates.length > 0 && titles.length > 0) {
        const startDate = startDates[0].value;
        const title = titles[0].value.replace(/\*\s*$/, "");
        const fromNow = moment.duration(moment(startDate).diff(now));
        this.rows.push({
          startDate,
          title,
          fromNow,
        } as OutRow);
      }
    });

    this.rows.sort((a, b) => {
      return a.fromNow.asMilliseconds() - b.fromNow.asMilliseconds();
    });
  }

  render() {
    const renderRow = (row: OutRow) => {
      const daysLeft = Math.floor(row.fromNow.asDays());
      const soonDays = [];
      if (daysLeft > 0 && daysLeft <= 5) {
        for (let i = 0; i < daysLeft; i++) {
          soonDays.push(fontAwesomeSolidSun);
        }
        soonDays.push(
          html`
            -
          `
        );
      }

      return html`
        <li>
          <span class="fromNow">in ${row.fromNow.humanize()} ${soonDays}</span>
          <span>${row.title}</span>
        </li>
      `;
    };
    return html`
      <div>
        Upcoming
        <ul>
          ${this.rows.map(renderRow)}
        </ul>
      </div>
      >
    `;
  }
}
