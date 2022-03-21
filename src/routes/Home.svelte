<script lang="ts">
  import { Route, navigate as goto } from "svelte-navigator";
  import { createKaiNavigator } from '../utils/navigation';
  import { Dialog, OptionMenu, ListView, Separator, Button, TextInputField, Toast, Toaster, SoftwareKey } from '../components';
  import { onMount, onDestroy } from 'svelte';
  import uaparser from 'ua-parser-js';

  const navClass: string = 'homeNav';
  let locale: string;
  export let location: any;
  export let navigate: any;
  export let getAppProp: Function;

  let name: string = 'Home';
  let ipAddress: string = '192.168.43.33';
  let port: string = '4444';
  let dialog: Dialog;
  let inputSoftwareKey: SoftwareKey;
  
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

  function onButtonExit(evt) {
    window.close();
  }

  function onFocusIp(evt) {
    console.log('onFocus onFocusIp');
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

  function onBlurIp(evt) {
    console.log('onBlur onBlurIp');
    if (inputSoftwareKey) {
      inputSoftwareKey.$destroy();
      inputSoftwareKey = null;
    }
  }

  function onInputIp(evt) {
    console.log('onInput onInputIp', evt.target.value);
    ipAddress = evt.target.value.toString();
  }

  function onFocusPort(evt) {
    console.log('onFocus onFocusPort');
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

  function onBlurPort(evt) {
    console.log('onBlur onBlurPort');
    if (inputSoftwareKey) {
      inputSoftwareKey.$destroy();
      inputSoftwareKey = null;
    }
  }

  function onInputPort(evt) {
    console.log('onInput onInputPort', evt.target.value);
    port = evt.target.value.toString();
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
    console.log(`ws://${ipAddress}:${port}/`)
    if (ws != null)
      return
    ws = new WebSocket(`ws://${ipAddress}:${port}/`)
    ws.onopen = () => {
      conBtnLabel = 'Disconnect'
      const ua = uaparser(navigator.userAgent)
      getIMEI()
      .then((imei) => {
        const data = { device: [ua.device.vendor, ua.device.model].join(' '), imei: imei }
        ws.send(JSON.stringify({ flag: 0, data: JSON.stringify(data) }))
      })
      .catch((err) => {
        console.warn("Err:", err);
      });
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
              // console.log(3, "Update KaiContact:", data.metadata, contact[0])
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
        var filter = {
          filterBy: ['category'],
          filterValue: data.namespace,
          filterOp: 'equals',
          filterLimit: 1
        };
        navigator.mozContacts.find(filter)
        .then(contact => {
          if (contact.length === 0) {
            var kaicontact = new mozContact();
            kaicontact = updateContact(kaicontact, data);
            navigator.mozContacts.save(kaicontact)
            .then(() => {
              return navigator.mozContacts.find(filter)
            })
            .then((result) => {
              if (result.length === 0) {
                const txd = { namespace: data.namespace, sync_id: "error", sync_updated: "Added KaiContact but not found by category" }
                const tx = { flag: 12, data: JSON.stringify(txd) }
                ws.send(JSON.stringify(tx))
              } else {
                const txd = { namespace: data.namespace, sync_id: result[0].id, sync_updated: result[0].updated }
                const tx = { flag: 12, data: JSON.stringify(txd) }
                ws.send(JSON.stringify(tx))
              }
            })
            .catch((err) => {
              const txd = { namespace: data.namespace, sync_id: "error", sync_updated: err.toString() }
              const tx = { flag: 2, data: JSON.stringify(txd) }
              ws.send(JSON.stringify(tx))
            });
            console.log("Restore KaiContact:", data.namespace, kaicontact, data.person)
          } else {
            console.log("Skip Restore KaiContact:", data.namespace)
            const txd = { namespace: data.namespace, sync_id: "error", sync_updated: "skip" }
            const tx = { flag: 12, data: JSON.stringify(txd) }
            ws.send(JSON.stringify(tx))
          }
        })
        .catch((err) => {
          console.log("Error Restore KaiContact:", data.namespace, err)
          const txd = { namespace: data.namespace, sync_id: "error", sync_updated: err.toString() }
          const tx = { flag: 12, data: JSON.stringify(txd) }
          ws.send(JSON.stringify(tx))
        });
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
                  console.log('DETELE T2', id)
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
            for (var _kid in kaicontacts) {
              const kaicontact = kaicontacts[_kid];
              const kid = kaicontact.key != null ? kaicontact.key[0] : kaicontact.id;
              console.log(kid, kaicontact)
              if ((metadata[kid] != null && metadata[kid].deleted) || (metadata[kid] == null && kaicontact.key != null)) {
                // delete: kaicontact
                navigator.mozContacts.remove(kaicontact);
                if (metadata[kid] != null) {
                  // delete: person
                  console.log('DETELE T1', kid)
                  deleteList.push(metadata[kid]);
                }
                kaicontactsElapsed--;
                syncLocalcontacts();
              } else if (metadata[kid] && metadata[kid].deleted === false && persons[kid]) {
                if (new Date(metadata[kid].sync_updated) > kaicontact.updated) {
                  console.log('person > kaicontact', kid)
                  // update kaicontact then metadata[kid].sync_updated = updatedContact.updated
                  metadata[kid].hash = kid
                  const data = { person: persons[kid], metadata: metadata[kid], namespace: 'local:people:' + kid }
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
                      // update metadata[kid].hash on desktop app
                      metadata[kid].sync_updated = result[0].updated;
                      syncList.push({ kai_contact: result[0], metadata: metadata[kid] });
                      kaicontactsElapsed--;
                      syncLocalcontacts();
                    }
                  })
                  .catch((err) => {
                    kaicontactsElapsed--;
                    syncLocalcontacts();
                  });
                } else if (new Date(metadata[kid].sync_updated) < kaicontact.updated) {
                  console.log('kaicontact > person', kid)
                  // update person by kaicontact
                  // update metadata[kid].hash on desktop app
                  metadata[kid].sync_updated = kaicontact.updated;
                  syncList.push({ kai_contact: kaicontact, metadata: metadata[kid] });
                  kaicontactsElapsed--;
                  syncLocalcontacts();
                } else {
                  console.log('kaicontact === person', kid)
                  kaicontactsElapsed--;
                  syncLocalcontacts();
                }
              } else if (metadata[kid] == null && kaicontact.key == null) {
                // new kaicontact to app
                var filter = {
                  filterBy: ['category'],
                  filterValue: 'local:people:' + kid,
                  filterOp: 'equals',
                  filterLimit: 1
                };
                kaicontact.key = [kid];
                kaicontact.category = ['local:people:' + kid];
                navigator.mozContacts.save(kaicontact)
                .then(() => {
                  return navigator.mozContacts.find(filter)
                })
                .then((result) => {
                  if (result.length === 0) {
                    kaicontactsElapsed--;
                    syncLocalcontacts();
                  } else {
                    const mt = { sync_id: kid, sync_updated: kaicontact.updated, hash: "new" }
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
        for (var key in data.persons) {
          const p = key;
          console.log(p);
          var filter = {
            filterBy: ['category'],
            filterValue: 'local:people:' + p,
            filterOp: 'equals',
            filterLimit: 1
          };
          navigator.mozContacts.find(filter)
          .then((result) => {
            if (result.length === 0) {
              if (data.metadata[p]) {
                console.log(p, data.metadata[p].sync_id)
                var kaicontact = new mozContact();
                data.metadata[p].hash = data.metadata[p].sync_id;
                const param = { person: data.persons[p], metadata: data.metadata[p], namespace: 'local:people:' + p }
                const addContact = updateContact(kaicontact, param);
                navigator.mozContacts.save(addContact);
              }
            } else {
              console.log('Skip:', 'local:people:' + p)
            }
          });
        }
      } else if (protocol.flag === 9) { // TxSyncSMS9
        console.log("TxSyncSMS:", data);
        syncSMS()
      } else if (protocol.flag === 11) { // TxSendSMS11
        console.log("TxSendSMS:", data)
        let content = data.message;
        let sendOpts = getServiceId(data.iccId)
        // console.log(data.receivers, content, sendOpts)
        let req = navigator.mozSettings.createLock().get('ril.sms.encoding_mode');
        req.onsuccess = ()=> {
          let encodeMode = req.result['ril.sms.encoding_mode'];
          if(encodeMode == "0") {
            content = shift2Normal(content);
          }
          let requests = navigator.mozMobileMessage.send(data.receivers, content, sendOpts);
          let done = requests.length
          console.log("Request Length:", done)
          requests.forEach((request) => {
            request.onsuccess = function(result) {
              done--
              if (done <= 0)
                syncSMS()
            }
            request.onerror = function(err) {
              console.log(err.target.error)
              done--
              if (done <= 0)
                syncSMS()
            }
          })
        };
        req.onerror = function(err) {
          console.log('createLock:', err)
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

  function getServiceId(iccId) {
    let sendOpts = null
    for (var i in navigator.mozMobileConnections) {
      if (navigator.mozMobileConnections[i].iccId === iccId) {
        sendOpts = { serviceId: navigator.mozMobileConnections[i] }
        break
      }
    }
    return sendOpts
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
            if (isLocal) {
              let key = cursor.result.id;
              if (cursor.result.key != null)
                key = cursor.result.key[0]
              kaicontacts[key] = cursor.result
            }
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

  function getIMEI() {
    return new Promise((resolve, reject) => {
      navigator.mozTelephony.dial('*#06#')
      .then(res => {
        res.result
        .then((result) => {
          if (result && result.success && (result.serviceCode === 'scImei')) {
            resolve(result.statusMessage)
          } else {
            reject("")
          }
        })
        .catch(e => reject(e))
      })
      .catch(e => reject(e))
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

  function shift2Normal(content) {
    /* << [ARG-71]: BDC kanxj 20191025 Cyrillic characters are not displayed in SMS in case of reduced character set is selected */
    var shiftTable = new Map([
      [ 0x60, 0x27], // "`" => "'"
      [ 0xc0, 0x41], // "À" => "A"
      [ 0xc1, 0x41], // "Á" => "A"
      [ 0xc2, 0x41], // "Â" => "A"
      [ 0xc3, 0x41], // "Ã" => "A"
      [ 0xc8, 0x45], // "È" => "E"
      [ 0xca, 0x45], // "Ê" => "E"
      [ 0xcb, 0x45], // "Ë" => "E"
      [ 0xcc, 0x49], // "Ì" => "I"
      [ 0xcd, 0x49], // "Í" => "I"
      [ 0xce, 0x49], // "Î" => "I"
      [ 0xcf, 0x49], // "Ï" => "I"
      [ 0xd1, 0x4e], // "Ñ" => "N"
      [ 0xd2, 0x4f], // "Ò" => "O"
      [ 0xd3, 0x4f], // "Ó" => "O"
      [ 0xd4, 0x4f], // "Ô" => "O"
      [ 0xd5, 0x4f], // "Õ" => "O"
      [ 0xd9, 0x55], // "Ù" => "U"
      [ 0xda, 0x55], // "Ú" => "U"
      [ 0xdb, 0x55], // "Û" => "U"
      [ 0xe1, 0x61], // "á" => "a"
      [ 0xe2, 0x61], // "â" => "a"
      [ 0xe3, 0x61], // "ã" => "a"
      [ 0xe7, 0x63], // "ç" => "c"
      [ 0xea, 0x65], // "ê" => "e"
      [ 0xeb, 0x65], // "ë" => "e"
      [ 0xed, 0x69], // "í" => "i"
      [ 0xee, 0x69], // "î" => "i"
      [ 0xef, 0x69], // "ï" => "i"
      [ 0xf3, 0x6f], // "ó" => "o"
      [ 0xf4, 0x6f], // "ô" => "o"
      [ 0xf5, 0x6f], // "õ" => "o"
      [ 0xfa, 0x75], // "ú" => "u"
      [ 0xfb, 0x75], // "û" => "u"
      [ 0xfe, 0x74], // "þ" => "t"
      [ 0x100, 0x41], // "0x100" => "A"
      [ 0x101, 0x61], // "0x101" => "a"
      [ 0x102, 0x41], // "0x102" => "A"
      [ 0x103, 0x61], // "0x103" => "a"
      [ 0x104, 0x41], // "0x104" => "A"
      [ 0x105, 0x61], // "0x105" => "a"
      [ 0x106, 0x43], // "0x106" => "C"
      [ 0x107, 0x63], // "0x107" => "c"
      [ 0x108, 0x43], // "0x108" => "C"
      [ 0x109, 0x63], // "0x109" => "c"
      [ 0x10a, 0x43], // "0x10a" => "C"
      [ 0x10b, 0x63], // "0x10b" => "c"
      [ 0x10c, 0x43], // "0x10c" => "C"
      [ 0x10d, 0x63], // "0x10d" => "c"
      [ 0x10f, 0x64], // "0x10f" => "d"
      [ 0x110, 0x44], // "0x110" => "D"
      [ 0x111, 0x64], // "0x111" => "d"
      [ 0x112, 0x45], // "0x112" => "E"
      [ 0x113, 0x65], // "0x113" => "e"
      [ 0x116, 0x45], // "0x116" => "E"
      [ 0x117, 0x65], // "0x117" => "e"
      [ 0x118, 0x45], // "0x118" => "E"
      [ 0x119, 0x65], // "0x119" => "e"
      [ 0x11a, 0x45], // "0x11a" => "E"
      [ 0x11b, 0x65], // "0x11b" => "e"
      [ 0x11c, 0x47], // "0x11c" => "G"
      [ 0x11d, 0x67], // "0x11d" => "g"
      [ 0x11e, 0x47], // "0x11e" => "G"
      [ 0x11f, 0x67], // "0x11f" => "g"
      [ 0x120, 0x47], // "0x120" => "G"
      [ 0x121, 0x67], // "0x121" => "g"
      [ 0x122, 0x47], // "0x122" => "G"
      [ 0x123, 0x67], // "0x123" => "g"
      [ 0x124, 0x48], // "0x124" => "H"
      [ 0x125, 0x68], // "0x125" => "h"
      [ 0x126, 0x48], // "0x126" => "H"
      [ 0x127, 0x68], // "0x127" => "h"
      [ 0x128, 0x49], // "0x128" => "I"
      [ 0x129, 0x69], // "0x129" => "i"
      [ 0x12a, 0x49], // "0x12a" => "I"
      [ 0x12b, 0x69], // "0x12b" => "i"
      [ 0x12c, 0x49], // "0x12a" => "I"
      [ 0x12d, 0x69], // "0x12b" => "i"
      [ 0x12e, 0x49], // "0x12e" => "I"
      [ 0x12f, 0x69], // "0x12f" => "i"
      [ 0x130, 0x49], // "0x130" => "I"
      [ 0x131, 0x69], // "0x131" => "i"
      [ 0x134, 0x4a], // "0x134" => "J"
      [ 0x135, 0x6a], // "0x135" => "j"
      [ 0x136, 0x4b], // "0x136" => "K"
      [ 0x137, 0x6b], // "0x137" => "k"
      [ 0x138, 0x6b], // "0x138" => "k"
      [ 0x139, 0x4c], // "0x139" => "k"
      [ 0x13a, 0x49], // "0x13a" => "I"
      [ 0x13b, 0x4c], // "0x13b" => "L"
      [ 0x13c, 0x6c], // "0x13c" => "l"
      [ 0x13d, 0x4c], // "0x13d" => "L"
      [ 0x13e, 0x49], // "0x13e" => "I"
      [ 0x13f, 0x4c], // "0x13f" => "L"
      [ 0x140, 0x49], // "0x140" => "I"
      [ 0x141, 0x4c], // "0x141" => "L"
      [ 0x142, 0x6c], // "0x142" => "l"
      [ 0x143, 0x4e], // "0x143" => "N"
      [ 0x144, 0x6e], // "0x144" => "n"
      [ 0x145, 0x4e], // "0x145" => "N"
      [ 0x146, 0x6e], // "0x146" => "n"
      [ 0x147, 0x4e], // "0x147" => "N"
      [ 0x148, 0x6e], // "0x148" => "n"
      [ 0x14c, 0x4f], // "0x14c" => "O"
      [ 0x14d, 0x6f], // "0x14d" => "o"
      [ 0x14e, 0x4f], // "0x14e" => "O"
      [ 0x14f, 0x6f], // "0x14f" => "o"
      [ 0x150, 0x4f], // "0x150" => "O"
      [ 0x151, 0x6f], // "0x151" => "o"
      [ 0x152, 0x4f], // "0x152" => "O"
      [ 0x153, 0x6f], // "0x153" => "o"
      [ 0x156, 0x52], // "0x156" => "R"
      [ 0x157, 0x72], // "0x157" => "r"
      [ 0x158, 0x52], // "0x158" => "R"
      [ 0x159, 0x72], // "0x159" => "r"
      [ 0x15a, 0x53], // "0x15a" => "S"
      [ 0x15b, 0x73], // "0x15b" => "s"
      [ 0x15c, 0x53], // "0x15c" => "S"
      [ 0x15d, 0x73], // "0x15d" => "s"
      [ 0x15e, 0x53], // "0x15e" => "S"
      [ 0x15f, 0x73], // "0x15f" => "s"
      [ 0x160, 0x53], // "0x160" => "S"
      [ 0x161, 0x73], // "0x161" => "s"
      [ 0x162, 0x54], // "0x162" => "T"
      [ 0x163, 0x74], // "0x163" => "t"
      [ 0x164, 0x54], // "0x164" => "T"
      [ 0x165, 0x74], // "0x165" => "t"
      [ 0x166, 0x54], // "0x166" => "T"
      [ 0x167, 0x74], // "0x167" => "t"
      [ 0x168, 0x55], // "0x168" => "U"
      [ 0x169, 0x75], // "0x169" => "u"
      [ 0x16a, 0x55], // "0x16a" => "U"
      [ 0x16b, 0x75], // "0x16b" => "u"
      [ 0x16c, 0x55], // "0x16c" => "U"
      [ 0x16d, 0x75], // "0x16d" => "u"
      [ 0x16e, 0x55], // "0x16e" => "U"
      [ 0x16f, 0x75], // "0x16f" => "u"
      [ 0x170, 0x55], // "0x170" => "U"
      [ 0x171, 0x75], // "0x171" => "u"
      [ 0x172, 0x55], // "0x172" => "U"
      [ 0x173, 0x75], // "0x173" => "u"
      [ 0x174, 0x57], // "0x174" => "W"
      [ 0x175, 0x77], // "0x175" => "w"
      [ 0x176, 0x59], // "0x176" => "Y"
      [ 0x177, 0x79], // "0x177" => "y"
      [ 0x178, 0x59], // "0x178" => "Y"
      [ 0x179, 0x5a], // "0x179" => "Z"
      [ 0x17a, 0x7a], // "0x17a" => "z"
      [ 0x17b, 0x5a], // "0x17b" => "Z"
      [ 0x17c, 0x7a], // "0x17c" => "z"
      [ 0x17d, 0x5a], // "0x17d" => "Z"
      [ 0x17e, 0x7a], // "0x17e" => "z"
      [ 0x218, 0x53], // "0x218" => "S"
      [ 0x219, 0x73], // "0x219" => "s"
      [ 0x21a, 0x54], // "0x21a" => "T"
      [ 0x21b, 0x74], // "0x21b" => "t"
      [ 0x25b, 0x45], // "0x25b" => "E"
      [ 0x1e7c, 0x56], // "0x1e7c" => "V"
      [ 0x1e7d, 0x76], // "0x1e7d" => "v"
      [ 0x1ebc, 0x45], // "0x1ebc" => "E"
      [ 0x1ebd, 0x65], // "0x1ebd" => "e"
      [ 0x1ef8, 0x59], // "0x1ebd" => "Y"
      [ 0x1ef9, 0x79], // "0x1ef9" => "y"
      [ 0x20a4, 0xa3], // "0x20a4" => "£"
    ]);
    /* >> [BTS-1676] */

    var content2 = "";
    var normalChar = "";
    for(var i = 0; i < content.length; i++  ){
      var letter = content.charAt(i);
      let letterCode = letter.charCodeAt();
      letterCode = shiftTable.get(letterCode);
      normalChar = String.fromCharCode(letterCode);

      if (typeof(normalChar) == "undefined" || typeof(letterCode) == "undefined"){
        normalChar = letter;
      }
      content2  += normalChar;
    }
    /* >> [ARG-71] */
    return content2;
  }

  navigator.mozSetMessageHandler('sms-received', function(sms) {
    syncSMS() 
  })

  navigator.mozSetMessageHandler('sms-sent', function(sms) {
    syncSMS() 
  })

</script>

<main id="home-screen" data-pad-top="28" data-pad-bottom="30">
  <Separator title="Configuration" />
  <TextInputField className="{navClass}" label="Ip Address" placeholder="Placeholder" value="{ipAddress}" type="text" onInput="{onInputIp}" onFocus="{onFocusIp}" onBlur="{onBlurIp}" />
  <TextInputField className="{navClass}" label="Port" placeholder="Placeholder" value="{port}" type="tel" onInput="{onInputPort}" onFocus="{onFocusPort}" onBlur="{onBlurPort}" />
  <Button className="{navClass}" text="{conBtnLabel}" onClick={toggleConnection}>
    <span slot="rightWidget" class="kai-icon-arrow" style="margin:0px 5px;"></span>
  </Button>
  <ListView className="{navClass}" title="{getAppProp().localization.langByLocale('change_locale', locale)}" subtitle="{getAppProp().localization.langByLocale('change_locale_subtitle', locale)}" onClick={changeLocale}/>
  <Button className="{navClass}" text="Exit" onClick={onButtonExit}>
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
