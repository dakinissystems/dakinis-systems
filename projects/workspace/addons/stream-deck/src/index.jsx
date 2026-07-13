/**
 * Stream Deck — Dakinis Workspace addon entry.
 * Widgets consume StreamAutomator GET /api/workspace/widgets (via platform proxy).
 */
import { registerAddon as sdkRegisterAddon } from '@dakinis/addon-sdk';
import manifest from './manifest.json';

const WIDGET_IDS = [
  'streamautomator.next-stream',
  'streamautomator.director',
  'streamautomator.automation',
  'streamautomator.obs-status',
];

export { manifest };

export function registerAddon(ctx) {
  return sdkRegisterAddon(ctx, {
    ...manifest,
    capabilities: [{ id: 'widget-framework', version: '1' }],
    widgets: Object.fromEntries(
      WIDGET_IDS.map((id) => [
        id,
        {
          id,
          product: 'streamautomator',
          dataSource: '/api/workspace/widgets',
          refreshMs: 30_000,
        },
      ]),
    ),
    commands: [
      {
        id: 'stream-deck.open-director',
        title: { en: 'Open Director mode', es: 'Abrir Modo Director' },
        run: () => ctx.navigate?.('/streamautomator/director'),
      },
      {
        id: 'stream-deck.open-automation',
        title: { en: 'Open Automation', es: 'Abrir Automatización' },
        run: () => ctx.navigate?.('/streamautomator/automation'),
      },
    ],
    windows: {},
    routes: [],
    lifecycle: {
      onStart() {
        WIDGET_IDS.forEach((id) => {
          ctx.widgets?.register?.(id, { product: 'streamautomator' });
        });
      },
    },
  });
}
