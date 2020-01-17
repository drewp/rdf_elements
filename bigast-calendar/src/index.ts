import {
  LitElement,
  html,
  customElement,
  property,
  unsafeCSS,
} from "lit-element";

import { VersionedGraph } from "streamed-graph";
import { DataFactory, NamedNode, N3Store, Util, Term } from "n3";
import { calendarFeeds } from "./private_feeds";

import moment from "moment";
import { Moment } from "moment";

const { namedNode } = DataFactory;
import style from "./style.styl";

interface CalEvent {
  uri: NamedNode;
  shortStart: string;
  shortEnd: string;
  start: string;
  end: string;
  title: string;
  feed: string;
  allDay: boolean;
  passed: boolean;
  cls: string;
}

// haven't figured out rdfjs prefixes system yet
// const prefixes: N3.Prefixes = { rdfs: N3.DataFactory.namedNode('http://www.w3.org/2000/01/rdf-schema#') };
// const namedNode1: RDF.NamedNode = N3Util.prefix('http://www.w3.org/2000/01/rdf-schema#')('label');
// const namedNode2: RDF.NamedNode = N3Util.prefixes(prefixes)('rdfs')('label');
// const namedNode3: N3.NamedNode = N3Util.prefixes(prefixes)('rdfs')('label');

const expand = (tail: string) =>
  namedNode("http://bigasterisk.com/event#" + tail.replace(/^event:/, ""));

const RDF = { type: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" };

@customElement("bigast-calendar")
export class BigastCalendar extends LitElement {
  static get styles() {
    return unsafeCSS(style);
  }

  @property({ type: Object })
  graph!: VersionedGraph;

  @property({ type: Array }) events: CalEvent[] = [];

  // this has got to go
  @property({ type: String }) graphSelector: string = "streamed-graph";

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

  makeEvent(
    graph: N3Store,
    uri: NamedNode,
    today: string,
    now: Moment
  ): CalEvent | undefined {
    let isToday = false,
      start = "",
      allDay = false,
      shortStart = "",
      shortEnd = "",
      end = "",
      title = "",
      feed = "",
      passed = false,
      cls = "";
    let sd;
    graph.forEach(
      q2 => {
        if (q2.predicate.equals(expand("event:startDate"))) {
          sd = q2.object.value;
          isToday = q2.object.value == today;
        }
        if (q2.predicate.equals(expand("event:start"))) {
          start = q2.object.value;
          allDay = !start.match(/T/);
          shortStart = moment(start).format("H:mm");
        }
        if (q2.predicate.equals(expand("event:end"))) {
          end = q2.object.value;
          shortEnd = moment(end).format("-H:mm");
        }
        if (q2.predicate.equals(expand("event:title"))) {
          title = q2.object.value;
        }
        if (q2.predicate.equals(expand("event:feed"))) {
          feed = q2.object.value;
        }
      },
      uri,
      null,
      null,
      null
    );
    if (!isToday) {
      return undefined;
    }
    if (allDay) {
      shortStart = shortEnd = "";
    }
    passed = moment(end).isBefore(now);
    cls = "event " + (passed ? "passed " : "") + (allDay ? "allDay" : "");

    for (let row of calendarFeeds) {
      if (feed == row.url) {
        cls += " feed-" + row.id;
      }
    }

    return {
      uri,
      shortStart,
      shortEnd,
      start,
      end,
      title,
      feed,
      allDay,
      passed,
      cls,
    };
  }

  getEvents(graph: N3Store) {
    const now = moment();
    const today = now.format("YYYY-MM-DD");
    const events: CalEvent[] = [];

    graph.forSubjects(
      // waiting for fix in https://github.com/DefinitelyTyped/DefinitelyTyped/pull/41670
      (subj: any) => {
        if (Util.isNamedNode(subj)) {
          const ev = this.makeEvent(graph, subj as NamedNode, today, now);
          if (ev !== undefined) {
            events.push(ev);
          }
        }
      },
      namedNode(RDF.type),
      expand("event:Event"),
      null
    );
    events.sort((a, b) => {
      if (a.start > b.start) {
        return 1;
      }
      if (a.start < b.start) {
        return -1;
      }
      return 0;
    });
    return events;
  }

  onGraphChange(graph: N3Store) {
    this.events = this.getEvents(graph);
  }

  onGraphVersionChanged(ev: CustomEvent) {
    if (ev.detail && ev.detail.graph) {
      this.graph = ev.detail.graph as VersionedGraph;
      this.onGraphChange(this.graph.store);
    }
  }

  render() {
    const renderEvent = (ev: CalEvent) => {
      return html`
        <li class="${ev.cls}">
          <span class="time">${ev.shortStart}${ev.shortEnd}</span>
          ${ev.title}
        </li>
      `;
    };
    return html`
      <h1>Calendar</h1>
      <ul id="events">
        ${this.events.map(renderEvent)}
      </ul>
    `;
  }
}
