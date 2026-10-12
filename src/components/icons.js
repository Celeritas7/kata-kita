const s = (body, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${body}</svg>`;

export const IC = {
  home: s('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  learn: s('<rect x="6" y="3" width="13" height="17" rx="2.5" transform="rotate(8 12 12)"/><rect x="4" y="4" width="13" height="17" rx="2.5"/>'),
  garden: s('<path d="M12 21v-9"/><path d="M12 12c0-4 3-7 7-7 0 4-3 7-7 7zM12 14c0-3-2.5-5.5-6-5.5 0 3 2.5 5.5 6 5.5z"/><path d="M6 21h12"/>'),
  map: s('<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>'),
  shop: s('<rect x="3" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/><rect x="15" y="9" width="6" height="6" rx="1.5"/><path d="M12 4v3M12 17v3"/>'),
  sound: s('<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/>'),
  theme: s('<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>'),
  back: s('<path d="M15 5l-7 7 7 7"/>', ' stroke-width="2.4"'),
  next: s('<path d="M9 5l7 7-7 7"/>', ' stroke-width="2.4"'),
  user: s('<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>'),
  check: s('<path d="M5 12.5l4.5 4.5L19 7.5"/>', ' stroke-width="3"'),
  cross: s('<path d="M6 6l12 12M18 6L6 18"/>', ' stroke-width="3"'),
  dash: s('<path d="M7 12h10"/>', ' stroke-width="3"'),
};
