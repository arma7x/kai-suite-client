<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { navigate as goto } from "svelte-navigator";
  import { createKaiNavigator } from '../utils/navigation';
  import { SoftwareKey, ListView, Separator, TextInputField, TextAreaField, DatePicker, TimePicker} from '../components';
  import * as localforage from 'localforage';

  export let location: any;
  export let navigate: any;
  export let getAppProp: Function;

  let name: string = 'Add Event';
  let inputSoftwareKey: SoftwareKey;
  let datePicker: DatePicker;
  let timePicker: DatePicker;
  let summary: string = '';
  let description: string = '';
  let startDate: Date = new Date();
  let endDate: Date = new Date(new Date().getTime() + 3600000);

  let navOptions = {
    verticalNavClass: 'addEventNav',
    softkeyLeftListener: function(evt) {
      if (inputSoftwareKey)
        return;
      evt.preventDefault();
      goto(-1);
    },
    softkeyRightListener: function(evt) {
      const MN = '12:00:00 AM';
      if (inputSoftwareKey)
        return;
      if (endDate <= startDate)
        return;
      var evtObj = {
        id: 'local_' + new Date().getTime().toString(),
        start: {},
        end: {},
      }
      if (summary.trim()) {
        evtObj['summary'] = summary.trim();
      }
      if (description.trim()) {
        evtObj['description'] = description.trim();
      }
      if (endDate.getTime() - startDate.getTime() === 86400000 && endDate.toLocaleTimeString() === MN && startDate.toLocaleTimeString() === MN) {
        const offset = -((new Date().getTimezoneOffset()) * 60000);
        evtObj['start']['date'] = new Date(startDate.getTime() + offset).toISOString().split('T')[0];
        evtObj['end']['date'] = new Date(endDate.getTime() + offset).toISOString().split('T')[0];
      } else {
        evtObj['start']['dateTime'] = startDate.toISOString();
        evtObj['end']['dateTime'] = endDate.toISOString();
      }
      const EVENTS = localforage.createInstance({ name : "EVENTS" })
      EVENTS.getItem('local')
      .then((evts:any) => {
        if (evts == null) {
          evts = []
        }
        evts = [...evts, evtObj];
        return EVENTS.setItem('local', evts);
      })
      .then(() => {
        goto(-1);
      })
      .catch((err) => {
        console.log(err)
      });
    },
    enterListener: function(evt) {
      if (inputSoftwareKey)
        return;
      const navClasses = document.getElementsByClassName('addEventNav');
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
    navInstance.attachListener();
    const { appBar, softwareKey } = getAppProp();
    appBar.setTitleText(name);
    softwareKey.setText({ left: 'Cancel', center: 'SELECT', right: 'Save' });
  })

  onDestroy(() => {
    navInstance.detachListener();
  })

  function onFocus(evt) {
    inputSoftwareKey = new SoftwareKey({
      target: document.body,
      props: {
        isInvert: true,
        leftText: '',
        centerText: 'Enter',
        rightText: ''
      }
    });
  }

  function onBlur(evt) {
    if (inputSoftwareKey) {
      inputSoftwareKey.$destroy();
      inputSoftwareKey = null;
    }
  }

  function onInputTitle(evt) {
    summary = evt.target.value.trim().toString();
  }

  function onInputDesc(evt) {
    description = evt.target.value.trim().toString();
  }

  function openDatePicker(value, callback = () => {}) {
    datePicker = new DatePicker({
      target: document.body,
      props: {
        title: 'Date Picker',
        date: value,
        softKeyLeftText: 'Cancel',
        softKeyCenterText: 'save',
        onSoftkeyLeft: (evt, date) => {
          datePicker.$destroy();
        },
        onSoftkeyRight: (evt, date) => {},
        onEnter: (evt, date) => {
          callback(date);
          datePicker.$destroy();
        },
        onBackspace: (evt, date) => {
          evt.preventDefault();
          evt.stopPropagation();
          datePicker.$destroy();
        },
        onOpened: () => {
          navInstance.detachListener();
        },
        onClosed: (date) => {
          navInstance.attachListener();
          datePicker = null;
        }
      }
    });
  }

  function openTimePicker(value, callback = () => {}) {
    timePicker = new TimePicker({
      target: document.body,
      props: {
        title: 'Time Picker',
        date: value,
        is12HourSystem: true,
        softKeyLeftText: 'Cancel',
        softKeyCenterText: 'save',
        onSoftkeyLeft: (evt, date) => {
          timePicker.$destroy();
        },
        onSoftkeyRight: (evt, date) => {},
        onEnter: (evt, date) => {
          callback(date);
          timePicker.$destroy();
        },
        onBackspace: (evt, date) => {
          evt.preventDefault();
          evt.stopPropagation();
          timePicker.$destroy();
        },
        onOpened: () => {
          navInstance.detachListener();
        },
        onClosed: (date) => {
          navInstance.attachListener();
          timePicker = null;
        }
      }
    });
  }

  function saveEvent() {
    // TODO
  }

</script>

<main id="add-event-screen" data-pad-top="28" data-pad-bottom="30">
  <TextInputField className="addEventNav" label="Title" placeholder="Enter event title" value="{summary}" type="text" onInput="{onInputTitle}" {onFocus} {onBlur} />
  <TextAreaField className="addEventNav" label="Description" placeholder="Enter event description" value="{description}" type="text" rows={2} onInput="{onInputDesc}" {onFocus} {onBlur}/>
  <Separator title="Start" />
  <ListView className="addEventNav" title="Date" subtitle="{startDate.toDateString()}" onClick={() => {
    openDatePicker(startDate, (val) => {
      startDate = val;
    })
  }}>
    <span slot="rightWidget" class="kai-icon-calendar" style="font-size:20px;"></span>
  </ListView>
  <ListView className="addEventNav" title="Time" subtitle="{startDate.toLocaleTimeString()}" onClick={() => {
    openTimePicker(startDate, (val) => {
      startDate = val;
    });
  }}>
    <span slot="rightWidget" class="kai-icon-favorite-on" style="font-size:20px;"></span>
  </ListView>
  <Separator title="End" />
  <ListView className="addEventNav" title="Date" subtitle="{endDate.toDateString()}" onClick={() => {
    openDatePicker(endDate, (val) => {
      endDate = val;
    });
  }}>
    <span slot="rightWidget" class="kai-icon-calendar" style="font-size:20px;"></span>
  </ListView>
  <ListView className="addEventNav" title="Time" subtitle="{endDate.toLocaleTimeString()}" onClick={() => {
    openTimePicker(endDate, (val) => {
      endDate = val;
    });
  }}>
    <span slot="rightWidget" class="kai-icon-favorite-on" style="font-size:20px;"></span>
  </ListView>
</main>

<style>
  #add-event-screen {
    overflow: scroll;
    width: 100%;
  }
</style>
