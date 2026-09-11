// ============================================================
// STAFFHUB - QR MONITOR PAIRING SERVICE
// FRONTEND DEMO / MOCK IMPLEMENTATION
//
// This handles:
// - Random 6-digit monitor pairing key
// - Monitor activation
// - Monitor deactivation
//
// IMPORTANT:
// This currently uses localStorage.
// For real multi-device usage, move this to Spring Boot.
// ============================================================

export interface QrMonitorState {
  pairingKey: string;
  createdAt: string;
  expiresAt: string;
  active: boolean;
  activatedAt: string | null;
  activatedBy: string | null;
}

const MONITOR_KEY =
  'staffhub_qr_monitor_state';

const PAIRING_KEY_LIFETIME_SECONDS = 120;


// ============================================================
// GENERATE RANDOM 6-DIGIT KEY
// ============================================================

function generatePairingKey(): string {
  return Math.floor(
    100000 +
      Math.random() * 900000
  ).toString();
}


// ============================================================
// CREATE NEW MONITOR KEY
// ============================================================

export function createMonitorKey(): QrMonitorState {
  const now = Date.now();

  const state: QrMonitorState = {
    pairingKey: generatePairingKey(),

    createdAt:
      new Date(now).toISOString(),

    expiresAt:
      new Date(
        now +
          PAIRING_KEY_LIFETIME_SECONDS *
            1000
      ).toISOString(),

    active: false,

    activatedAt: null,

    activatedBy: null,
  };

  saveMonitorState(state);

  return state;
}


// ============================================================
// READ MONITOR STATE
// ============================================================

export function getMonitorState():
  QrMonitorState | null {

  try {
    const value =
      localStorage.getItem(
        MONITOR_KEY
      );

    if (!value) {
      return null;
    }

    const state =
      JSON.parse(value) as QrMonitorState;

    // Automatically expire unused pairing key.
    if (
      !state.active &&
      new Date(
        state.expiresAt
      ).getTime() <= Date.now()
    ) {
      return createMonitorKey();
    }

    return state;

  } catch {
    return null;
  }
}


// ============================================================
// SAVE STATE
// ============================================================

function saveMonitorState(
  state: QrMonitorState
): void {

  localStorage.setItem(
    MONITOR_KEY,
    JSON.stringify(state)
  );

  notifyMonitorChange();
}


// ============================================================
// STORAGE EVENT
// ============================================================

function notifyMonitorChange(): void {

  window.dispatchEvent(
    new StorageEvent(
      'storage',
      {
        key: MONITOR_KEY,
        newValue:
          localStorage.getItem(
            MONITOR_KEY
          ),
        storageArea:
          localStorage,
      }
    )
  );
}


// ============================================================
// ACTIVATE MONITOR
// ============================================================

export function activateMonitor(
  enteredKey: string,
  activatedBy: string
): QrMonitorState {

  const state =
    getMonitorState();

  if (!state) {
    throw new Error(
      'Monitor key is not available.'
    );
  }

  if (
    new Date(
      state.expiresAt
    ).getTime() <= Date.now()
  ) {
    const newState =
      createMonitorKey();

    throw new Error(
      `Pairing key expired. New key: ${newState.pairingKey}`
    );
  }

  if (
    state.pairingKey !==
    enteredKey.trim()
  ) {
    throw new Error(
      'Invalid monitor pairing key.'
    );
  }

  const updated: QrMonitorState = {
    ...state,

    active: true,

    activatedAt:
      new Date().toISOString(),

    activatedBy,
  };

  saveMonitorState(updated);

  return updated;
}


// ============================================================
// DEACTIVATE MONITOR
// ============================================================

export function deactivateMonitor(): void {

  const state =
    getMonitorState();

  if (!state) {
    return;
  }

  const updated: QrMonitorState = {
    ...state,

    active: false,

    activatedAt: null,

    activatedBy: null,
  };

  saveMonitorState(updated);
}


// ============================================================
// RESET MONITOR
// ============================================================

export function resetMonitor(): QrMonitorState {

  return createMonitorKey();
}


// ============================================================
// IS ACTIVE
// ============================================================

export function isMonitorActive(): boolean {

  const state =
    getMonitorState();

  return Boolean(
    state?.active
  );
}