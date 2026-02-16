export const AVAHI_SERVICE = 'org.freedesktop.Avahi';
export const AVAHI_SERVER_PATH = '/';
export const AVAHI_SERVER_IFACE = 'org.freedesktop.Avahi.Server';
export const AVAHI_BROWSER_IFACE = 'org.freedesktop.Avahi.ServiceBrowser';
export const AVAHI_RESOLVER_IFACE = 'org.freedesktop.Avahi.ServiceResolver';
export const AVAHI_IF_UNSPEC = -1;
export const AVAHI_PROTO_UNSPEC = -1;
export const AVAHI_LOOKUP_FLAGS = 0;
export const AVAHI_SERVICE_TYPE = '_elg._tcp';
export const AVAHI_SERVICE_DOMAIN = 'local';

export const API_PATH = '/elgato/lights';
export const ACCESSORY_INFO_PATH = '/elgato/accessory-info';
export const DEFAULT_PORT = 9123;

export const BRIGHTNESS_MIN = 0;
export const BRIGHTNESS_MAX = 100;
export const KELVIN_MIN = 2900;
export const KELVIN_MAX = 7000;
// Use inclusive bounds that map safely to device-supported mired range.
export const MIRED_MIN = Math.ceil(1000000 / KELVIN_MAX); // 143
export const MIRED_MAX = Math.floor(1000000 / KELVIN_MIN); // 344

export const POLL_INTERVAL_SECONDS = 8;
export const UPDATE_DEBOUNCE_MS = 120;
export const DISCOVERY_TIMEOUT_SECONDS = 6;
export const ELGATO_HTTP_PORT = 9123;
export const HTTP_TIMEOUT_SECONDS = 2;
export const SUBNET_SCAN_MAX_HOSTS = 512;
export const SUBNET_SCAN_CONCURRENCY = 24;
export const BRIGHTNESS_STEP = 5;
export const DEFAULT_DEVICE_BRIGHTNESS_MAX = 100;
export const BRIGHTNESS_COLOR_LOW = [70, 70, 70];
export const BRIGHTNESS_COLOR_HIGH = [255, 245, 200];
export const TEMPERATURE_COLOR_WARM = [255, 199, 82];
export const TEMPERATURE_COLOR_COOL = [245, 245, 245];
