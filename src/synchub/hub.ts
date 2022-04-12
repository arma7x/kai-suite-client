declare var navigator:any;
declare var XMLHttpRequest:any;
declare var mozContact:any;

type StatusListenerFn = (status: boolean) => void;

import { isValidIpPort, updateContact, clone, getSIMServiceId, shift2Normal, getMessageSegments, showNotification, getIMEI, getKaiContacts } from "./utils"
import uaparser from 'ua-parser-js';

class SyncHub {

  ws; any;
  status: boolean = false;
  ipAddress: string;
  port: string;
  statusListener: Array<StatusListenerFn> = [];
 
  constructor() {
    navigator.mozSetMessageHandler('sms-received', () => {
      this.syncSMS() 
    })
    navigator.mozSetMessageHandler('sms-sent', () => {
      this.syncSMS() 
    })
  }

  connect(ipAddress: string, port: string) {
    if (isValidIpPort(ipAddress, port) === true && this.status === false) {
      this.ipAddress = ipAddress
      this.port = port
      this.ws = new WebSocket(`ws://${this.ipAddress}:${this.port}/`)

      this.ws.onopen = () => {
        const ua = uaparser(navigator.userAgent)
        const data = { device: [ua.device.vendor, ua.device.model].join(' '), imei: new Date().getTime().toString() }
        this.ws.send(JSON.stringify({ flag: 0, data: JSON.stringify(data) }))
        this.syncSMS()
        this.status = true
        this.statusListener.forEach((fn) => {
          fn(this.status)
        })
      }

      this.ws.onclose = () => {
        this.ws = null
        this.status = false
        this.statusListener.forEach((fn) => {
          fn(this.status)
        })
      }

      this.ws.onerror = () => {
        this.ws.close()
        this.ws = null
        this.status = false
        this.statusListener.forEach((fn) => {
          fn(this.status)
        })
      }

      this.ws.onmessage = (event) => {
        var protocol = JSON.parse(event.data)
        var data;
        try {
          data = JSON.parse(protocol.data)
        } catch (e) {
          data = protocol.data
        }
        console.log("Flag:", protocol.flag)
        if (protocol.flag === 1) { // TxSyncGoogleContact
          const filter = {
            filterBy: ['category'],
            filterValue: data.namespace,
            filterOp: 'equals',
            filterLimit: 1
          };
          navigator.mozContacts.find(filter)
          .then(contact => {
            if (contact.length === 0) {
              if (data.metadata.sync_id != null || data.metadata.sync_updated != null || data.metadata.deleted) {
                // console.log( "Deleted KaiContact:", data.metadata)
                const txd = { namespace: data.namespace, sync_id: data.metadata.sync_id, sync_updated: data.metadata.sync_updated }
                const tx = { flag: 6, data: JSON.stringify(txd) }
                this.ws.send(JSON.stringify(tx))
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
                  this.ws.send(JSON.stringify(tx))
                } else {
                  const txd = { namespace: data.namespace, sync_id: result[0].id, sync_updated: result[0].updated }
                  const tx = { flag: 2, data: JSON.stringify(txd) }
                  this.ws.send(JSON.stringify(tx))
                }
              })
              .catch((err) => {
                const txd = { namespace: data.namespace, sync_id: "error", sync_updated: err.toString() }
                const tx = { flag: 2, data: JSON.stringify(txd) }
                this.ws.send(JSON.stringify(tx))
              });
              // console.log("Add to KaiContact:", data.namespace, kaicontact, data.person)
            } else {
              if (data.metadata.deleted) {
                // console.log(0, "Delete KaiContact:", data.metadata, contact[0])
                navigator.mozContacts.remove(contact[0]);
                const txd = { namespace: data.namespace, sync_id: data.metadata.sync_id, sync_updated: data.metadata.sync_updated }
                const tx = { flag: 6, data: JSON.stringify(txd) }
                this.ws.send(JSON.stringify(tx))
              } else if (data.metadata.hash != contact[0].key[0]) {
                // console.log(1, "Update KaiContact:", data.metadata, contact[0])
                var kaicontact = updateContact(contact[0], data);
                navigator.mozContacts.save(kaicontact)
                .then(() => {
                  return navigator.mozContacts.find(filter)
                })
                .then((result) => {
                  if (result.length === 0) {
                    const txd = { namespace: data.namespace, sync_id: "error", sync_updated: "Updated KaiContact but not found by category" }
                    const tx = { flag: 2, data: JSON.stringify(txd) }
                    this.ws.send(JSON.stringify(tx))
                  } else {
                    const txd = { namespace: data.namespace, sync_id: result[0].id, sync_updated: result[0].updated }
                    const tx = { flag: 2, data: JSON.stringify(txd) }
                    this.ws.send(JSON.stringify(tx))
                  }
                })
                .catch((err) => {
                  const txd = { namespace: data.namespace, sync_id: "error", sync_updated: err.toString() }
                  const tx = { flag: 2, data: JSON.stringify(txd) }
                  this.ws.send(JSON.stringify(tx))
                });
              } else if (contact[0].updated > new Date(data.metadata.sync_updated)) {
                // console.log(2, "Update KaiContact:", data.metadata, contact[0])
                const txd = { namespace: data.namespace, kai_contact: contact[0] }
                const tx = { flag: 4, data: JSON.stringify(txd) }
                this.ws.send(JSON.stringify(tx))
              } else {
                // console.log(3, "Update KaiContact:", data.metadata, contact[0])
                const txd = { namespace: data.namespace, sync_id: data.metadata.sync_id, sync_updated: data.metadata.sync_updated }
                const tx = { flag: 2, data: JSON.stringify(txd) }
                this.ws.send(JSON.stringify(tx))
              }
            }
          })
          .catch((err) => {
            // console.log("Error KaiContact:", data.namespace, err)
            const txd = { namespace: data.namespace, sync_id: "error", sync_updated: err.toString() }
            const tx = { flag: 2, data: JSON.stringify(txd) }
            this.ws.send(JSON.stringify(tx))
          });
        } else if (protocol.flag === 3) { // TxRestoreGoogleContact3
          // console.log("TxRestoreGoogleContact:", data)
          const filter = {
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
                  const tx = { flag: 8, data: JSON.stringify(txd) }
                  this.ws.send(JSON.stringify(tx))
                } else {
                  const txd = { namespace: data.namespace, sync_id: result[0].id, sync_updated: result[0].updated }
                  const tx = { flag: 8, data: JSON.stringify(txd) }
                  this.ws.send(JSON.stringify(tx))
                }
              })
              .catch((err) => {
                const txd = { namespace: data.namespace, sync_id: "error", sync_updated: err.toString() }
                const tx = { flag: 8, data: JSON.stringify(txd) }
                this.ws.send(JSON.stringify(tx))
              });
              // console.log("Restore KaiContact:", data.namespace, kaicontact, data.person)
            } else {
              // console.log("Skip Restore KaiContact:", data.namespace)
              const txd = { namespace: data.namespace, sync_id: "error", sync_updated: "skip" }
              const tx = { flag: 8, data: JSON.stringify(txd) }
              this.ws.send(JSON.stringify(tx))
            }
          })
          .catch((err) => {
            // console.log("Error Restore KaiContact:", data.namespace, err)
            const txd = { namespace: data.namespace, sync_id: "error", sync_updated: err.toString() }
            const tx = { flag: 8, data: JSON.stringify(txd) }
            this.ws.send(JSON.stringify(tx))
          });
        } else if (protocol.flag === 5) { // TxSyncLocalContact5
          let pushList = []; // {kaicontact, metadata}
          let syncList = []; // {kaicontact, metadata}
          let mergedList = [];   // {kaicontact, metadata, person}
          let deleteList = []; // metadata

          this.getServerLocalContacts()
          .then((res) => {
            data.persons = res.persons;
            data.metadata = res.metadata;
            // console.log("TxSyncLocalContact:", Object.keys(data.persons).length, Object.keys(data.metadata).length);
            return getKaiContacts()
          })
          .then((kaicontacts) => {

            const sync = () => {
              if (kaicontactsElapsed <= 0) {
                // if metadata not exist in kaicontacts, probably kaicontact was deleted
                for (var mid in metadata) {
                  if (metadata[mid].sync_id != null && kaicontacts[metadata[mid].sync_id] == null) {
                    console.log('DELETE T2', mid);
                    deleteList.push(metadata[mid]);
                  } else if (metadata[mid].sync_id == null && kaicontacts[metadata[mid].sync_id] == null) {
                    console.log('ADD TO KAICONTACT', persons[mid]); // TODO
                    //  var kaicontact = new mozContact();
                    //  metadata[mid].hash = mid;
                    //  const param = { person: persons[mid], metadata: metadata[mid], namespace: 'local:people:' + mid }
                    //  const addContact = updateContact(kaicontact, param);
                    // syncList.push({ kai_contact: result[0], metadata: metadata[kid] });
                  } else {
                    console.log('UP-TO-DATE', mid)
                  }
                }
                // console.log('pushList:', pushList);
                // console.log('syncList:', syncList);
                // console.log('deleteList:', deleteList);
                // console.log('mergedList:', mergedList);
                const txd = { push_list: pushList, sync_list: syncList, merged_list: mergedList, delete_list: deleteList }
                const tx = { flag: 10, data: JSON.stringify(txd) }
                this.ws.send(JSON.stringify(tx))
              }
            }

            const metadata = data.metadata;
            const persons = data.persons;
            let kaicontactsElapsed = Object.keys(kaicontacts).length;
            // console.log('kaicontacts:', Object.keys(kaicontacts).length);
            // console.log('persons:', Object.keys(data.persons).length);
            // console.log('metadata:', Object.keys(data.metadata).length);

            if (kaicontactsElapsed > 0) {
              for (var _kid in kaicontacts) {
                const kaicontact = kaicontacts[_kid];
                const kid = kaicontact.key != null ? kaicontact.key[0] : kaicontact.id;
                // console.log(kid, kaicontact)
                if (metadata[kid] != null && metadata[kid].deleted) {
                  // delete: kaicontact
                  navigator.mozContacts.remove(kaicontact);
                  if (metadata[kid] != null) {
                    // delete: person
                    console.log('DELETE T1', kid)
                    deleteList.push(metadata[kid]);
                  }
                  kaicontactsElapsed--;
                  sync();
                } else if (metadata[kid] && metadata[kid].deleted === false && persons[kid]) {
                  if (new Date(metadata[kid].sync_updated) > kaicontact.updated) {
                    // console.log('person > kaicontact', kid)
                    // update kaicontact then metadata[kid].sync_updated = updatedContact.updated
                    metadata[kid].hash = kid
                    const data = { person: persons[kid], metadata: metadata[kid], namespace: 'local:people:' + kid }
                    const updatedContact = updateContact(kaicontact, data)
                    const filter = {
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
                        sync();
                      } else {
                        // update metadata[kid].hash on desktop app
                        metadata[kid].sync_updated = result[0].updated;
                        syncList.push({ kai_contact: result[0], metadata: metadata[kid] });
                        kaicontactsElapsed--;
                        sync();
                      }
                    })
                    .catch((err) => {
                      kaicontactsElapsed--;
                      sync();
                    });
                  } else if (new Date(metadata[kid].sync_updated) < kaicontact.updated) {
                    // console.log('kaicontact > person', kid)
                    // update person by kaicontact
                    // update metadata[kid].hash on desktop app
                    metadata[kid].sync_updated = kaicontact.updated;
                    syncList.push({ kai_contact: kaicontact, metadata: metadata[kid] });
                    kaicontactsElapsed--;
                    sync();
                  } else {
                    // console.log('kaicontact === person', kid)
                    kaicontactsElapsed--;
                    sync();
                  }
                } else if (metadata[kid] == null || kaicontact.key == null) {
                  // new kaicontact to app
                  const filter = {
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
                      sync();
                    } else {
                      const mt = { sync_id: kid, sync_updated: kaicontact.updated, hash: "new" }
                      pushList.push({ kai_contact: result[0], metadata: mt });
                      kaicontactsElapsed--;
                      sync();
                    }
                  })
                  .catch((err) => {
                    kaicontactsElapsed--;
                    sync();
                  });
                } else {
                  console.warn('TRACE', kaicontact);
                  kaicontactsElapsed--;
                  sync();
                }
              }
            } else {
              sync();
            }
          })
          .catch((err) => {
            console.warn(err)
            // console.log('pushList:', []);
            // console.log('syncList:', []);
            // console.log('deleteList:', []);
            // console.log('mergedList:', []);
            const txd = { push_list: pushList, sync_list: syncList, merged_list: mergedList, delete_list: deleteList }
            const tx = { flag: 10, data: JSON.stringify(txd) }
            this.ws.send(JSON.stringify(tx))
          })
        } else if (protocol.flag === 7) { // TxRestoreLocalContact7
          // console.log("TxRestoreLocalContacts:", data)

          let syncList = []; // {kaicontact, metadata}
          let pushList = []; // {kaicontact, metadata}

          const restore = () => {
            // console.log("START RESTORE")
            getKaiContacts()
            .then((kaicontacts) => {
              // console.log(kaicontacts)
              let kaicontactsElapsed = Object.keys(kaicontacts).length;
              // console.log('kaicontacts:', kaicontactsElapsed)
              if (kaicontactsElapsed > 0) {
                for (var _kid in kaicontacts) {
                  const kaicontact = kaicontacts[_kid];
                  const kid = kaicontact.key != null ? kaicontact.key[0] : kaicontact.id;
                  // console.log(kid, kaicontact.key, data.metadata[kid])
                  if (data.metadata[kid] == null || kaicontact.key == null) {
                    // new kaicontact to app
                    const filter = {
                      filterBy: ['category'],
                      filterValue: 'local:people:' + kid,
                      filterOp: 'equals',
                      filterLimit: 1
                    };
                    // console.log("PushList:", filter.filterValue)
                    kaicontact.key = [kid];
                    kaicontact.category = ['local:people:' + kid];
                    navigator.mozContacts.save(kaicontact)
                    .then(() => {
                      return navigator.mozContacts.find(filter)
                    })
                    .then((result) => {
                      if (result.length === 0) {
                        kaicontactsElapsed--;
                        if (kaicontactsElapsed <= 0) {
                          console.log(1, 'pushList:', pushList, 'syncList:', syncList);
                          const txd = { push_list: pushList, sync_list: syncList, merged_list: [], delete_list: [] }
                          const tx = { flag: 10, data: JSON.stringify(txd) }
                          this.ws.send(JSON.stringify(tx))
                        }
                      } else {
                        // console.log("Pushed:", result[0].id)
                        const mt = { sync_id: kid, sync_updated: kaicontact.updated, hash: "new" }
                        pushList.push({ kai_contact: result[0], metadata: mt });
                        kaicontactsElapsed--;
                        if (kaicontactsElapsed <= 0) {
                          console.log(2, 'pushList:', pushList, 'syncList:', syncList);
                          const txd = { push_list: pushList, sync_list: syncList, merged_list: [], delete_list: [] }
                          const tx = { flag: 10, data: JSON.stringify(txd) }
                          this.ws.send(JSON.stringify(tx))
                        }
                      }
                    })
                    .catch((err) => {
                      kaicontactsElapsed--;
                      if (kaicontactsElapsed <= 0) {
                        console.log(3, 'pushList:', pushList, 'syncList:', syncList);
                        const txd = { push_list: pushList, sync_list: syncList, merged_list: [], delete_list: [] }
                        const tx = { flag: 10, data: JSON.stringify(txd) }
                        this.ws.send(JSON.stringify(tx))
                      }
                    });
                  } else {
                    kaicontactsElapsed--;
                    if (kaicontactsElapsed <= 0) {
                      console.log(4, 'pushList:', pushList, 'syncList:', syncList);
                      const txd = { push_list: pushList, sync_list: syncList, merged_list: [], delete_list: [] }
                      const tx = { flag: 10, data: JSON.stringify(txd) }
                      this.ws.send(JSON.stringify(tx))
                    }
                  }
                }
              } else {
                console.log(5, 'pushList:', pushList, 'syncList:', syncList);
                const txd = { push_list: pushList, sync_list: syncList, merged_list: [], delete_list: [] }
                const tx = { flag: 10, data: JSON.stringify(txd) }
                this.ws.send(JSON.stringify(tx))
              }
            })
            .catch((err) => {
              console.warn(err)
              // console.log('pushList:', pushList);
              const txd = { push_list: pushList, sync_list: syncList, merged_list: [], delete_list: [] }
              const tx = { flag: 10, data: JSON.stringify(txd) }
              this.ws.send(JSON.stringify(tx))
            })
          }

          this.getServerLocalContacts()
          .then((res) => {

            data.persons = res.persons;
            data.metadata = res.metadata;
            // console.log("TxRestoreLocalContacts:", Object.keys(data.persons).length, Object.keys(data.metadata).length);
            let elapsed = Object.keys(data.persons).length;
            if (elapsed > 0) {
              for (var key in data.persons) {
                const p = key;
                const filter = {
                  filterBy: ['category'],
                  filterValue: 'local:people:' + p,
                  filterOp: 'equals',
                  filterLimit: 1
                };
                navigator.mozContacts.find(filter)
                .then((result) => {
                  if (result.length === 0) {
                    if (data.metadata[p]) {
                      // console.log("Restore", p, data.metadata[p].sync_id)
                      var kaicontact = new mozContact();
                      data.metadata[p].hash = p;
                      const param = { person: data.persons[p], metadata: data.metadata[p], namespace: 'local:people:' + p }
                      const addContact = updateContact(kaicontact, param);
                      navigator.mozContacts.save(addContact)
                      .then(() => {
                        data.metadata[p].sync_id = p
                        let cloned = addContact.toJSON()
                        cloned.updated = new Date().toISOString()
                        syncList.push({ kai_contact: cloned, metadata: data.metadata[p] })
                        elapsed--
                        // console.log('Ok Save:', elapsed)
                        if (elapsed === 0) {
                          restore()
                        }
                      })
                      .catch((err) => {
                        elapsed--
                        if (elapsed === 0) {
                          restore()
                        }
                        console.log('Err Save:', elapsed, err)
                      });
                    }
                  } else {
                    elapsed--
                    if (elapsed === 0) {
                      restore()
                    }
                    // console.log('Skip:', 'local:people:' + p)
                  }
                })
                //.catch(() => {
                  //elapsed--
                  //if (elapsed === 0) {
                    //showNotification("Restore", "Successfully executed", true, true)
                  //}
                  //console.log('Err find:', elapsed)
                //})
              }
            } else {
              restore()
            }
          })
          .catch(err => {
            console.warn(err)
            restore()
          })
        } else if (protocol.flag === 9) { // TxSyncSMS9
          // console.log("TxSyncSMS:", data);
          this.syncSMS()
        } else if (protocol.flag === 11) { // TxSendSMS11
          // console.log("TxSendSMS:", data)
          let sendOpts = getSIMServiceId(data.iccId)
          getMessageSegments(data.message)
          .then((segments) => {
            this.processMessageSegments(data.receivers, segments, sendOpts);
          })
          .catch((err) => {
            console.warn(err)
          });
        } else if (protocol.flag === 13) { // TxSyncSMSRead13
          if (data.id != null) {
            // console.log("TxSyncSMSRead13:", data)
            data.id.forEach(id => {
              const req = navigator.mozMobileMessage.markMessageRead(id, true)
              req.onsuccess = () => {
                // console.log("Success markMessageRead", id);
              }
              req.onerror = () => {
                // console.log("Error markMessageRead", id);
              }
            })
          }
        } else if (protocol.flag === 15) { // TxSyncSMSDelete15
          // console.log("TxSyncSMSDelete15:", data.id)
          const req = navigator.mozMobileMessage.delete(data.id)
          req.onsuccess = () => {
            this.syncSMS()
          }
          req.onerror = () => {
            this.syncSMS()
          }
        }
      }
    }
  }

  addStatusListener(fn: StatusListenerFn) {
    this.statusListener.push(fn);
  }
 
  removeStatusListener(fn: StatusListenerFn) {
    const index = this.statusListener.indexOf(fn);
    if (index > -1) {
      this.statusListener.splice(index, 1);
    }
  }

  getServerLocalContacts(): Promise<any> {
    if (isValidIpPort(this.ipAddress, this.port) === true) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest({ mozSystem: true });
        const url = new URL(`http://${this.ipAddress}:${this.port}/local-contacts`);
        xhr.onreadystatechange = () => {
          if (xhr.readyState == 4) {
            if (xhr.status >= 200 && xhr.status <= 399) {
              const response = JSON.parse(xhr.response);
              resolve(response);
            } else {
              reject(xhr.response);
            }
          }
        };
        xhr.onerror = () => {
          reject(xhr.response)
        };
        xhr.open("GET", url, true);
        xhr.send();
      });
    } else {
      return Promise.reject("Invalid IP address");
    }
  }

  processMessageSegments(receivers, segments, sendOpts) {
    if (segments.length === 0) {
      this.syncSMS()
    } else {
      let content = segments.pop()
      this.sendSMS(receivers, content, sendOpts)
      .finally(() => {
        this.processMessageSegments(receivers, segments, sendOpts)
      });
    }
  }

  sendSMS(receivers, content, sendOpts): Promise<Error|void> {
    return new Promise((resolve, reject) => {
      let req = navigator.mozSettings.createLock().get('ril.sms.encoding_mode');
      req.onsuccess = ()=> {
        let encodeMode = req.result['ril.sms.encoding_mode'];
        if(encodeMode == "0") {
          content = shift2Normal(content);
        }
        let requests = navigator.mozMobileMessage.send(receivers, content, sendOpts);
        let done = requests.length
        // console.log("Request Length:", done)
        requests.forEach((request) => {
          request.onsuccess = function(result) {
            done--
            if (done <= 0)
              resolve()
          }
          request.onerror = function(err) {
            done--
            if (done <= 0)
              resolve()
          }
        })
      };
      req.onerror = function(err) {
        reject(err)
      }
    })
  }

  syncSMS() {
    if (this.ws != null) {
      this.getSMS()
      .then(result => {
        // console.log(result)
        const tx = { flag: 12, data: JSON.stringify(result) }
        this.ws.send(JSON.stringify(tx))
      })
      .catch(err => {
        console.warn(err)
      })
    }
  }

  getSMS() {
    return new Promise((resolve, reject) => {
      var threads = {}
      var messages = {}
      var cursorThread = navigator.mozMobileMessage.getThreads()
      cursorThread.onsuccess = function() {
        if (!cursorThread.done) {
          if(cursorThread.result !== null) {
            threads[cursorThread.result.id] = clone(cursorThread.result)
            messages[cursorThread.result.id] = []
            var cursorMessage = navigator.mozMobileMessage.getMessages({ threadId: cursorThread.result.id }, false)
            cursorMessage.onsuccess = function() {
              if (!cursorMessage.done) {
                if (cursorMessage.result !== null && cursorMessage.result.type == 'sms') {
                  messages[cursorThread.result.id].push(clone(cursorMessage.result))
                  cursorMessage.continue()
                }
              } else if (cursorMessage.done) {
                cursorThread.continue()
              }
            }
            cursorMessage.onerror = (err) => {
              console.warn(err)
              cursorThread.continue()
            }
          }
        } else if (cursorThread.done) {
          resolve({threads, messages})
        }
      }
      cursorThread.onerror = (err) => {
        console.warn(err)
        reject(reject)
      }
    })
  }
}

export {
  SyncHub as default
}
