<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createKaiNavigator } from '../utils/navigation';
  import { SoftwareKey, Separator } from '../components';

  export let title: string = 'Event';
  export let event: any;
  export let onBackspace: Function = (evt) => {};
  export let onEnter: Function = (evt) => {};
  export let onOpened: Function = () => {};
  export let onClosed: Function = () => {};

  let softwareKey: SoftwareKey;

  let navOptions = {
    arrowUpListener: function(evt) {
      document.getElementsByClassName('kai-dialog-body')[0].scrollTop -= 20;
      evt.preventDefault();
      evt.stopPropagation();
    },
    arrowDownListener: function(evt) {
      document.getElementsByClassName('kai-dialog-body')[0].scrollTop += 20;
      evt.preventDefault();
      evt.stopPropagation();
    },
    arrowLeftListener: function(evt) {
      document.getElementsByClassName('kai-dialog-body')[0].scrollLeft -= 20;
      evt.preventDefault();
      evt.stopPropagation();
    },
    arrowRightListener: function(evt) {
      document.getElementsByClassName('kai-dialog-body')[0].scrollLeft += 20;
      evt.preventDefault();
      evt.stopPropagation();
    },
    enterListener: function(evt) {
        onEnter(evt);
    },
    backspaceListener: function(evt) {
        onBackspace(evt);
    }
  };

  let navInstance = createKaiNavigator(navOptions);

  onMount(() => {
    navInstance.attachListener();
    softwareKey = new SoftwareKey({
      target: document.body,
      props: {
        isInvert: false,
        leftText: '',
        centerText: 'CLOSE',
        rightText: ''
      }
    });
    onOpened();
  })

  onDestroy(() => {
    navInstance.detachListener();
    softwareKey.$destroy();
    onClosed();
  })

</script>

<svelte:options accessors/>

<div class="kai-dialog">
  <div class="kai-dialog-content">
    <div class="kai-dialog-header">{title}</div>
    <div class="kai-dialog-body" style="padding: 5px;display:flex;flex-direction:column;">
        <Separator title="Title" />
        <div style="font-size:85%;margin-bottom:5px;">{ event.summary || '(No title)' }</div>
        <Separator title="Description" />
        <div style="font-size:85%;margin-bottom:5px;">{ event.description || '(No description)' }</div>
        <Separator title="Start Date" />
        <div style="font-size:85%;margin-bottom:5px;">{ event.start.date || new Date(event.start.dateTime).toLocaleString() }</div>
        <Separator title="End Date" />
        <div style="font-size:85%;">{ event.end.date || new Date(event.end.dateTime).toLocaleString() }</div>
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
