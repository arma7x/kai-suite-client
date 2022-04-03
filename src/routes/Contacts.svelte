<script lang="ts">
  import '../utils/contact2vcard';
  import '../utils/setImmediate';
  import '../utils/l10n';
  import '../utils/text_normalizer';

  import { navigate as goto } from "svelte-navigator";
  import { createKaiNavigator } from '../utils/navigation';
  import { onMount, onDestroy } from 'svelte';
  import { getDeviceContacts } from '../synchub/utils';
  import { ListView, TextInputDialog, LoadingBar, Dialog, OptionMenu } from '../components';

  export let location: any;
  export let navigate: any;
  export let getAppProp: Function;

  const chunkSize = 50;

  let dialog: Dialog;
  let optionMenu: OptionMenu;
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
      showSearchDialog()
    },
    softkeyRightListener: function(evt) {
      console.log('softkeyRightListener', name);
      showOptionMenu()
    },
    arrowLeftListener: function(evt) {
      prevPage(pageCursor)
    },
    arrowRightListener: function(evt) {
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
    softwareKey.setText({ left: "Search", center: "SELECT", right: "Options" });
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

  function showDialog(title, body) {
    dialog = new Dialog({
      target: document.body,
      props: {
        title: title,
        body: body,
        softKeyCenterText: 'hide',
        onSoftkeyLeft: (evt) => {
          // console.log('onSoftkeyLeft');
        },
        onSoftkeyRight: (evt) => {
          // console.log('onSoftkeyRight');
        },
        onEnter: (evt) => {
          // console.log('onEnter');
          dialog.$destroy();
        },
        onBackspace: (evt) => {
          // console.log('onBackspace');
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
  }

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
        const { appBar } = getAppProp();
        appBar.setTitleText(`${name}(${pageCursor+1}/${pages.length})`);
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
        const { appBar } = getAppProp();
        appBar.setTitleText(`${name}(${pageCursor+1}/${pages.length})`);
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
    const user = pages[pageCursor][navInstance.verticalNavIndex]
    if (evt.key === 'Call' && user != null) {
      console.log('callButtonHandler', evt.key, pageCursor, navInstance.verticalNavIndex)
      call(user)
    }
  }

  function showSearchDialog() {
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

  function showOptionMenu() {
    const user = pages[pageCursor][navInstance.verticalNavIndex]
    let opts = [
      { title: 'Edit[TODO]', subtitle: null },
      { title: 'Call', subtitle: null },
      { title: 'Send Message', subtitle: null },
      { title: 'Share', subtitle: null },
      { title: 'Delete[TODO]', subtitle: null },
    ]
    if (user == null)
      opts = [{ title: 'New', subtitle: null }]
    else
      opts = [{ title: 'New', subtitle: null }, ...opts]
    optionMenu = new OptionMenu({
      target: document.body,
      props: {
        title: 'Options',
        focusIndex: 0,
        options: opts,
        softKeyCenterText: 'select',
        onSoftkeyRight: (evt, scope) => {
          console.log('onSoftkeyRight', scope);
        },
        onSoftkeyLeft: (evt, scope) => {
          console.log('onSoftkeyRight', scope);
        },
        onEnter: (evt, scope) => {
          console.log('onEnter', scope.selected.title);
          if (scope.selected.title === 'New') {
            create()
          } else if (scope.selected.title === 'Edit') {
            edit(user)
          } else if (scope.selected.title === 'Call') {
            call(user)
          } else if (scope.selected.title === 'Send Message') {
            sms(user)
          } else if (scope.selected.title === 'Share') {
            share(user)
          } else if (scope.selected.title === 'Delete') {
            remove(user)
          }
          optionMenu.$destroy();
        },
        onBackspace: (evt, scope) => {
          console.log('onBackspace', scope);
          evt.preventDefault();
          evt.stopPropagation();
          optionMenu.$destroy();
        },
        onOpened: () => {
          navInstance.detachListener();
        },
        onClosed: (scope) => {
          console.log(scope);
          navInstance.attachListener();
          optionMenu = null;
        }
      }
    });
  }

  function create() {
    const request = new MozActivity({
      name: "new",
      data: {
        type: "webcontacts/contact"
      }
    });
    request.onsuccess = (res) => {
      console.log(res)
    }
    request.onerror = (err) => {
      showDialog("Warning",  err.target.error.message || err.target.error.name)
    }
  }

  function edit(user) {
    const request = new MozActivity({
      name: "update",
      data: {
        type: "webcontacts/contact",
        params: user
      }
    });
    request.onsuccess = (res) => {
      console.log(res)
    }
    request.onerror = (err) => {
      showDialog("Warning",  err.target.error.message || err.target.error.name)
    }
  }

  function call(user) {
    const request = new MozActivity({
      name: "dial",
      data: {
        type: "webtelephony/number",
        number: user.tel[0].value
      }
    });
    request.onsuccess = (res) => {
      console.log(res)
    }
    request.onerror = (err) => {
      showDialog("Warning",  err.target.error.message || err.target.error.name)
    }
  }

  function sms(user) {
    const request = new MozActivity({
      name: "new",
      data: {
        type: "websms/sms",
        number: user.tel[0].value
      }
    });
    request.onsuccess = (res) => {
      console.log(res)
    }
    request.onerror = (err) => {
      showDialog("Warning",  err.target.error.message || err.target.error.name)
    }
  }

  function share(user) {
    ContactToVcardBlob([user], function blobReady(vcardBlob) {
      VcardFilename(user).then(filename => {
        const request = new MozActivity({
          name: 'share',
          data: {
            type: 'text/vcard',
            number: 1,
            blobs: [new window.File([vcardBlob], filename, {
              type: 'text/x-vcard'
            })],
            filenames: [filename]
          }
        });
        request.onsuccess = (res) => {
          console.log(res)
        }
        request.onerror = (err) => {
          showDialog("Warning",  err.target.error.message || err.target.error.name)
        }
      });
    }, { type: 'text/x-vcard'});
  }

  function remove(user) {
    // TODO
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
