import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import {
    AVAHI_SERVICE,
    AVAHI_SERVER_PATH,
    AVAHI_SERVER_IFACE,
    AVAHI_BROWSER_IFACE,
    AVAHI_RESOLVER_IFACE,
    AVAHI_IF_UNSPEC,
    AVAHI_PROTO_UNSPEC,
    AVAHI_LOOKUP_FLAGS,
    AVAHI_SERVICE_TYPE,
    AVAHI_SERVICE_DOMAIN,
} from './constants.js';

export class AvahiDiscovery {
    constructor(onDiscovered, onRemoved, onError) {
        this._onDiscovered = onDiscovered;
        this._onRemoved = onRemoved;
        this._onError = onError;

        this._serverProxy = null;
        this._browserProxy = null;
        this._browserSignalIds = [];

        this._resolverProxies = new Map();
        this._resolverSignalIds = new Map();
        this._serviceToDeviceId = new Map();
    }

    start() {
        try {
            this.stop();

            this._serverProxy = Gio.DBusProxy.new_for_bus_sync(
                Gio.BusType.SYSTEM,
                Gio.DBusProxyFlags.NONE,
                null,
                AVAHI_SERVICE,
                AVAHI_SERVER_PATH,
                AVAHI_SERVER_IFACE,
                null
            );

            const [browserPath] = this._serverProxy.call_sync(
                'ServiceBrowserNew',
                new GLib.Variant('(iissu)', [
                    AVAHI_IF_UNSPEC,
                    AVAHI_PROTO_UNSPEC,
                    AVAHI_SERVICE_TYPE,
                    AVAHI_SERVICE_DOMAIN,
                    AVAHI_LOOKUP_FLAGS,
                ]),
                Gio.DBusCallFlags.NONE,
                -1,
                null
            ).deepUnpack();

            this._browserProxy = Gio.DBusProxy.new_for_bus_sync(
                Gio.BusType.SYSTEM,
                Gio.DBusProxyFlags.NONE,
                null,
                AVAHI_SERVICE,
                browserPath,
                AVAHI_BROWSER_IFACE,
                null
            );

            this._browserSignalIds.push(this._browserProxy.connectSignal('ItemNew', (_proxy, _sender, params) => {
                this._resolveService(params.deepUnpack());
            }));

            this._browserSignalIds.push(this._browserProxy.connectSignal('ItemRemove', (_proxy, _sender, params) => {
                this._removeService(params.deepUnpack());
            }));
        } catch (error) {
            this._onError(error);
        }
    }

    stop() {
        for (const signalId of this._browserSignalIds) {
            if (this._browserProxy)
                this._browserProxy.disconnectSignal(signalId);
        }
        this._browserSignalIds = [];

        for (const [serviceKey, resolver] of this._resolverProxies) {
            const signalIds = this._resolverSignalIds.get(serviceKey) ?? [];
            for (const signalId of signalIds)
                resolver.disconnectSignal(signalId);
        }
        this._resolverProxies.clear();
        this._resolverSignalIds.clear();
        this._serviceToDeviceId.clear();
        this._browserProxy = null;
        this._serverProxy = null;
    }

    _resolveService([iface, protocol, name, type, domain]) {
        const serviceKey = `${name}::${type}::${domain}`;
        if (this._resolverProxies.has(serviceKey))
            return;

        try {
            const [resolverPath] = this._serverProxy.call_sync(
                'ServiceResolverNew',
                new GLib.Variant('(iisssiu)', [
                    iface,
                    protocol,
                    name,
                    type,
                    domain,
                    AVAHI_PROTO_UNSPEC,
                    AVAHI_LOOKUP_FLAGS,
                ]),
                Gio.DBusCallFlags.NONE,
                -1,
                null
            ).deepUnpack();

            const resolver = Gio.DBusProxy.new_for_bus_sync(
                Gio.BusType.SYSTEM,
                Gio.DBusProxyFlags.NONE,
                null,
                AVAHI_SERVICE,
                resolverPath,
                AVAHI_RESOLVER_IFACE,
                null
            );

            const signalIds = [];
            signalIds.push(resolver.connectSignal('Found', (_proxy, _sender, params) => {
                const [
                    _i,
                    _p,
                    foundName,
                    _t,
                    _d,
                    host,
                    _aproto,
                    address,
                    port,
                ] = params.deepUnpack();

                const deviceId = `${address}:${port}`;
                this._serviceToDeviceId.set(serviceKey, deviceId);
                this._onDiscovered({
                    id: deviceId,
                    address,
                    port,
                    name: foundName,
                    host,
                });
            }));

            signalIds.push(resolver.connectSignal('Failure', (_proxy, _sender, params) => {
                const [message] = params.deepUnpack();
                this._onError(new Error(`Avahi resolver failure: ${message}`));
            }));

            this._resolverProxies.set(serviceKey, resolver);
            this._resolverSignalIds.set(serviceKey, signalIds);
        } catch (error) {
            this._onError(error);
        }
    }

    _removeService([_iface, _protocol, name, type, domain]) {
        const serviceKey = `${name}::${type}::${domain}`;
        const deviceId = this._serviceToDeviceId.get(serviceKey);
        if (deviceId)
            this._onRemoved(deviceId);

        this._serviceToDeviceId.delete(serviceKey);

        const resolver = this._resolverProxies.get(serviceKey);
        if (resolver) {
            const signalIds = this._resolverSignalIds.get(serviceKey) ?? [];
            for (const signalId of signalIds)
                resolver.disconnectSignal(signalId);
        }
        this._resolverProxies.delete(serviceKey);
        this._resolverSignalIds.delete(serviceKey);
    }
}
