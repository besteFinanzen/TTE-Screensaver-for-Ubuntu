#!/bin/bash

export PATH="$HOME/.local/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
sleep 1
tput civis 

# 1. Create a cleanup function to instantly kill the animation when a key is pressed
cleanup() {
    tput cnorm
    clear
    # Instantly kill all background child processes started by this script
    pkill -P $$ 
    exit 0
}

# 2. Tell the script to run the cleanup function the moment it is told to exit
trap cleanup SIGINT SIGTERM EXIT

# 3. Wrap the main animation loop in ( ) and add & to run it in the background
(
    INFO_STATE=0 
    EXCLUDED_EFFECTS="decrypt"
    
    while true; do
        clear
        
        if [ $INFO_STATE -eq 0 ]; then
            DISPLAY_TEXT="Nizent"
        elif [ $INFO_STATE -eq 1 ]; then
            BATTERY=$(cat /sys/class/power_supply/BAT*/capacity 2>/dev/null | head -n 1)
            if [ -z "$BATTERY" ]; then
                DISPLAY_TEXT="AC Power"
            else
                DISPLAY_TEXT="Battery: ${BATTERY}%"
            fi
        else
            DISPLAY_TEXT=$(date +"%H:%M")
        fi
        
        TERM_WIDTH=$(tput cols || echo 120)
        TERM_HEIGHT=$(tput lines || echo 30)

        figlet -f larry3d -c -w "$TERM_WIDTH" "$DISPLAY_TEXT" | tte --random-effect --exclude-effects "$EXCLUDED_EFFECTS" --reuse-canvas --canvas-height "$TERM_HEIGHT" --canvas-width "$TERM_WIDTH" --no-eol --no-restore-cursor --anchor-text w
        INFO_STATE=$(( (INFO_STATE + 1) % 3 ))
        
        sleep 2
    done
) &

# 4. Wait in the foreground for exactly 1 keypress (-n 1) silently (-s)
read -n 1 -s

# The moment you press a key, the script reaches this point, 
# triggers the EXIT trap, kills the animation, and closes the window!
