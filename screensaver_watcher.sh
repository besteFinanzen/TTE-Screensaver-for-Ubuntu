#!/bin/bash

# 180000 milliseconds = 3 minutes
IDLE_LIMIT=180000

while true; do
    # Ask Ubuntu (GNOME) exactly how long the user has been globally idle
    IDLE_MS=$(gdbus call -e -d org.gnome.Mutter.IdleMonitor -o /org/gnome/Mutter/IdleMonitor/Core -m org.gnome.Mutter.IdleMonitor.GetIdletime 2>/dev/null | awk '{print $2}' | tr -d ',)')

    # Fallback in case the command fails temporarily
    if [ -z "$IDLE_MS" ]; then
        IDLE_MS=0
    fi

    if [ "$IDLE_MS" -ge "$IDLE_LIMIT" ]; then
        # If idle for 3 mins, check if the screensaver is ALREADY running
        if ! pgrep -f "tte_screensaver.sh" > /dev/null; then
            # If not running, start it!
            ptyxis --standalone --fullscreen -- bash -c "~/Scripts/tte_screensaver.sh"
        fi
    else
        # If we are NOT idle (meaning you moved the mouse or typed)...
        # Check if the screensaver is running, and if so, kill it!
        if pgrep -f "tte_screensaver.sh" > /dev/null; then
            pkill -f "tte_screensaver.sh"
        fi
    fi

    # Check every 2 seconds
    sleep 2
done
