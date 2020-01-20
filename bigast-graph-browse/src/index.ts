import { PolymerElement, html } from "@polymer/polymer/polymer-element";
import { customElement, property, computed } from "@polymer/decorators";
import "@polymer/iron-ajax/iron-ajax.js";
import "@polymer/paper-radio-group/paper-radio-group.js";
import "@polymer/paper-radio-button/paper-radio-button.js";

export { StreamedGraph } from 'streamed-graph';
// import style from "./style.styl";

@customElement("bigast-graph-browse")
export class BigastGraphBrowse extends PolymerElement {
  // static get styles() {
  //   return style;
  // }

  @property({ type: String }) graphUrl = "";
  @property({ type: String }) graphUrlRequest = "";
  @property({ type: String }) eventsUrlRequest = "";
  @property({ type: String }) graphMode = "static";

  @property({ type: Array }) collectorGraphs: string[] = [];

  static get template() {
    return html`
    <style>
      paper-radio-group {display: flex; flex-direction: column; }
      paper-radio-button {
        flex-grow: 1; 
        display: flex;
      }
      paper-radio-button input  {
        flex-grow: 1;
      }
    </style>
    <p>Viewing ([[graphMode]]):</p>
    <paper-radio-group selected="{{graphMode}}">
      <paper-radio-button name="static">Graph from url: <input type="text" on-input="pickStatic" value="{{graphUrlRequest}}"></paper-radio-button>
      <paper-radio-button name="events">Events from url: <input type="text" value="{{eventsUrlRequest}}"></paper-radio-button>
    </paper-radio-group>

    <div>
      Available event streams from collector: 
      <iron-ajax auto url="/sse_collector/graph/" 
                  verbose="true" 
                  last-response="{{collectorGraphs}}"></iron-ajax>
      <template is="dom-repeat" items="[[collectorGraphs]]">
        <a href="#" on-click="stuffCollectorGraph">[[item.id]]</a> 
      </template>
    </div>
  
    <streamed-graph url="[[graphUrl]]"></streamed-graph>
    `;
  }

  pickStatic() {
    this.graphMode = "static";
  }
  stuffCollectorGraph(ev: Event, item: any) {
    ev.preventDefault();
    this.eventsUrlRequest = `/sse_collector/graph/${
      (ev as any).model.item.id
    }/events`;
    this.graphMode = "events";
  }
}
