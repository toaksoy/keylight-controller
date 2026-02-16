import St from 'gi://St';

import * as ExtensionUtils from 'resource:///org/gnome/shell/misc/extensionUtils.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import {KeyLightIndicator} from './keyLightIndicator.js';

export default class KeyLightNeoExtension {
    constructor(metadata) {
        this.uuid = metadata.uuid;
        this._stylesheetFile = null;
    }

    enable() {
        this._loadStylesheet();
        this._indicator = new KeyLightIndicator();
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
        this._unloadStylesheet();
    }

    _loadStylesheet() {
        try {
            const extension = ExtensionUtils.getCurrentExtension();
            this._stylesheetFile = extension.dir.get_child('stylesheet.css');
            const theme = St.ThemeContext.get_for_stage(global.stage).get_theme();
            theme.load_stylesheet(this._stylesheetFile);
        } catch (error) {
            logError(error, `${this.uuid}: failed to load stylesheet`);
        }
    }

    _unloadStylesheet() {
        if (!this._stylesheetFile)
            return;

        try {
            const theme = St.ThemeContext.get_for_stage(global.stage).get_theme();
            theme.unload_stylesheet(this._stylesheetFile);
        } catch (error) {
            logError(error, `${this.uuid}: failed to unload stylesheet`);
        } finally {
            this._stylesheetFile = null;
        }
    }
}
