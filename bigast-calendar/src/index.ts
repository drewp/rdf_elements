import { LitElement, html, customElement, property } from "lit-element";

import { VersionedGraph } from "streamed-graph";
import { getStringValue } from "streamed-graph";
import { DataFactory, NamedNode, N3Store } from "n3";
import { calendarFeeds } from "./private_feeds";
const { namedNode } = DataFactory;

@customElement("bigast-calendar")
export class BigastCalendar extends LitElement {
  @property({ type: Object })
  graph!: VersionedGraph;

  @property({ type: Array }) events: object[] = [];

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
  makeEvent(graph: N3Store, uri: NamedNode, today: any, now: number) {
    var ev: any = { uri: uri, shortEnd: "" };
    var isToday = false;

    graph.graph.quadStore.quads({ subject: ev.uri }, q2 => {
      if (q2.predicate.equals(namedNode("event:startDate"))) {
        isToday = q2.object.valueOf() === today;
      }
      if (q2.predicate.equals(namedNode("event:start"))) {
        ev.start = q2.object.valueOf();
        ev.allDay = !ev.start.match(/T/);
        ev.shortStart = moment(ev.start).format("H:mm");
      }
      if (q2.predicate.equals(namedNode("event:end"))) {
        ev.end = q2.object.valueOf();
        ev.shortEnd = moment(ev.end).format("-H:mm");
      }
      if (q2.predicate.equals(namedNode("event:title"))) {
        ev.title = q2.object.valueOf();
      }
      if (q2.predicate.equals(namedNode("event:feed"))) {
        ev.feed = q2.object.valueOf();
      }
    });
    if (!isToday) {
      return null;
    }
    if (ev.allDay) {
      ev.shortStart = ev.shortEnd = "";
    }
    ev.passed = ev.end < now;
    ev.cls =
      "event " + (ev.passed ? "passed " : "") + (ev.allDay ? "allDay" : "");

    for (let row of calendarFeeds) {
      if (ev.feed == row.url) {
        ev.cls += " feed-" + row.id;
      }
    }

    return ev;
  }

  getEvents(graph) {
    var env = graph.graph.store.rdf;
    var today = moment().format("YYYY-MM-DD");
    var now = moment().format();
    var events = [];
    graph.graph.quadStore.quads(
      {
        predicate: namedNode("rdf:type"),
        object: namedNode("event:Event"),
      },
      quad => {
        var ev = this.makeEvent(env, graph, quad.subject, today, now);
        if (ev !== null) {
          events.push(ev);
        }
      }
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

  onGraphChange(graph) {
    if (!graph.graph) return;
    this.events = this.getEvents(graph);
  }

  onGraphVersionChanged(ev: CustomEvent) {
    if (ev.detail && ev.detail.graph) {
      this.graph = ev.detail.graph as VersionedGraph;
      this.onGraphChanged(this.graph);
    }
  }

  onGraphChanged(newGraph: VersionedGraph) {}

  render() {
    return html`
      <h1>Calendar</h1>
      <ul id="events">
        <template is="dom-repeat" items="{{events}}">
          <li class$="{{item.cls}}">
            <span class="time">{{item.shortStart}}{{item.shortEnd}}</span>
            {{item.title}}
          </li>
        </template>
      </ul>
    `;
  }
}
