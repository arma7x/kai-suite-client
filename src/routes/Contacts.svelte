<script lang="ts">
  import { navigate as goto } from "svelte-navigator";
  import { createKaiNavigator } from '../utils/navigation';
  import { onMount, onDestroy } from 'svelte';
  import { getDeviceContacts } from '../synchub/utils';
  import { ListView } from '../components';

  export let location: any;
  export let navigate: any;
  export let getAppProp: Function;

  let name: string = 'Phonebook';
  let pageCursor: int = -1;
  let pages: Array<any> = [];
  let contactList: Array<any> = [];

  let navOptions = {
    verticalNavClass: 'contactsNav',
    softkeyLeftListener: function(evt) {
      console.log('softkeyLeftListener', name);
      prevPage(pageCursor)
    },
    softkeyRightListener: function(evt) {
      console.log('softkeyRightListener', name);
      nextPage(pageCursor)
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
    softwareKey.setText({ left: `Prev`, center: `SELECT`, right: `Next` });
    navInstance.attachListener();
    getDeviceContacts()
    .then((contacts) => {
      const chunkSize = 50;
      for (let i = 0; i < contacts.length; i += chunkSize) {
        const chunk = contacts.slice(i, i + chunkSize);
        pages.push(chunk);
      }
      console.log(pages)
      nextPage(pageCursor)
    })
    .catch(err => {
      console.warn(err)
    });
  });

  onDestroy(() => {
    console.log('onDestroy', name);
    navInstance.detachListener();
  });

  function prevPage(p) {
    if (pages[p - 1] != null) {
      navInstance.verticalNavIndex = -1
      pageCursor = p - 1;
      contactList = []
      setTimeout(() => {
        contactList = pages[pageCursor]
        setTimeout(() => {
          navInstance.navigateListNav(1);
        }, 200)
      }, 100)
      //console.log(pageCursor, contactList)
    }
  }

  function nextPage(p) {
    if (pages[p + 1] != null) {
      navInstance.verticalNavIndex = -1
      pageCursor = p + 1;
      contactList = []
      setTimeout(() => {
        contactList = pages[pageCursor]
        setTimeout(() => {
          navInstance.navigateListNav(1);
        }, 200)
      }, 100)
      //console.log(pageCursor, contactList)
    }
  }

  function select(user) {
    console.log(user)
  }

</script>

<main id="phonebook-screen" data-pad-top="28" data-pad-bottom="30">
  {#each contactList as user}
  <ListView className="contactsNav" title="{user.name[0]}" subtitle="{user.tel[0].value}" onClick={() => select(user)}/>
  {/each}
</main>

<style>
  #phonebook-screen {
    overflow: scroll;
    width: 100%;
  }
</style>
