<script lang="ts">
  import { Router, Route, Link } from 'svelte-navigator';
  import { AppBar, SoftwareKey } from './components';
  import { Home, Contacts, Events, AddEventForm } from './routes';
  import { onMount, onDestroy } from 'svelte';
  import { Localization } from './utils/localization';
  import SyncHub from './synchub/hub';
  import * as localforage from 'localforage';

  export let localization = new Localization('en-US', 'langs');
  export let appBar;
  export let softwareKey;

  localforage.setDriver(localforage.INDEXEDDB);

  const hub = new SyncHub();

  export const getAppProp = () => {
    return {appBar, softwareKey, localization, hub};
  }

  onMount(() => {
    console.log('onMount', 'App');
  });

</script>

<Router>
  <div id="kai-status-bar"></div>
  <AppBar bind:this={appBar} />
  <main>
    <Route primary={false} path="index.html" let:location let:navigate>
      <svelte:component this="{Home}" {location} {navigate} {getAppProp}/>
    </Route>
    <Route path="contacts" let:location let:navigate>
      <svelte:component this="{Contacts}" {location} {navigate} {getAppProp}/>
    </Route>
    <Route path="events" let:location let:navigate>
      <svelte:component this="{Events}" {location} {navigate} {getAppProp}/>
    </Route>
    <Route path="addEventForm" let:location let:navigate>
      <svelte:component this="{AddEventForm}" {location} {navigate} {getAppProp}/>
    </Route>
  </main>
  <SoftwareKey bind:this={softwareKey} />
</Router>

<style>
  #kai-status-bar {
    height: 26px;
    width: 100%;
    background-color: var(--themeColor);
  }
  main {
    display: flex;
    top: 54px;
    margin: 0px;
    padding: 0px;
    position: fixed;
    text-align: center;
    width: 100%;
    height: calc(100% - 84px);
    overflow: scroll;
  }
  :global(._toastItem) {
    text-align: center!important;
  }
</style>
