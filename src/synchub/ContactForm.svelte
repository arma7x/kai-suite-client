<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createKaiNavigator } from '../utils/navigation';
  import { SoftwareKey, TextInputField } from '../components';

  export let title: string = 'Form';
  export let contact: any;
  export let softKeyLeftText: string = '';
  export let softKeyCenterText: string = '';
  export let softKeyRightText: string = '';
  export let onEnter: Function = (evt) => {};
  export let onBackspace: Function = (evt) => {};
  export let onSoftkeyLeft: Function = (evt) => {};
  export let onSoftkeyRight: Function = (evt, contact) => {};
  export let onOpened: Function = () => {};
  export let onClosed: Function = () => {};

  let softwareKey: SoftwareKey;

  let givenName: string = '';
  let familyName: string = '';
  let phoneNumber: string = '';
  let type: string = 'mobile';

  let navOptions = {
    verticalNavClass: 'contactFormNav',
    softkeyLeftListener: function(evt) {
      if (onSoftkeyLeft == null)
        return;
      console.log('softkeyLeftListener', title);
      onSoftkeyLeft(evt);
    },
    softkeyRightListener: function(evt) {
      if (onSoftkeyRight == null)
        return;
      console.log('softkeyRightListener', title);
      if (contact.name == null || (contact.name != null && contact.name.length === 0)) {
        if (contact.tel != null && contact.tel.length > 0) {
          contact.givenName = [contact.tel[0].value]
          contact.name = [contact.tel[0].value]
        } else {
          contact.name = null
        }
      }
      onSoftkeyRight(evt, contact);
    },
    enterListener: function(evt) {
      if (onEnter == null)
        return;
      console.log('enterListener', title);
      onEnter(evt);
    },
    backspaceListener: function(evt) {
      if (onBackspace == null)
        return;
      console.log('backspaceListener', title);
      onBackspace(evt);
    }
  };

  let navInstance = createKaiNavigator(navOptions);

  onMount(() => {
    console.log('onMount', title);
    navInstance.attachListener();
    softwareKey = new SoftwareKey({
      target: document.body,
      props: {
        isInvert: false,
        leftText: softKeyLeftText,
        centerText: softKeyCenterText,
        rightText: softKeyRightText
      }
    });
    if (contact.givenName != null && contact.givenName.length > 0) {
      givenName = contact.givenName[0]
    }
    if (contact.familyName != null && contact.familyName.length > 0) {
      familyName = contact.familyName[0]
    }
    if (contact.tel != null && contact.tel.length > 0) {
      phoneNumber = contact.tel[0].value
      type = contact.tel[0].type != null && contact.tel[0].type.length > 0 ? contact.tel[0].type[0] : type
    }
    onOpened();
  })

  onDestroy(() => {
    console.log('onDestroy', title);
    navInstance.detachListener();
    softwareKey.$destroy();
    onClosed();
  })

  function onGivenName(evt) {
    const val = evt.target.value.trim().toString();
    if (val)
      contact.givenName = [val]
    else
      contact.givenName = null
    updateName()
  }

  function onFamilyName(evt) {
    const val = evt.target.value.trim().toString();
    if (val)
      contact.familyName = [val]
    else
      contact.familyName = null
    updateName()
  }

  function onPhoneNumber(evt) {
    const val = evt.target.value.trim().toString();
    if (val) {
      contact.tel = [{ "type": [type], "value": val }]
    } else {
      contact.tel = null
    }
    updateName()
  }

  function updateName() {
    let name = [];
    if (contact.givenName != null && contact.givenName.length === 0) {
      contact.givenName = null
    }
    if (contact.familyName != null && contact.familyName.length === 0) {
      contact.familyName = null
    }
    if (contact.tel != null && contact.tel.length === 0) {
      contact.tel = null
    }
    if (contact.givenName != null && contact.givenName.length > 0)
      name.push(contact.givenName[0])
    if (contact.familyName != null && contact.familyName.length > 0)
      name.push(contact.familyName[0])
    if (name.length > 0)
      contact.name = [name.join(' ')]
    else {
      contact.name = null
    }
  }

</script>

<svelte:options accessors/>

<div class="kai-dialog">
  <div class="kai-dialog-content">
    <div class="kai-dialog-header">{title}</div>
    <div class="kai-dialog-body">
      <TextInputField className="contactFormNav" label="Given Name" placeholder="Enter given name" value="{givenName}" type="text" onInput="{onGivenName}" />
      <TextInputField className="contactFormNav" label="Family Name" placeholder="Enter family name" value="{familyName}" type="text" onInput="{onFamilyName}" />
      <TextInputField className="contactFormNav" label="Phone Number" placeholder="Enter phone number" value="{phoneNumber}" type="tel" onInput="{onPhoneNumber}" />
    </div>
  </div>
</div>

<style>
  .kai-dialog {
    width: 100%;
    height: calc(100% - 12px);
    bottom: 30px;
    position: fixed;
    background-color: rgba(0, 0, 0, 0.6);
  }
  .kai-dialog > .kai-dialog-content {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-height: calc(100% - 66px);
    bottom: 30px;
    position: fixed;
    background-color: #ffffff;
  }
  .kai-dialog > .kai-dialog-content > .kai-dialog-header {
    width: 100%;
    text-align: center;
    vertical-align: middle;
    line-height: 28px;
    height: 28px;
    padding: 0 4px;
    color: #313131;
    background-color: #cccccc;
    font-weight: 200;
  }
  .kai-dialog > .kai-dialog-content > .kai-dialog-body {
    max-height: calc(100% - 78px);
    overflow: scroll;
  }
</style>
