<script lang="ts">
  import { Route, navigate as goto } from "svelte-navigator";
  import { createKaiNavigator } from '../utils/navigation';
  import { Dialog, OptionMenu, ListView, Separator, Button, TextInputField, Toast, Toaster, SoftwareKey } from '../components';
  import { onMount, onDestroy } from 'svelte';
  import uaparser from 'ua-parser-js';

  const navClass: string = 'homeNav';
  export let location: any;
  export let navigate: any;
  export let getAppProp: Function;

  let currentLocale: string;
  let name: string = 'Home';
  let ipAddress: string = '192.168.43.33';
  let port: string = '4444';
  let conBtnLabel: string = 'Connect';
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
      // console.log('softkeyLeftListener', name, this.verticalNavIndex);
    },
    softkeyRightListener: function(evt) {
      if (inputSoftwareKey)
        return;
      toastMessage();
      // console.log('softkeyRightListener', name, this.verticalNavIndex);
    },
    enterListener: function(evt) {
      if (inputSoftwareKey)
        return;
      const navClasses = document.getElementsByClassName(navClass);
      if (navClasses[this.verticalNavIndex] != null) {
        navClasses[this.verticalNavIndex].click();
      }
      // console.log('enterListener', name);
    },
    backspaceListener: function(evt) {
      // console.log('backspaceListener', name);
    },
    arrowLeftListener: function(evt) {
      // console.log('arrowLeftListener', name);
    },
    arrowRightListener: function(evt) {
      // console.log('arrowRightListener', name);
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

  function onButtonExit(evt) {
    window.close();
  }

  function onFocusIp(evt) {
    // console.log('onFocus onFocusIp');
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
    // console.log('onBlur onBlurIp');
    if (inputSoftwareKey) {
      inputSoftwareKey.$destroy();
      inputSoftwareKey = null;
    }
  }

  function onInputIp(evt) {
    // console.log('onInput onInputIp', evt.target.value);
    ipAddress = evt.target.value.toString();
  }

  function onFocusPort(evt) {
    // console.log('onFocus onFocusPort');
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
    // console.log('onBlur onBlurPort');
    if (inputSoftwareKey) {
      inputSoftwareKey.$destroy();
      inputSoftwareKey = null;
    }
  }

  function onInputPort(evt) {
    // console.log('onInput onInputPort', evt.target.value);
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
        onSoftkeyRight: (evt, scope) => {
          // console.log('onSoftkeyRight', scope);
        },
        onSoftkeyLeft: (evt, scope) => {
          // console.log('onSoftkeyRight', scope);
        },
        onEnter: (evt, scope) => {
          // console.log('onEnter', scope);
          getAppProp().localization.loadLocale(scope.selected.subtitle);
          currentLocale = getAppProp().localization.defaultLocale;
          localeMenu.$destroy();
        },
        onBackspace: (evt, scope) => {
          // console.log('onBackspace', scope);
          evt.preventDefault();
          evt.stopPropagation();
          localeMenu.$destroy();
        },
        onOpened: () => {
          navInstance.detachListener();
        },
        onClosed: (scope) => {
          // console.log(scope);
          navInstance.attachListener();
          localeMenu = null;
        }
      }
    });
  }

  onMount(() => {
    console.log('onMount', name);
    currentLocale = getAppProp().localization.defaultLocale;
    const { appBar, softwareKey } = getAppProp();
    appBar.setTitleText(name);
    softwareKey.setText({ left: "", center: "SELECT", right: "" });
    navInstance.attachListener();
    getAppProp().hub.addStatusListener(onStatusChange)
    if (getAppProp().hub.status == true)
      conBtnLabel = 'Disconnect'
  });

  onDestroy(() => {
    console.log('onDestroy', name);
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
    console.log('onStatusChange', status);
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
  <ListView className="{navClass}" title="{getAppProp().localization.langByLocale('change_locale', currentLocale)}" subtitle="{getAppProp().localization.langByLocale('change_locale_subtitle', currentLocale)}" onClick={changeLocale}/>
  <Separator title="Configuration" />
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
