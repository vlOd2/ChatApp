import logging
import msvcrt
from os import system
import time
import sys
from websocket_server import WebsocketServer

cmd = ""
cursor_pos = 0
in_prompt = False
interrupt_prompt = False

def clear_console():
    global interrupt_prompt
    system("cls")
    interrupt_prompt = True

def get_char():
    if msvcrt.kbhit():
        return int.from_bytes(msvcrt.getch(), signed=False)
    return None

def server_msg_received(client, server, message):
    global interrupt_prompt
    if message == "\x1B\xDE\xAD\xBE\xEF":
        clear_console()
    else:
        if in_prompt:
            sys.stdout.write("\n")
        sys.stdout.write(f"{message}\n")
        interrupt_prompt = True

print("TS2HTA - Remote console (port 13254)")
print("- CTRL-D: clear console")
print("- CTRL-C: close server")
print("")
server = WebsocketServer(host="127.0.0.1", port=13254, loglevel=logging.FATAL)
server.set_fn_message_received(server_msg_received)
server.run_forever(True)

try:
    while True:
        in_prompt = True
        sys.stdout.write("> ")
        if interrupt_prompt:
            interrupt_prompt = False
            sys.stdout.write(cmd)
        sys.stdout.flush()

        while not interrupt_prompt:
            char = get_char()
            
            if char == None:
                continue

            # enter
            if char == 0x0D:
                sys.stdout.write("\n")
                break

            # backspace
            if char == 0x08:
                if cursor_pos > 0:
                    cmd = cmd[:cursor_pos - 1] + cmd[cursor_pos:]
                    cursor_pos -= 1
                    sys.stdout.write("\b")
                    sys.stdout.write(cmd[cursor_pos:] + " ")
                    sys.stdout.write("\b" * (len(cmd) - cursor_pos + 1))
                    sys.stdout.flush()
                continue

            # arrow keys
            if char == 0 or char == 0xE0:
                special = get_char()

                # left arrow
                if special == 0x4B:
                    if cursor_pos > 0:
                        cursor_pos -= 1
                        sys.stdout.write("\b")
                        sys.stdout.flush()

                # right arrow
                if special == 0x4D:
                    if cursor_pos < len(cmd):
                        sys.stdout.write(cmd[cursor_pos])
                        sys.stdout.flush()
                        cursor_pos += 1

                continue

            if char == 0x04:
                clear_console()
                continue

            char = chr(char)
            if cursor_pos == len(cmd):
                cmd += char
                cursor_pos += 1
                sys.stdout.write(char)
                sys.stdout.flush()
            else:
                cmd = cmd[:cursor_pos] + char + cmd[cursor_pos:]
                sys.stdout.write(cmd[cursor_pos:])
                cursor_pos += 1
                sys.stdout.write("\b" * (len(cmd) - cursor_pos))
                sys.stdout.flush()

        in_prompt = False
        if not interrupt_prompt:
            server.send_message_to_all(cmd)
            cmd = ""
            cursor_pos = 0
            time.sleep(0.1)
        else:
            time.sleep(0.5)
except KeyboardInterrupt:
    print("\n\nExiting...")
    server.shutdown_gracefully()
    exit(0)
