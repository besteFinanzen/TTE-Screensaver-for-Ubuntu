import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as QuickSettings from 'resource:///org/gnome/shell/ui/quickSettings.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

// Wir definieren den Toggle-Button
const ScreensaverToggle = GObject.registerClass(
class ScreensaverToggle extends QuickSettings.QuickMenuToggle {
    _init() {
        super._init({
            title: 'TTE Screensaver',
            iconName: 'video-display-symbolic',
            toggleMode: true,
        });

        this._timeoutId = null;
        this.checked = this._checkIsRunning();

        this.connect('clicked', () => {
            this._clearTimeout();
            if (this.checked) {
                this._startWatcher();
            } else {
                this._stopWatcher();
            }
        });

        this._buildMenu();
    }

    _buildMenu() {
        const pauseOptions = [
            ['10 Min pausieren', 600],
            ['1 Stunde pausieren', 3600],
            ['2 Stunden pausieren', 7200],
            ['5 Stunden pausieren', 18000],
            ['8 Stunden pausieren', 28800]
        ];

        pauseOptions.forEach(([label, seconds]) => {
            let item = new PopupMenu.PopupMenuItem(label);
            item.connect('activate', () => this._pauseFor(seconds));
            this.menu.addMenuItem(item);
        });
    }

    _pauseFor(seconds) {
        this._clearTimeout();
        this._stopWatcher();
        this.checked = false;

        this._timeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, seconds, () => {
            this._startWatcher();
            this.checked = true;
            this._timeoutId = null;
            return GLib.SOURCE_REMOVE;
        });
    }

    _clearTimeout() {
        if (this._timeoutId !== null) {
            GLib.source_remove(this._timeoutId);
            this._timeoutId = null;
        }
    }

    _checkIsRunning() {
        try {
            let [, out] = GLib.spawn_command_line_sync('pgrep -f screensaver_watcher.sh');
            return out !== null && out.length > 0;
        } catch (e) { return false; }
    }

    _startWatcher() {
        let home = GLib.get_home_dir();
        let cmd = `nohup ${home}/screensaver_watcher.sh > /dev/null 2>&1 &`;
        try { Gio.Subprocess.new(['/bin/bash', '-c', cmd], Gio.SubprocessFlags.NONE); } catch (e) {}
    }

    _stopWatcher() {
        try { Gio.Subprocess.new(['pkill', '-f', 'screensaver_watcher.sh'], Gio.SubprocessFlags.NONE); } catch (e) {}
    }
});

// Der "Indicator"-Wrapper, der den Toggle ins Menü schiebt
const TTEScreenIndicator = GObject.registerClass(
class TTEScreenIndicator extends QuickSettings.SystemIndicator {
    _init() {
        super._init();
        
        // Erstelle den Toggle
        this._toggle = new ScreensaverToggle();
        
        // Füge den Toggle zum Quick Settings Menü hinzu
        this.quickSettingsItems.push(this._toggle);
    }
});

export default class TTEScreensaverExtension extends Extension {
    enable() {
        this._indicator = new TTEScreenIndicator();
        
        // Dies ist der sicherste Weg für GNOME 46-49
        Main.panel.statusArea.quickSettings.addExternalIndicator(this._indicator);
    }

    disable() {
        if (this._indicator) {
            if (this._indicator._toggle) {
                this._indicator._toggle._clearTimeout();
            }
            this._indicator.destroy();
            this._indicator = null;
        }
    }
}
