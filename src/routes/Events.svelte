<script lang="ts">
  import { navigate as goto } from "svelte-navigator";
  import { createKaiNavigator } from '../utils/navigation';
  import { onMount, onDestroy } from 'svelte';

  export let location: any;
  export let navigate: any;
  export let getAppProp: Function;

  let name: string = 'Events';

  let navOptions = {
    verticalNavClass: 'vertClass',
    horizontalNavClass: 'horzClass',
    softkeyLeftListener: function(evt) {
      console.log('softkeyLeftListener', name);
    },
    softkeyRightListener: function(evt) {
      console.log('softkeyRightListener', name);
    },
    enterListener: function(evt) {
      console.log('enterListener', name);
    },
    backspaceListener: function(evt) {
      console.log('backspaceListener', name);
      evt.preventDefault();
      goto(-1);
    }
  };

  let navInstance = createKaiNavigator(navOptions);

  onMount(() => {
    console.log('onMount', name);
    const { appBar, softwareKey } = getAppProp();
    appBar.setTitleText(name);
    softwareKey.setText({ left: `${name} L`, center: `${name} C`, right: `${name} R` });
    navInstance.attachListener();
  });

  onDestroy(() => {
    console.log('onDestroy', name);
    navInstance.detachListener();
  });

</script>

<main id="events-screen" data-pad-top="28" data-pad-bottom="30">
  <h1>Hello {name}!</h1>
  <div class="vertical">
    <div class="vertClass">Vertical 1</div>
    <div class="vertClass">Vertical 2</div>
  </div>
  <div class="horizontal">
    <div style="flex:1;" class="horzClass">Horizontal 1</div>
    <div style="flex:1;" class="horzClass">Horizontal 2</div>
  </div>
</main>

<style>
  #events-screen {
    overflow: scroll;
    width: 100%;
  }
  #events-screen > .vertical {
    display:flex;
    flex-direction:column;
  }
  #events-screen > .horizontal {
    width:100%;
    display:flex;
    flex-direction:row;
  }
  :global(#events-screen > .vertical > .vertClass.focus),
  :global(#events-screen > .horizontal > .horzClass.focus) {
    background-color: red!important;
    color: #fff!important;
  }
</style>
