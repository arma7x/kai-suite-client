<script lang="ts">
  import { Route, navigate as goto } from "svelte-navigator";
  import { createKaiNavigator } from '../utils/navigation';
  import { OptionMenu, ListView, Separator, Button, TextInputField, SoftwareKey } from '../components';
  import { onMount, onDestroy } from 'svelte';
  import uaparser from 'ua-parser-js';

  const navClass: string = 'homeNav';
  export let location: any;
  export let navigate: any;
  export let getAppProp: Function;

  let currentLocale: string;
  let name: string = 'Kai Suite';
  let ipAddress: string = '192.168.43.33';
  let port: string = '4444';
  let conBtnLabel: string = 'Connect';
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
    },
    softkeyRightListener: function(evt) {
      if (inputSoftwareKey)
        return;
      navigateHandler('addEventForm');
    },
    enterListener: function(evt) {
      if (inputSoftwareKey)
        return;
      const navClasses = document.getElementsByClassName(navClass);
      if (navClasses[this.verticalNavIndex] != null) {
        navClasses[this.verticalNavIndex].click();
      }
    },
    backspaceListener: function(evt) {},
    arrowLeftListener: function(evt) {},
    arrowRightListener: function(evt) {},
  };

  let navInstance = createKaiNavigator(navOptions);

  function onButtonExit(evt) {
    window.close();
  }

  function onFocusIp(evt) {
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

  function onBlurIp(evt) {
    if (inputSoftwareKey) {
      inputSoftwareKey.$destroy();
      inputSoftwareKey = null;
    }
  }

  function onInputIp(evt) {
    ipAddress = evt.target.value.toString();
  }

  function onFocusPort(evt) {
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

  function onBlurPort(evt) {
    if (inputSoftwareKey) {
      inputSoftwareKey.$destroy();
      inputSoftwareKey = null;
    }
  }

  function onInputPort(evt) {
    port = evt.target.value.toString();
  }

  function changeLocale() {
    const idx = locales.findIndex((o) => {
      return o.subtitle === currentLocale || 0;
    })
    localeMenu = new OptionMenu({
      target: document.body,
      props: {
        title: getAppProp().localization.lang('select_locale'),
        focusIndex: idx,
        options: locales,
        softKeyCenterText: 'select',
        onSoftkeyRight: (evt, scope) => {},
        onSoftkeyLeft: (evt, scope) => {},
        onEnter: (evt, scope) => {
          getAppProp().localization.loadLocale(scope.selected.subtitle);
          currentLocale = getAppProp().localization.defaultLocale;
          localeMenu.$destroy();
        },
        onBackspace: (evt, scope) => {
          evt.preventDefault();
          evt.stopPropagation();
          localeMenu.$destroy();
        },
        onOpened: () => {
          navInstance.detachListener();
        },
        onClosed: (scope) => {
          navInstance.attachListener();
          localeMenu = null;
        }
      }
    });
  }

  onMount(() => {
    currentLocale = getAppProp().localization.defaultLocale;
    const { appBar, softwareKey } = getAppProp();
    appBar.setTitleText(name);
    softwareKey.setText({ left: "", center: "SELECT", right: "+ Event" });
    navInstance.attachListener();
    getAppProp().hub.addStatusListener(onStatusChange)
    if (getAppProp().hub.status == true)
      conBtnLabel = 'Disconnect'
  });

  onDestroy(() => {
    navInstance.detachListener();
    getAppProp().hub.removeStatusListener(onStatusChange)
  });

  function toggleConnection() {
    if (getAppProp().hub.status == false)
      connect()
    else
      disconnect()
  }

  function connect() {
    getAppProp().hub.connect(ipAddress, port);
  }

  function disconnect() {
    if (getAppProp().hub.status == true) {
      getAppProp().hub.ws.close()
    }
  }

  function onStatusChange(status: boolean) {
    if (status === true)
      conBtnLabel = 'Disconnect'
    else
      conBtnLabel = 'Connect'
  }

  function navigateHandler(value) {
    goto(value);
  }

</script>

<main id="home-screen" data-pad-top="28" data-pad-bottom="30">
  <ListView className="{navClass}" title="{getAppProp().localization.langByLocale('contacts_label', currentLocale)}" subtitle="{getAppProp().localization.langByLocale('contacts_label_info', currentLocale)}" onClick={() => navigateHandler('contacts')}/>
  <ListView className="{navClass}" title="{getAppProp().localization.langByLocale('events_label', currentLocale)}" subtitle="{getAppProp().localization.langByLocale('events_label_info', currentLocale)}" onClick={() => navigateHandler('events')}/>
<!--
  <ListView className="{navClass}" title="{getAppProp().localization.langByLocale('change_locale', currentLocale)}" subtitle="{getAppProp().localization.langByLocale('change_locale_subtitle', currentLocale)}" onClick={changeLocale}/>
  <Separator title="Configuration" />
-->
  <Separator title="Connection" />
  <TextInputField className="{navClass}" label="Ip Address" placeholder="Placeholder" value="{ipAddress}" type="text" onInput="{onInputIp}" onFocus="{onFocusIp}" onBlur="{onBlurIp}" />
  <TextInputField className="{navClass}" label="Port" placeholder="Placeholder" value="{port}" type="tel" onInput="{onInputPort}" onFocus="{onFocusPort}" onBlur="{onBlurPort}" />
  <Button className="{navClass}" text="{conBtnLabel}" onClick={toggleConnection}>
    <span slot="rightWidget" class="kai-icon-arrow" style="margin:0px 5px;"></span>
  </Button>
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
