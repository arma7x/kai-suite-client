<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { navigate as goto } from "svelte-navigator";
  import { createKaiNavigator } from '../utils/navigation';
  import { SoftwareKey, ListView, Separator, TextInputField, TextAreaField, DatePicker, TimePicker} from '../components';

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
      if (inputSoftwareKey)
        return;
        console.log(summary)
        console.log(description)
        console.log(startDate)
        console.log(endDate)
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

  function openDatePicker(value) {
    datePicker = new DatePicker({
      target: document.body,
      props: {
        title: 'Date Picker',
        date: value,
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
          value = date;
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

  function openTimePicker(value) {
    timePicker = new TimePicker({
      target: document.body,
      props: {
        title: 'Time Picker',
        date: value,
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
          value = date;
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

  function saveEvent() {
    // TODO
  }

</script>

<main id="add-event-screen" data-pad-top="28" data-pad-bottom="30">
  <TextInputField className="addEventNav" label="Title" placeholder="Enter event title" value="{summary}" type="text" onInput="{onInputTitle}" {onFocus} {onBlur} />
  <TextAreaField className="addEventNav" label="Description" placeholder="Enter event description" value="{description}" type="text" rows={2} onInput="{onInputDesc}" {onFocus} {onBlur}/>
  <Separator title="Start" />
  <ListView className="addEventNav" title="Date" subtitle="{startDate.toDateString()}" onClick={() => openDatePicker(startDate)}>
    <span slot="rightWidget" class="kai-icon-calendar" style="font-size:20px;"></span>
  </ListView>
  <ListView className="addEventNav" title="Time" subtitle="{startDate.toLocaleTimeString()}" onClick={() => openTimePicker(startDate)}>
    <span slot="rightWidget" class="kai-icon-favorite-on" style="font-size:20px;"></span>
  </ListView>
  <Separator title="End" />
  <ListView className="addEventNav" title="Date" subtitle="{endDate.toDateString()}" onClick={() => openDatePicker(endDate)}>
    <span slot="rightWidget" class="kai-icon-calendar" style="font-size:20px;"></span>
  </ListView>
  <ListView className="addEventNav" title="Time" subtitle="{endDate.toLocaleTimeString()}" onClick={() => openTimePicker(endDate)}>
    <span slot="rightWidget" class="kai-icon-favorite-on" style="font-size:20px;"></span>
  </ListView>
</main>

<style>
  #add-event-screen {
    overflow: scroll;
    width: 100%;
  }
</style>
