<script lang="ts">
  import { Route, navigate as goto } from "svelte-navigator";
  import { createKaiNavigator } from '../utils/navigation';
  import { Dialog, OptionMenu, SingleSelector, MultiSelector, ListView, Separator, Radio, Checkbox, LoadingBar, LinearProgress, RangeSlider, Button, TextInputField, TextAreaField, TextInputDialog, TextAreaDialog, Radio, Checkbox, DatePicker, TimePicker, Toast, Toaster, SoftwareKey } from '../components';
  import { onMount, onDestroy } from 'svelte';

  const navClass: string = 'homeNav';
  let locale: string;
  export let location: any;
  export let navigate: any;
  export let getAppProp: Function;

  let name: string = 'Home';
  let dialog: Dialog;
  let optionMenu: OptionMenu;
  let optionMenuIndex:number = 0;
  let singleSelector: SingleSelector;
  let singleSelectorOptions:any = [
    { title: 'Single Selector 0', subtitle: 'Single selector 0 subtitle', selected: true },
    { title: 'Single Selector 1', subtitle: 'Single selector 1 subtitle', selected: false },
    { title: 'Single Selector 2', subtitle: 'Single selector 2 subtitle', selected: false },
    { title: 'Single Selector 3', subtitle: 'Single selector 3 subtitle', selected: false },
    { title: 'Single Selector 4', subtitle: 'Single selector 4 subtitle', selected: false },
  ];
  let multiSelector: MultiSelector;
  let multiSelectorOptions:any = [
    { title: 'Multi Selector 0', subtitle: 'Multi selector 0 subtitle', checked: true },
    { title: 'Multi Selector 1', subtitle: 'Multi selector 1 subtitle', checked: false },
    { title: 'Multi Selector 2', subtitle: 'Multi selector 2 subtitle', checked: false },
    { title: 'Multi Selector 3', subtitle: 'Multi selector 3 subtitle', checked: false },
    { title: 'Multi Selector 4', subtitle: 'Multi selector 4 subtitle', checked: false },
  ];
  let loadingBar: LoadingBar;
  let inputSoftwareKey: SoftwareKey;
  let datePicker: DatePicker;
  let datePickerValue: Date = new Date(1582227193963);
  let timePicker: DatePicker;
  let textInputDialog: TextInputDialog;
  let textAreaDialog: TextAreaDialog;
  let progressValue: number = 0;
  let sliderValue: number = 20;
  let locales:any = [
    { title: 'English - United State', subtitle: 'en-US' },
    { title: 'Japanese', subtitle: 'jp-JP' },
  ];
  let localeMenu: OptionMenu;

  let navOptions = {
    verticalNavClass: navClass,
    softkeyLeftListener: function(evt) {
      if (inputSoftwareKey)
        return;
      openDialog();
      console.log('softkeyLeftListener', name, this.verticalNavIndex);
    },
    softkeyRightListener: function(evt) {
      if (inputSoftwareKey)
        return;
      toastMessage();
      console.log('softkeyRightListener', name, this.verticalNavIndex);
    },
    enterListener: function(evt) {
      if (inputSoftwareKey)
        return;
      const navClasses = document.getElementsByClassName(navClass);
      if (navClasses[this.verticalNavIndex] != null) {
        navClasses[this.verticalNavIndex].click();
      }
      console.log('enterListener', name);
    },
    backspaceListener: function(evt) {
      console.log('backspaceListener', name);
    },
    arrowLeftListener: function(evt) {
      console.log('arrowLeftListener', name);
      const navClasses = document.getElementsByClassName(navClass);
      if (navClasses[this.verticalNavIndex] != null) {
        const dataKey = navClasses[this.verticalNavIndex].getAttribute('data-key');
        if (dataKey === 'linear-progress') {
          if (progressValue === 0)
            return;
          progressValue -= 10;
        } else if (dataKey === 'range-slider') {
          if (sliderValue === 0)
            return;
          sliderValue -= 10;
        }
      }
    },
    arrowRightListener: function(evt) {
      console.log('arrowRightListener', name);
      const navClasses = document.getElementsByClassName(navClass);
      if (navClasses[this.verticalNavIndex] != null) {
        const dataKey = navClasses[this.verticalNavIndex].getAttribute('data-key');
        if (dataKey === 'linear-progress') {
          if (progressValue === 100)
            return;
          progressValue += 10;
        } else if (dataKey === 'range-slider') {
          if (sliderValue === 100)
            return;
          sliderValue += 10;
        }
      }
    },
  };

  let navInstance = createKaiNavigator(navOptions);

  function onClickHandler(value) {
    goto(value);
  }

  function toastMessage(text = 'I\'m out after 2 second') {
    const t = new Toast({
      target: document.body,
      props: {
        options: {}
      }
    })
    Toaster.push(text , {
      dismissable: false,
      intro: { y: -64 },
      duration: 2000,
      onpop: () => {
        setTimeout(() => {
          t.$destroy();
        }, 4000);
      }
    })
  }

  function showLoadingBar() {
    loadingBar = new LoadingBar({
      target: document.body,
      props: {
        onOpened: () => {
          navInstance.detachListener();
          setTimeout(() => {
            loadingBar.$destroy();
          }, 3000);
        },
        onClosed: () => {
          navInstance.attachListener();
          loadingBar = null;
        }
      }
    });
  }

  function openDialog() {
    dialog = new Dialog({
      target: document.body,
      props: {
        title: 'Intro',
        body: `Svelte is a radical new approach to building user interfaces. Whereas traditional frameworks like React and Vue do the bulk of their work in the browser, Svelte shifts that work into a compile step that happens when you build your app. Instead of using techniques like virtual DOM diffing, Svelte writes code that surgically updates the DOM when the state of your app changes. We're proud that Svelte was recently voted the most loved web framework with the most satisfied developers in a pair of industry surveys. We think you'll love it too. Read the introductory blog post to learn more.`,
        softKeyCenterText: 'hide',
        onSoftkeyLeft: (evt) => {
          console.log('onSoftkeyLeft');
        },
        onSoftkeyRight: (evt) => {
          console.log('onSoftkeyRight');
        },
        onEnter: (evt) => {
          console.log('onEnter');
          dialog.$destroy();
        },
        onBackspace: (evt) => {
          console.log('onBackspace');
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

  function openOptionMenu() {
    optionMenu = new OptionMenu({
      target: document.body,
      props: {
        title: 'Option Menu',
        focusIndex: optionMenuIndex,
        options: [
          { title: 'Option Menu 0', subtitle: 'Option menu 0 subtitle' },
          { title: 'Option Menu 1', subtitle: 'Option menu 1 subtitle' },
          { title: 'Option Menu 2', subtitle: 'Option menu 2 subtitle' },
          { title: 'Option Menu 3', subtitle: 'Option menu 3 subtitle' },
          { title: 'Option Menu 4', subtitle: 'Option menu 4 subtitle' },
        ],
        softKeyCenterText: 'select',
        onSoftkeyRight: (evt, scope) => {
          console.log('onSoftkeyRight', scope);
        },
        onSoftkeyLeft: (evt, scope) => {
          console.log('onSoftkeyRight', scope);
        },
        onEnter: (evt, scope) => {
          console.log('onEnter', scope);
          optionMenuIndex = scope.index;
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

  function openSingleSelector() {
    const idx = singleSelectorOptions.findIndex((o) => {
      return o.selected;
    })
    singleSelector = new SingleSelector({
      target: document.body,
      props: {
        title: 'Single Selector',
        focusIndex: idx,
        options: singleSelectorOptions,
        softKeyCenterText: 'select',
        onEnter: (evt, scope) => {
          console.log('onEnter', scope);
          singleSelectorOptions = scope.options;
          evt.preventDefault();
          evt.stopPropagation();
          singleSelector.$destroy();
        },
        onBackspace: (evt, scope) => {
          console.log('onBackspace', scope);
          evt.preventDefault();
          evt.stopPropagation();
          singleSelector.$destroy();
        },
        onOpened: () => {
          navInstance.detachListener();
        },
        onClosed: (scope) => {
          console.log(scope);
          navInstance.attachListener();
          singleSelector = null;
        }
      }
    });
  }

  function openMultiSelector() {
    multiSelector = new MultiSelector({
      target: document.body,
      props: {
        title: 'Multi Selector',
        focusIndex: optionMenuIndex,
        options: JSON.parse(JSON.stringify(multiSelectorOptions)),
        softKeyLeftText: 'Cancel',
        softKeyRightText: 'Done',
        softKeyCenterTextSelect: 'select',
        softKeyCenterTextDeselect: 'deselect',
        onSoftkeyLeft: (evt, scope) => {
          console.log('onSoftkeyLeft', scope);
          evt.preventDefault();
          evt.stopPropagation();
          multiSelector.$destroy();
        },
        onSoftkeyRight: (evt, scope) => {
          console.log('onSoftkeyRight', scope);
          multiSelectorOptions = scope.options;
          evt.preventDefault();
          evt.stopPropagation();
          multiSelector.$destroy();
        },
        onBackspace: (evt, scope) => {
          console.log('onBackspace', scope);
          evt.preventDefault();
          evt.stopPropagation();
          multiSelector.$destroy();
        },
        onOpened: () => {
          navInstance.detachListener();
        },
        onClosed: (scope) => {
          console.log(scope);
          navInstance.attachListener();
          multiSelector = null;
        }
      }
    });
  }

  function openDatePicker() {
    datePicker = new DatePicker({
      target: document.body,
      props: {
        title: 'Date Picker',
        date: datePickerValue,
        softKeyLeftText: 'Cancel',
        softKeyCenterText: 'save',
        onSoftkeyLeft: (evt, date) => {
          console.log('onSoftkeyLeft', date);
          datePicker.$destroy();
        },
        onSoftkeyRight: (evt, date) => {
          console.log('onSoftkeyRight', date);
        },
        onEnter: (evt, date) => {
          console.log('onEnter', date);
          datePickerValue = date;
          datePicker.$destroy();
        },
        onBackspace: (evt, date) => {
          console.log('onBackspace', date);
          evt.preventDefault();
          evt.stopPropagation();
          datePicker.$destroy();
        },
        onOpened: () => {
          navInstance.detachListener();
        },
        onClosed: (date) => {
          console.log('onClosed', date);
          navInstance.attachListener();
          datePicker = null;
        }
      }
    });
  }

  function openTimePicker() {
    timePicker = new TimePicker({
      target: document.body,
      props: {
        title: 'Time Picker',
        date: datePickerValue,
        is12HourSystem: true,
        softKeyLeftText: 'Cancel',
        softKeyCenterText: 'save',
        onSoftkeyLeft: (evt, date) => {
          console.log('onSoftkeyLeft', date);
          timePicker.$destroy();
        },
        onSoftkeyRight: (evt, date) => {
          console.log('onSoftkeyRight', date);
        },
        onEnter: (evt, date) => {
          console.log('onEnter', date);
          datePickerValue = date;
          timePicker.$destroy();
        },
        onBackspace: (evt, date) => {
          console.log('onBackspace', date);
          evt.preventDefault();
          evt.stopPropagation();
          timePicker.$destroy();
        },
        onOpened: () => {
          navInstance.detachListener();
        },
        onClosed: (date) => {
          console.log('onClosed', date);
          navInstance.attachListener();
          timePicker = null;
        }
      }
    });
  }

  function openTextInputDialog() {
    textInputDialog = new TextInputDialog({
      target: document.body,
      props: {
        title: 'TextInputDialog',
        softKeyCenterText: 'ok',
        value: 'Value',
        placeholder: 'Placeholder',
        type: 'text',
        onSoftkeyLeft: (evt, value) => {
          console.log('onSoftkeyLeft', value);
        },
        onSoftkeyRight: (evt, value) => {
          console.log('onSoftkeyRight', value);
        },
        onEnter: (evt, value) => {
          console.log('onEnter', value);
          textInputDialog.$destroy();
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
          textInputDialog = null;
        }
      }
    });
  }

  function openTextAreaDialog() {
    textAreaDialog = new TextAreaDialog({
      target: document.body,
      props: {
        title: 'TextAreaDialog',
        softKeyCenterText: 'ok',
        value: 'Value',
        placeholder: 'Placeholder',
        type: 'text',
        rows: 3,
        onSoftkeyLeft: (evt, value) => {
          console.log('onSoftkeyLeft', value);
        },
        onSoftkeyRight: (evt, value) => {
          console.log('onSoftkeyRight', value);
        },
        onEnter: (evt, value) => {
          console.log('onEnter', value);
          textAreaDialog.$destroy();
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
          textAreaDialog = null;
        }
      }
    });
  }

  function onButtonClick(evt) {
    window.close();
  }

  function onInput(evt) {
    console.log('onInput');
  }

  function onFocus(evt) {
    console.log('onFocus');
    inputSoftwareKey = new SoftwareKey({
      target: document.body,
      props: {
        isInvert: true,
        leftText: 'X Dialog',
        centerText: 'X Enter',
        rightText: 'X Toast'
      }
    });
  }

  function onBlur(evt) {
    console.log('onBlur');
    if (inputSoftwareKey) {
      inputSoftwareKey.$destroy();
      inputSoftwareKey = null;
    }
  }

  function propagateClick(evt) {
    const keys = Object.keys(evt.target.children);
    for (var k in keys) {
      evt.target.children[k].click();
    }
  }

  function onRadioCheckboxChange(scope) {
    console.log(scope);
  }

  function changeLocale() {
    const idx = locales.findIndex((o) => {
      return o.subtitle === locale || 0;
    })
    localeMenu = new OptionMenu({
      target: document.body,
      props: {
        title: getAppProp().localization.lang('select_locale'),
        focusIndex: idx,
        options: locales,
        softKeyCenterText: 'select',
        onSoftkeyRight: (evt, scope) => {
          console.log('onSoftkeyRight', scope);
        },
        onSoftkeyLeft: (evt, scope) => {
          console.log('onSoftkeyRight', scope);
        },
        onEnter: (evt, scope) => {
          console.log('onEnter', scope);
          getAppProp().localization.loadLocale(scope.selected.subtitle);
          locale = getAppProp().localization.defaultLocale;
          localeMenu.$destroy();
        },
        onBackspace: (evt, scope) => {
          console.log('onBackspace', scope);
          evt.preventDefault();
          evt.stopPropagation();
          localeMenu.$destroy();
        },
        onOpened: () => {
          navInstance.detachListener();
        },
        onClosed: (scope) => {
          console.log(scope);
          navInstance.attachListener();
          localeMenu = null;
        }
      }
    });
  }

  onMount(() => {
    console.log('onMount', name);
    locale = getAppProp().localization.defaultLocale;
    const { appBar, softwareKey } = getAppProp();
    appBar.setTitleText(name);
    softwareKey.setText({ left: `Dialog L`, center: `${name} C`, right: `Toast R` });
    navInstance.attachListener();
  });

  onDestroy(() => {
    if (ws)
      ws.close()
    console.log('onDestroy', name);
    navInstance.detachListener();
  });

  // Kai Suite
  let conBtnLabel: string = 'Connect';
  let ws: any;

  function updateContact(kaicontact, data) {
    kaicontact.name = data.person.names[0].unstructuredName != null ? [data.person.names[0].unstructuredName] : [];
    kaicontact.givenName = data.person.names[0].givenName != null ? [data.person.names[0].givenName] : [];
    kaicontact.familyName = data.person.names[0].familyName != null ?[data.person.names[0].familyName] : [];
    if (data.person.emailAddresses != null) {
      data.person.emailAddresses.forEach((_, i) => {
        if (data.person.emailAddresses[i].type == null)
          data.person.emailAddresses[i].type = []
        else
          data.person.emailAddresses[i].type = [data.person.emailAddresses[i].type]
      })
      kaicontact.email = data.person.emailAddresses;
    }
    if (data.person.phoneNumbers != null) {
      data.person.phoneNumbers.forEach((_, i) => {
        if (data.person.phoneNumbers[i].type == null)
          data.person.phoneNumbers[i].type = []
        else
          data.person.phoneNumbers[i].type = [data.person.phoneNumbers[i].type]
      })
      kaicontact.tel = data.person.phoneNumbers;
    }
    kaicontact.category = [data.namespace];
    kaicontact.key = [data.metadata.hash];
    return kaicontact;
  }

  function toggleConnection() {
    if (ws == null)
      connectWsServer()
    else
      disconnectWsServer()
  }

  function connectWsServer() {
    if (ws != null)
      return
    ws = new WebSocket('ws://192.168.43.1:4444/')
    ws.onopen = () => {
      conBtnLabel = 'Disconnect'
      ws.send(JSON.stringify({flag: 0, data: navigator.userAgent}))
      syncSMS()
    }
    ws.onclose = () => {
      conBtnLabel = 'Connect'
      ws = null
    }
    ws.onerror = () => {
      conBtnLabel = 'Connect'
      ws.close()
      ws = null
    }
    ws.onmessage = (event) => {
      var protocol = JSON.parse(event.data)
      var data;
      try {
        data = JSON.parse(protocol.data)
      } catch (e) {
        data = protocol.data
      }
      console.log("Flag:", protocol.flag)
      if (protocol.flag === 1) { // TxSyncGoogleContact
        var filter = {
          filterBy: ['category'],
          filterValue: data.namespace,
          filterOp: 'equals',
          filterLimit: 1
        };
        navigator.mozContacts.find(filter)
        .then(contact => {
          if (contact.length === 0) {
            if (data.metadata.sync_id != null || data.metadata.sync_updated != null || data.metadata.deleted) {
              console.log( "Deleted KaiContact:", data.metadata)
              const txd = { namespace: data.namespace, sync_id: data.metadata.sync_id, sync_updated: data.metadata.sync_updated }
              const tx = { flag: 6, data: JSON.stringify(txd) }
              ws.send(JSON.stringify(tx))
              return;
            }
            var kaicontact = new mozContact();
            kaicontact = updateContact(kaicontact, data);
            navigator.mozContacts.save(kaicontact)
            .then(() => {
              return navigator.mozContacts.find(filter)
            })
            .then((result) => {
              if (result.length === 0) {
                const txd = { namespace: data.namespace, sync_id: "error", sync_updated: "Added KaiContact but not found by category" }
                const tx = { flag: 2, data: JSON.stringify(txd) }
                ws.send(JSON.stringify(tx))
              } else {
                const txd = { namespace: data.namespace, sync_id: result[0].id, sync_updated: result[0].updated }
                const tx = { flag: 2, data: JSON.stringify(txd) }
                ws.send(JSON.stringify(tx))
              }
            })
            .catch((err) => {
              const txd = { namespace: data.namespace, sync_id: "error", sync_updated: err.toString() }
              const tx = { flag: 2, data: JSON.stringify(txd) }
              ws.send(JSON.stringify(tx))
            });
            console.log("Add to KaiContact:", data.namespace, kaicontact, data.person)
          } else {
            if (data.metadata.deleted) {
              console.log(0, "Delete KaiContact:", data.metadata, contact[0])
              navigator.mozContacts.remove(contact[0]);
              const txd = { namespace: data.namespace, sync_id: data.metadata.sync_id, sync_updated: data.metadata.sync_updated }
              const tx = { flag: 6, data: JSON.stringify(txd) }
              ws.send(JSON.stringify(tx))
            } else if (data.metadata.hash != contact[0].key[0]) {
              console.log(1, "Update KaiContact:", data.metadata, contact[0])
              var kaicontact = updateContact(contact[0], data);
              navigator.mozContacts.save(kaicontact)
              .then(() => {
                return navigator.mozContacts.find(filter)
              })
              .then((result) => {
                if (result.length === 0) {
                  const txd = { namespace: data.namespace, sync_id: "error", sync_updated: "Updated KaiContact but not found by category" }
                  const tx = { flag: 2, data: JSON.stringify(txd) }
                  ws.send(JSON.stringify(tx))
                } else {
                  const txd = { namespace: data.namespace, sync_id: result[0].id, sync_updated: result[0].updated }
                  const tx = { flag: 2, data: JSON.stringify(txd) }
                  ws.send(JSON.stringify(tx))
                }
              })
              .catch((err) => {
                const txd = { namespace: data.namespace, sync_id: "error", sync_updated: err.toString() }
                const tx = { flag: 2, data: JSON.stringify(txd) }
                ws.send(JSON.stringify(tx))
              });
            } else if (contact[0].updated > new Date(data.metadata.sync_updated)) {
              console.log(2, "Update KaiContact:", data.metadata, contact[0])
              const txd = { namespace: data.namespace, kai_contact: contact[0] }
              const tx = { flag: 4, data: JSON.stringify(txd) }
              ws.send(JSON.stringify(tx))
            } else {
              console.log(3, "Update KaiContact:", data.metadata, contact[0])
              const txd = { namespace: data.namespace, sync_id: data.metadata.sync_id, sync_updated: data.metadata.sync_updated }
              const tx = { flag: 2, data: JSON.stringify(txd) }
              ws.send(JSON.stringify(tx))
            }
          }
        })
        .catch((err) => {
          console.log("Error KaiContact:", data.namespace, err)
          const txd = { namespace: data.namespace, sync_id: "error", sync_updated: err.toString() }
          const tx = { flag: 2, data: JSON.stringify(txd) }
          ws.send(JSON.stringify(tx))
        });
      } else if (protocol.flag === 3) { // TxRestoreGoogleContact3
        console.log("TxRestoreGoogleContact:", data)
      } else if (protocol.flag === 5) { // TxSyncLocalContact5
        console.log("TxSyncLocalContact:", data.persons, data.metadata);
        getKaiContacts()
        .then((kaicontacts) => {

          function syncLocalcontacts() {
            if (kaicontactsElapsed <= 0) {
              if (personsElapsed > 0) {
                // iterate persons probally imported contact on desktop app
                for (var id in persons) {
                  if (kaicontacts[id] == null && metadata[id].sync_id == null) {
                    // add person into kaicontact
                    // delete old person & create new person
                    // mergedList
                    const mt = { sync_id: 'kaicontact.id', sync_updated: 'kaicontact.updated', hash: "merged", deleted: false }
                    mergedList.push({ person: persons[id], kai_contact: {}, metadata: mt });
                    personsElapsed--;
                    syncPersons();
                  } else {
                    personsElapsed--;
                    syncPersons();
                  }
                }
              } else {
                syncPersons();
              }
            }
          }

          function syncPersons() {
            if (personsElapsed <= 0) {
              // if metadata not exist in kaicontacts, probably kaicontact was deleted
              for (var id in metadata) {
                if (kaicontacts[metadata[id].sync_id] == null) {
                  deleteList.push(metadata[id]);
                }
              }
              console.log('pushList:', pushList);
              console.log('syncList:', syncList);
              console.log('deleteList:', deleteList);
              console.log('mergedList:', mergedList);
              const txd = { push_list: pushList, sync_list: syncList, merged_list: mergedList, delete_list: deleteList }
              const tx = { flag: 8, data: JSON.stringify(txd) }
              ws.send(JSON.stringify(tx))
            }
          }

          const metadata = data.metadata;
          const persons = data.persons;
          let pushList = []; // {kaicontact, metadata}
          let syncList = []; // {kaicontact, metadata}
          let mergedList = [];   // {kaicontact, metadata, person}
          let deleteList = []; // metadata
          let kaicontactsElapsed = Object.keys(kaicontacts).length;
          let personsElapsed = Object.keys(persons).length;
          console.log('kaicontacts:', Object.keys(kaicontacts).length);
          console.log('persons:', Object.keys(kaicontacts).length);
          console.log('metadata:', Object.keys(kaicontacts).length);

          if (kaicontactsElapsed > 0) {
            for (var kid in kaicontacts) {
              const kaicontact = kaicontacts[kid];
              if ((metadata[kaicontact.id] != null &&metadata[kaicontact.id].deleted) || (metadata[kaicontact.id] == null && kaicontact.key != null)) {
                // delete: kaicontact
                navigator.mozContacts.remove(kaicontact);
                if (metadata[kaicontact.id] != null) {
                  // delete: person
                  deleteList.push(metadata[kaicontact.id]);
                }
                kaicontactsElapsed--;
                syncLocalcontacts();
              } else if (metadata[kaicontact.id] && metadata[kaicontact.id].deleted === false && persons[kaicontact.id]) {
                if (new Date(metadata[kaicontact.id].sync_updated) > kaicontact.updated) {
                  console.log('person > kaicontact', kaicontact.id)
                  // update kaicontact then metadata[kaicontact.id].sync_updated = updatedContact.updated
                  const data = { person: persons[kaicontact.id], metadata: metadata[kaicontact.id], namespace: 'local:people:' + kaicontact.id }
                  const updatedContact = updateContact(kaicontact, data)
                  var filter = {
                    filterBy: ['category'],
                    filterValue: data.namespace,
                    filterOp: 'equals',
                    filterLimit: 1
                  };
                  navigator.mozContacts.save(updatedContact)
                  .then(() => {
                    return navigator.mozContacts.find(filter)
                  })
                  .then((result) => {
                    if (result.length === 0) {
                      kaicontactsElapsed--;
                      syncLocalcontacts();
                    } else {
                      // update metadata[kaicontact.id].hash on desktop app
                      metadata[kaicontact.id].sync_updated = result[0].updated;
                      syncList.push({ kai_contact: result[0], metadata: metadata[kaicontact.id] });
                      kaicontactsElapsed--;
                      syncLocalcontacts();
                    }
                  })
                  .catch((err) => {
                    kaicontactsElapsed--;
                    syncLocalcontacts();
                  });
                } else if (new Date(metadata[kaicontact.id].sync_updated) < kaicontact.updated) {
                  console.log('kaicontact > person', kaicontact.id)
                  // update person by kaicontact
                  // update metadata[kaicontact.id].hash on desktop app
                  metadata[kaicontact.id].sync_updated = kaicontact.updated;
                  syncList.push({ kai_contact: kaicontact, metadata: metadata[kaicontact.id] });
                  kaicontactsElapsed--;
                  syncLocalcontacts();
                } else {
                  console.log('kaicontact === person', kaicontact.id)
                  kaicontactsElapsed--;
                  syncLocalcontacts();
                }
              } else if (metadata[kaicontact.id] == null && kaicontact.key == null) {
                // new kaicontact
                var filter = {
                  filterBy: ['category'],
                  filterValue: 'local:people:' + kaicontact.id,
                  filterOp: 'equals',
                  filterLimit: 1
                };
                kaicontact.key = [kaicontact.id];
                kaicontact.category = ['local:people:' + kaicontact.id];
                navigator.mozContacts.save(kaicontact)
                .then(() => {
                  return navigator.mozContacts.find(filter)
                })
                .then((result) => {
                  if (result.length === 0) {
                    kaicontactsElapsed--;
                    syncLocalcontacts();
                  } else {
                    const mt = { sync_id: kaicontact.id, sync_updated: kaicontact.updated, hash: "new" }
                    pushList.push({ kai_contact: result[0], metadata: mt });
                    kaicontactsElapsed--;
                    syncLocalcontacts();
                  }
                })
                .catch((err) => {
                  kaicontactsElapsed--;
                  syncLocalcontacts();
                });
              } else {
                console.warn('TRACE', kaicontact);
                kaicontactsElapsed--;
                syncLocalcontacts();
              }
            }
          } else {
            syncLocalcontacts();
          }
        })
        .catch(err => {
          console.log(err)
        })
      } else if (protocol.flag === 7) { // TxRestoreLocalContact7
        console.log("TxRestoreLocalContacts:", data)
      } else if (protocol.flag === 9) { // TxSyncSMS9
        console.log("TxSyncSMS:", data);
        syncSMS()
      } else if (protocol.flag === 11) { // TxSendSMS11
        console.log("TxSendSMS:", data);
        const req = navigator.mozMobileMessage.send(data.receivers[0], data.message)
        req.onsuccess = function(result) {
          console.log(result)
        }
        req.onerror = function(err) {
          console.log(err.target.error)
        }
      }
    }
  }

  function disconnectWsServer() {
    if (ws == null)
      return
    conBtnLabel = 'Connect'
    ws.close()
    ws = null
  }

  function getKaiContacts() {
    let kaicontacts = {};
    return new Promise((resolve, reject) => {
      var cursor = navigator.mozContacts.getAll()
      cursor.onsuccess = function () {
        if (!this.done) {
          if(cursor.result !== null) {
            var isLocal = cursor.result.key == null;
            if (cursor.result.category == null) {
              isLocal = true;
            } else {
              for (var c in cursor.result.category) {
                if (cursor.result.category[c].indexOf('local:') > -1) {
                  isLocal = true;
                  break;
                }
              }
            }
            if (isLocal)
              kaicontacts[cursor.result.id] = cursor.result
            this.continue()
          }
        } else if (this.done) {
          resolve(kaicontacts);
        }
      }
      cursor.onerror = (err) => {
        reject(err)
      }
    });
  }

  function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = {};
    for (var attr in obj) {
      copy[attr] = obj[attr];
    }
    return copy;
  }

  function syncSMS() {
    if (ws != null) {
      getSMS()
      .then(result => {
        console.log(result)
        const tx = { flag: 10, data: JSON.stringify(result) }
        ws.send(JSON.stringify(tx))
      })
      .catch(err => {
        console.log(err)
      })
    }
  }

  function getSMS() {
    return new Promise((resolve, reject) => {
      var threads = {}
      var messages = {}
      var cursorThread = navigator.mozMobileMessage.getThreads()
      cursorThread.onsuccess = function () {
        if (!cursorThread.done) {
          if(cursorThread.result !== null) {
            threads[cursorThread.result.id] = clone(cursorThread.result)
            messages[cursorThread.result.id] = []
            var cursorMessage = navigator.mozMobileMessage.getMessages({ threadId: cursorThread.result.id }, false)
            cursorMessage.onsuccess = function () {
              if (!cursorMessage.done) {
                if(cursorMessage.result !== null) {
                  messages[cursorThread.result.id].push(clone(cursorMessage.result))
                  cursorMessage.continue()
                }
              } else if (cursorMessage.done) {
                cursorThread.continue()
              }
            }
            cursorMessage.onerror = (err) => {
              console.log(err)
              cursorThread.continue()
            }
          }
        } else if (cursorThread.done) {
          resolve({threads, messages})
        }
      }
      cursorThread.onerror = (err) => {
        console.log(err)
        reject(reject)
      }
    })
  }

  navigator.mozSetMessageHandler('sms-received', function(sms) { 
    console.log('sms-received')
    syncSMS() 
  })

  navigator.mozSetMessageHandler('sms-sent', function(sms) { 
    console.log('sms-sent')
    syncSMS() 
  })

</script>

<main id="home-screen" data-pad-top="28" data-pad-bottom="30">
  <ListView className="{navClass}" title="{getAppProp().localization.langByLocale('hello', locale, 'Svelte')}" subtitle="Goto room screen" onClick={() => onClickHandler('room')}/>
  <Button className="{navClass}" text="{conBtnLabel}" onClick={toggleConnection}>
    <span slot="rightWidget" class="kai-icon-arrow" style="margin:0px 5px;"></span>
  </Button>
  <ListView className="{navClass}" title="{getAppProp().localization.langByLocale('change_locale', locale)}" subtitle="{getAppProp().localization.langByLocale('change_locale_subtitle', locale)}" onClick={changeLocale}/>
  <Separator title="Progress" />
  <ListView className="{navClass}" title="Loading Bar" subtitle="Display loading bar & freeze keydown for 3 seconds" onClick={showLoadingBar} />
  <ListView key="linear-progress" className="{navClass}">
    <slot>
      <LinearProgress label="Linear Progress" value={progressValue} min={0} max={100} progressType={1}/>
    </slot>
    <span slot="rightWidget"></span>
  </ListView>
  <ListView key="range-slider" className="{navClass}">
    <slot>
      <RangeSlider label="Range Slider" value={sliderValue} min={0} max={100} progressType={2}/>
    </slot>
    <span slot="rightWidget"></span>
  </ListView>
  <Separator title="Dialog" />
  <ListView className="{navClass}" title="Option Menu" subtitle="Click to open option menu & focus on index {optionMenuIndex}" onClick={openOptionMenu}/>
  <ListView className="{navClass}" title="Single Selector" subtitle="Click to open single selector & focus on current" onClick={openSingleSelector}/>
  <ListView className="{navClass}" title="Multi Selector" subtitle="Click to open multi selector & focus on index {optionMenuIndex}" onClick={openMultiSelector}/>
  <Separator title="Input" />
  <TextInputField className="{navClass}" label="TextInput" placeholder="Placeholder" value="Value" type="text" {onInput} {onFocus} {onBlur} />
  <TextAreaField className="{navClass}" label="TextArea" placeholder="Placeholder" value="Value" type="text" rows={4} {onInput} {onFocus} {onBlur}/>
  <ListView className="{navClass}" title="Checkbox" subtitle="Please click me" onClick={propagateClick}>
    <Checkbox slot="rightWidget" key="checkbox" checked="{true}" onChange={onRadioCheckboxChange} />
  </ListView>
  <ListView className="{navClass}" title="Radio" subtitle="Please click me" onClick={propagateClick}>
    <Radio slot="rightWidget" key="radio" selected="{true}" onChange={onRadioCheckboxChange} />
  </ListView>
  <ListView className="{navClass}" title="Date Picker" subtitle="Click to open date picker, {datePickerValue.toDateString()}" onClick={openDatePicker}>
    <span slot="rightWidget" class="kai-icon-calendar" style="font-size:20px;"></span>
  </ListView>
  <ListView className="{navClass}" title="Time Picker" subtitle="Click to open time picker, {datePickerValue.toLocaleTimeString()}" onClick={openTimePicker}>
    <span slot="rightWidget" class="kai-icon-favorite-on" style="font-size:20px;"></span>
  </ListView>
  <ListView className="{navClass}" title="Text Input Dialog" subtitle="Open text input dialog" onClick={openTextInputDialog}>
    <span slot="rightWidget" class="kai-icon-search" style="font-size:20px;"></span>
  </ListView>
  <ListView className="{navClass}" title="Text Area Dialog" subtitle="Open text area dialog" onClick={openTextAreaDialog}>
    <span slot="rightWidget" class="kai-icon-message" style="font-size:20px;"></span>
  </ListView>
  <Button className="{navClass}" text="Exit" onClick={onButtonClick}>
    <span slot="leftWidget" class="kai-icon-arrow" style="margin:0px 5px;-moz-transform: scale(-1, 1);-webkit-transform: scale(-1, 1);-o-transform: scale(-1, 1);-ms-transform: scale(-1, 1);transform: scale(-1, 1);"></span>
    <span slot="rightWidget" class="kai-icon-arrow" style="margin:0px 5px;"></span>
  </Button>
</main>

<style>
  #home-screen {
    overflow: scroll;
    width: 100%;
  }
</style>
