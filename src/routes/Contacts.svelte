<script lang="ts">
  import { navigate as goto } from "svelte-navigator";
  import { createKaiNavigator } from '../utils/navigation';
  import { onMount, onDestroy } from 'svelte';
  import { getDeviceContacts } from '../synchub/utils';
  import { ListView, TextInputDialog, LoadingBar } from '../components';

  export let location: any;
  export let navigate: any;
  export let getAppProp: Function;

  const chunkSize = 50;

  let loadingBar: LoadingBar;
  let contactSearchDialog: TextInputDialog;

  let contactDb: Array<any> = [];
  let searchInput: string = '';
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
      const navClasses = document.getElementsByClassName('contactsNav');
      if (navClasses[this.verticalNavIndex] != null) {
        navClasses[this.verticalNavIndex].click();
      }
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
    showLoadingBar();
    getDeviceContacts()
    .then((contacts) => {
      contactDb = [...contacts]
      for (let i = 0; i < contactDb.length; i += chunkSize) {
        const chunk = contactDb.slice(i, i + chunkSize);
        pages.push(chunk);
      }
      nextPage(pageCursor)
      //console.log(pages)
    })
    .catch(err => {
      console.warn(err)
    })
    .finally(() => {
      if (loadingBar != null) {
        loadingBar.$destroy();
      }
    });
    document.addEventListener('keydown', callButtonHandler);
  });

  onDestroy(() => {
    console.log('onDestroy', name);
    document.removeEventListener('keydown', callButtonHandler);
    navInstance.detachListener();
  });

  function showLoadingBar() {
    loadingBar = new LoadingBar({
      target: document.body,
      props: {
        onOpened: () => {
          navInstance.detachListener();
        },
        onClosed: () => {
          navInstance.attachListener();
          loadingBar = null;
        }
      }
    });
  }

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

  function callButtonHandler(evt) {
    if (evt.key === 'Call') {
      console.log('callButtonHandler', evt.key)
      openContactSearchDialog()
    }
  }

  function openContactSearchDialog() {
    contactSearchDialog = new TextInputDialog({
      target: document.body,
      props: {
        title: 'Search Contacs',
        softKeyLeftText: 'Cancel',
        softKeyCenterText: 'ok',
        value: searchInput,
        placeholder: 'Enter search keyword',
        type: 'text',
        onSoftkeyLeft: (evt, value) => {
          console.log('onSoftkeyLeft', value);
          contactSearchDialog.$destroy();
        },
        onSoftkeyRight: (evt, value) => {
          console.log('onSoftkeyRight', value);
        },
        onEnter: (evt, value) => {
          console.log('onEnter', value);
          searchContacts(value.trim());
          contactSearchDialog.$destroy();
        },
        onBackspace: (evt, value) => {
          console.log('onBackspace', value);
          evt.stopPropagation();
        },
        onOpened: () => {
          navInstance.detachListener();
        },
        onClosed: (value) => {
          console.log('onClosed', value)
          navInstance.attachListener();
          contactSearchDialog = null;
        }
      }
    });
  }

  function searchContacts(keyword) {
    searchInput = keyword ? keyword : '';
    if (searchInput) {
      pages = []
      console.log('search searchContacts', searchInput.length)
      const searchResult = contactDb.filter((user) => {
        const cmp = user.name[0].toLocaleLowerCase().indexOf(searchInput.toLocaleLowerCase());
        return cmp > -1;
      })
      console.log('searchResult', searchResult.length)
      pageCursor = -1;
      for (let i = 0; i < searchResult.length; i += chunkSize) {
        const chunk = searchResult.slice(i, i + chunkSize);
        pages.push(chunk);
      }
      nextPage(pageCursor)
    } else {
      pages = []
      console.log('reset searchContacts', searchInput.length)
      pageCursor = -1;
      for (let i = 0; i < contactDb.length; i += chunkSize) {
        const chunk = contactDb.slice(i, i + chunkSize);
        pages.push(chunk);
      }
      nextPage(pageCursor)
    }
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
