<script lang="ts">
  import { navigate as goto } from "svelte-navigator";
  import { createKaiNavigator } from '../utils/navigation';
  import { onMount, onDestroy } from 'svelte';
  import * as localforage from 'localforage';
  import { ListView, Dialog } from '../components';

  export let location: any;
  export let navigate: any;
  export let getAppProp: Function;

  let eventList: any = [];
  let dialog: Dialog;
  let name: string = 'Events';

  let navOptions = {
    verticalNavClass: 'eventsNav',
    softkeyLeftListener: function(evt) {},
    softkeyRightListener: function(evt) {
      if (eventList[this.verticalNavIndex] != null) {
        if (eventList[this.verticalNavIndex]['_editable'] == true) {
          const ID = eventList[this.verticalNavIndex].id;
          const EVENTS = localforage.createInstance({ name : "EVENTS" })
          EVENTS.getItem('local')
          .then((evts) => {
            if (evts == null) {
              evts = [];
            }
            const idx = evts.findIndex((evt) => evt.id === ID);
            if (idx > -1) {
              evts.splice(idx, 1);
              EVENTS.setItem('local', evts)
              .then(() => {
                setTimeout(() => {
                  this.navigateListNav(-1);
                }, 500);
                loadEvents();
              })
              .catch((err) => {
                console.log(err);
              });
            }
          })
          .catch((err) => {
            console.log(err);
          });
        } else {
          showDialog("Warning", 'Please use Google Calendar to delete this event');
        }
      }
    },
    enterListener: function(evt) {
      const navClasses = document.getElementsByClassName('eventsNav');
      if (navClasses[this.verticalNavIndex] != null) {
        navClasses[this.verticalNavIndex].click();
      }
    },
    backspaceListener: function(evt) {
      evt.preventDefault();
      goto(-1);
    }
  };

  let navInstance = createKaiNavigator(navOptions);

  onMount(() => {
    const { appBar, softwareKey } = getAppProp();
    appBar.setTitleText(name);
    softwareKey.setText({ left: '', center: 'VIEW', right: 'Delete' });
    navInstance.attachListener();
    loadEvents();
    // TODO sort eventList by start.date or dateTime asc
  });

  onDestroy(() => {
    navInstance.detachListener();
  });

  async function loadEvents() {
    eventList = [];
    const EVENTS = localforage.createInstance({ name : "EVENTS" })
    const keys: Array<string> = await EVENTS.keys();
    for (var x in keys) {
      const key = keys[x];
      const evts = await EVENTS.getItem(key);
      if (evts == null)
        continue;
      evts.forEach(evt => {
        evt['_editable'] = key == 'local';
      });
      eventList = [...eventList, ...evts];
    }
  }

  function showDialog(title, body) {
    setTimeout(() => {
      dialog = new Dialog({
        target: document.body,
        props: {
          title: title,
          body: body,
          softKeyCenterText: 'hide',
          onSoftkeyLeft: (evt) => {},
          onSoftkeyRight: (evt) => {},
          onEnter: (evt) => {
            dialog.$destroy();
          },
          onBackspace: (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            dialog.$destroy();
          },
          onOpened: () => {
            navInstance.detachListener();
          },
          onClosed: () => {
            navInstance.attachListener();
            dialog = null;
          }
        }
      });
    }, 100);
  }

  function onSelect(evt) {
    // TODO show short event summary
    console.log(evt.summary || '(No title)', evt.description || '(No description)', evt.start.date || new Date(evt.start.dateTime).toLocaleString(), evt.end.date || new Date(evt.end.dateTime).toLocaleString());
  }

</script>

<main id="events-screen" data-pad-top="28" data-pad-bottom="30">
  {#each eventList as event}
  <ListView className="eventsNav" title="{event.summary || '(No title)'}" subtitle="{event.start.date || new Date(event.start.dateTime).toLocaleString()}" onClick={() => onSelect(event)}>
    <span slot="rightWidget" class="{ event._editable ? 'kai-icon-checkbox-unchecked' : 'kai-icon-checkbox-checked'}"></span>
  </ListView>
  {/each}
</main>

<style>
  #events-screen {
    overflow: scroll;
    width: 100%;
  }
</style>
