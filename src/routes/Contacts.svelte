<script lang="ts">
  import '../synchub/contact2vcard';
  import '../synchub/setImmediate';
  import '../synchub/l10n';
  import '../synchub/text_normalizer';

  import { navigate as goto } from "svelte-navigator";
  import { createKaiNavigator } from '../utils/navigation';
  import { onMount, onDestroy } from 'svelte';
  import { getDeviceContacts } from '../synchub/utils';
  import { ListView, TextInputDialog, LoadingBar, Dialog, OptionMenu } from '../components';
  import ContactForm from '../synchub/ContactForm.svelte'

  export let location: any;
  export let navigate: any;
  export let getAppProp: Function;

  const chunkSize = 50;

  let contactForm: ContactForm;
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
      showSearchDialog()
    },
    softkeyRightListener: function(evt) {
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
    softwareKey.setText({ left: "Search", center: "CALL", right: "Options" });
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
    navigator.mozContacts.addEventListener('contactchange', oncontactchange)
  });

  onDestroy(() => {
    document.removeEventListener('keydown', callButtonHandler);
    navigator.mozContacts.removeEventListener('contactchange', oncontactchange)
    navInstance.detachListener();
  });

  function oncontactchange(evt) {
    // console.log(evt)
  }

  function showContactForm(contact) {
    const target = { name: contact.name, givenName: contact.givenName, familyName: contact.familyName, tel: contact.tel }
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        contactForm = new ContactForm({
          target: document.body,
          props: {
            title: contact.id != null && contact.id != "undefined" ? 'Edit Contact' : 'New Contact',
            contact: target,
            softKeyLeftText: 'Cancel',
            softKeyCenterText: '',
            softKeyRightText: 'Save',
            onSoftkeyLeft: (evt) => {
              reject();
              contactForm.$destroy();
            },
            onSoftkeyRight: (evt, data) => {
              if (data.tel == null) {
                reject('Phone number is required');
              } else {
                // console.log(data)
                contact.name = data.name
                contact.givenName = data.givenName
                contact.familyName = data.familyName
                contact.tel = data.tel
                resolve(contact);
              }
              contactForm.$destroy();
            },
            onEnter: (evt) => {},
            onBackspace: (evt) => {
              reject();
              evt.preventDefault();
              evt.stopPropagation();
              contactForm.$destroy();
            },
            onOpened: () => {
              navInstance.detachListener();
            },
            onClosed: () => {
              navInstance.attachListener();
              contactForm = null;
            }
          }
        });
      }, 100);
    });
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
        appBar.setTitleText(`${name}(${pageCursor+1}/${pages.length}) [${pages[pageCursor].length}]`);
        contactList = pages[pageCursor]
        setTimeout(() => {
          navInstance.navigateListNav(1);
        }, 200)
      }, 100)
      // console.log(pageCursor, contactList)
    }
  }

  function nextPage(p) {
    if (pages[p + 1] != null) {
      navInstance.verticalNavIndex = -1
      pageCursor = p + 1;
      contactList = []
      setTimeout(() => {
        const { appBar } = getAppProp();
        appBar.setTitleText(`${name}(${pageCursor+1}/${pages.length}) [${pages[pageCursor].length}]`);
        contactList = pages[pageCursor]
        setTimeout(() => {
          navInstance.navigateListNav(1);
        }, 200)
      }, 100)
      // console.log(pageCursor, contactList)
    }
  }

  function onSelect(user) {
    call(user)
  }

  function callButtonHandler(evt) {
    const user = pages[pageCursor][navInstance.verticalNavIndex]
    if (evt.key === 'Call' && user != null) {
      // console.log('callButtonHandler', evt.key, pageCursor, navInstance.verticalNavIndex)
      call(user)
    }
  }

  function showSearchDialog() {
    contactSearchDialog = new TextInputDialog({
      target: document.body,
      props: {
        title: 'Search Contacs',
        softKeyLeftText: 'Cancel',
        softKeyCenterText: 'search',
        softKeyRightText: 'Reset',
        value: searchInput,
        placeholder: 'Enter search keyword',
        type: 'text',
        onSoftkeyLeft: (evt, value) => {
          contactSearchDialog.$destroy();
        },
        onSoftkeyRight: (evt, value) => {
          searchContacts("");
          contactSearchDialog.$destroy();
        },
        onEnter: (evt, value) => {
          searchContacts(value.trim());
          contactSearchDialog.$destroy();
        },
        onBackspace: (evt, value) => {
          evt.stopPropagation();
        },
        onOpened: () => {
          navInstance.detachListener();
        },
        onClosed: (value) => {
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
      // console.log('search searchContacts', searchInput.length)
      const searchResult = contactDb.filter((user) => {
        const cmp = user.name[0].toLocaleLowerCase().indexOf(searchInput.toLocaleLowerCase());
        return cmp > -1;
      })
      // console.log('searchResult', searchResult.length)
      pageCursor = -1;
      for (let i = 0; i < searchResult.length; i += chunkSize) {
        const chunk = searchResult.slice(i, i + chunkSize);
        pages.push(chunk);
      }
      if (searchResult.length > 0) {
        nextPage(pageCursor)
      } else {
        appBar.setTitleText(`${name}(0)`);
        contactList = []
        setTimeout(() => {
          navInstance.navigateListNav(1);
        }, 200)
      }
    } else {
      pages = []
      contactList = []
      // console.log('reset searchContacts', searchInput.length)
      pageCursor = -1;
      for (let i = 0; i < contactDb.length; i += chunkSize) {
        const chunk = contactDb.slice(i, i + chunkSize);
        pages.push(chunk);
      }
      nextPage(pageCursor)
    }
  }

  function showOptionMenu() {
    let user;
    try {
      user = pages[pageCursor][navInstance.verticalNavIndex]
    } catch (e) {}
    let opts = [
      { title: 'Edit', subtitle: null },
      { title: 'Call', subtitle: null },
      { title: 'Send Message', subtitle: null },
      { title: 'Share', subtitle: null },
      { title: 'Delete', subtitle: null },
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
        onSoftkeyRight: (evt, scope) => {},
        onSoftkeyLeft: (evt, scope) => {},
        onEnter: (evt, scope) => {
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
          evt.preventDefault();
          evt.stopPropagation();
          optionMenu.$destroy();
        },
        onOpened: () => {
          navInstance.detachListener();
        },
        onClosed: (scope) => {
          navInstance.attachListener();
          optionMenu = null;
        }
      }
    });
  }

  function create() {
    const user = new mozContact();
    showContactForm(user)
    .then(contact => {
      navigator.mozContacts.save(contact)
      .then(() => {
        return navigator.mozContacts.find({ filterBy: ['tel'], filterValue: contact.tel[0].value, filterOp: 'equals', filterLimit: 100 })
      })
      .then(result => {
        if (result.length === 0) {
          showDialog("Warning",  "Fail create new contact")
          return
        } else if (result.length > 1) {
          result.sort((a,b) => (a.updated < b.updated) ? 1 : ((b.updated < a.updated) ? -1 : 0))
        }
        contactDb.push(result[0])
        searchContacts(searchInput)
        showDialog("Success",  "New contact was created")
      })
      .catch(err => {
        console.warn(err)
      });
    })
    .catch(err => {
      if (err)
        showDialog("Warning",  err.toString())
    });
  }

  function edit(user) {
    showContactForm(user)
    .then(contact => {
      // console.log(contact)
      const index = contactDb.findIndex((i) => {
        return i.id === contact.id
      })
      if (index > -1) {
        navigator.mozContacts.save(contact)
        .then(() => {
          return navigator.mozContacts.find({ filterBy: ['tel'], filterValue: contact.tel[0].value, filterOp: 'equals', filterLimit: 100 })
        })
        .then(result => {
          if (result.length === 0) {
            showDialog("Warning",  "Fail update contact")
            return
          } else if (result.length > 1) {
            result.sort((a,b) => (a.updated < b.updated) ? 1 : ((b.updated < a.updated) ? -1 : 0))
          }
          contactDb[index] = result[0]
          searchContacts(searchInput)
          showDialog("Success",  "Contact was updated")
        })
        .catch(err => {
          console.warn(err)
        });
      } else {
        showDialog("Warning",  "Contact not exist")
      }
    })
    .catch(err => {
      if (err)
        showDialog("Warning",  err.toString())
    });
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
      // console.log(res)
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
      // console.log(res)
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
          // console.log(res)
        }
        request.onerror = (err) => {
          showDialog("Warning",  err.target.error.message || err.target.error.name)
        }
      });
    }, { type: 'text/x-vcard'});
  }

  function remove(user) {
    const index = contactDb.findIndex((i) => {
      return i.id === user.id
    })
    if (index > -1) {
      setTimeout(() => {
        dialog = new Dialog({
          target: document.body,
          props: {
            title: 'Confirmation',
            body: `Are you sure to remove ${user.name[0]} from phonebook ?`,
            softKeyLeftText: 'Cancel',
            softKeyCenterText: '',
            softKeyRightText: 'Yes',
            onSoftkeyLeft: (evt) => {
              dialog.$destroy();
            },
            onSoftkeyRight: (evt) => {
              showLoadingBar();
              const request = navigator.mozContacts.remove(user);
              request.onsuccess = (result) => {
                contactDb.splice(index, 1);
                searchContacts(searchInput)
                if (loadingBar != null) {
                  loadingBar.$destroy();
                }
              }
              request.onerror = (err) => {
                console.Warn(err)
                if (loadingBar != null) {
                  loadingBar.$destroy();
                }
              }
              dialog.$destroy();
            },
            onEnter: (evt) => {},
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
      }, 100)
    }
  }

</script>

<main id="phonebook-screen" data-pad-top="28" data-pad-bottom="30">
  {#each contactList as user}
  <ListView className="contactsNav" title="{user.name[0]}" subtitle="{user.tel[0].value}" onClick={() => onSelect(user)}/>
  {/each}
</main>

<style>
  #phonebook-screen {
    overflow: scroll;
    width: 100%;
  }
</style>
