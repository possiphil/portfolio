const root = document.documentElement;
const dialogTriggers = new WeakMap<HTMLDialogElement, HTMLElement>();

export function openDialog(dialog: HTMLDialogElement, trigger: HTMLElement) {
  if (typeof dialog.showModal !== 'function' || dialog.open) return;
  dialogTriggers.set(dialog, trigger);
  dialog.showModal();
  root.setAttribute('data-dialog-open', '');
  if (trigger.hasAttribute('aria-expanded')) trigger.setAttribute('aria-expanded', 'true');
}

export function dismissDialog(dialog: HTMLDialogElement, restoreFocus = true) {
  if (!dialog.open) return;
  if (!restoreFocus) {
    dialogTriggers.get(dialog)?.setAttribute('aria-expanded', 'false');
    dialogTriggers.delete(dialog);
  }
  dialog.close();
  root.toggleAttribute('data-dialog-open', Boolean(document.querySelector('dialog[open]')));
}

export function setupDialogs() {
  if (typeof HTMLDialogElement === 'undefined' || typeof HTMLDialogElement.prototype.showModal !== 'function') return;
  root.dataset.dialogs = '';

  for (const trigger of document.querySelectorAll<HTMLButtonElement>('[data-open-dialog]')) {
    const dialog = document.getElementById(trigger.dataset.openDialog ?? '');
    if (!(dialog instanceof HTMLDialogElement)) continue;
    if (trigger.classList.contains('menu-toggle')) trigger.hidden = false;
    trigger.addEventListener('click', () => openDialog(dialog, trigger));
  }

  for (const dialog of document.querySelectorAll('dialog')) {
    const outside = (event: MouseEvent) => {
      if (event.target !== dialog) return false;
      const { left, right, top, bottom } = dialog.getBoundingClientRect();
      return event.clientX < left || event.clientX > right || event.clientY < top || event.clientY > bottom;
    };
    let pressedOutside = false;

    dialog.addEventListener('pointerdown', (event) => { pressedOutside = outside(event); });
    dialog.addEventListener('click', (event) => {
      const explicitClose = (event.target as Element).closest('[data-close-dialog]');
      if (explicitClose || (pressedOutside && outside(event))) dismissDialog(dialog);
    });
    dialog.addEventListener('close', () => {
      if (dialog.open) return;
      root.toggleAttribute('data-dialog-open', Boolean(document.querySelector('dialog[open]')));
      const trigger = dialogTriggers.get(dialog);
      if (trigger?.hasAttribute('aria-expanded')) trigger.setAttribute('aria-expanded', 'false');
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
      dialogTriggers.delete(dialog);
    });
  }

  const menu = document.querySelector<HTMLDialogElement>('#site-menu');
  matchMedia('(max-width: 52rem)').addEventListener('change', ({ matches }) => {
    if (!matches && menu?.open) dismissDialog(menu, false);
  });

  window.addEventListener('pagehide', () => {
    document.querySelectorAll<HTMLDialogElement>('dialog[open]').forEach((dialog) => dismissDialog(dialog, false));
  });
}
