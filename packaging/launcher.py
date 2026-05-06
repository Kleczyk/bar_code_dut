"""
Launcher dla Generatora identyfikatorów.
Uruchamia serwer FastAPI i otwiera przeglądarkę.
Przenośny: działa na dowolnym Windows bez instalacji.
"""
import atexit
import os
import signal
import socket
import sys
import tempfile
import threading
import time
import webbrowser

import uvicorn

HOST = "127.0.0.1"
DEFAULT_PORT = 8000
MAX_PORT_ATTEMPTS = 20


def _find_free_port(start: int = DEFAULT_PORT) -> int:
    """Znajdź wolny port TCP, zaczynając od *start*."""
    for port in range(start, start + MAX_PORT_ATTEMPTS):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind((HOST, port))
                return port
            except OSError:
                continue
    # Fallback: niech OS przydzieli dowolny wolny port
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((HOST, 0))
        return s.getsockname()[1]


def _setup_path():
    """Dodaj backend do sys.path (PyInstaller lub dev)."""
    if getattr(sys, "frozen", False):
        backend_path = os.path.join(sys._MEIPASS, "backend")
    else:
        base = os.path.dirname(os.path.abspath(__file__))
        backend_path = os.path.join(base, "..", "app", "backend")
    backend_path = os.path.normpath(backend_path)
    if backend_path not in sys.path:
        sys.path.insert(0, backend_path)


def _show_splash(port: int):
    """Pokaż systemowy komunikat (Windows) informujący o starcie."""
    if sys.platform != "win32":
        return
    try:
        import ctypes
        ctypes.windll.user32.MessageBoxW(
            0,
            f"Generator identyfikatorów uruchamia się...\n\n"
            f"Przeglądarka otworzy się automatycznie.\n"
            f"Adres: http://{HOST}:{port}\n\n"
            f"Kliknij OK, aby kontynuować.",
            "Generator identyfikatorów",
            0x00000040,  # MB_ICONINFORMATION
        )
    except Exception:
        pass


def _open_browser(port: int):
    """Otwórz przeglądarkę gdy serwer jest gotowy."""
    url = f"http://{HOST}:{port}"
    time.sleep(1.0)
    for _ in range(30):
        try:
            import urllib.request
            urllib.request.urlopen(url, timeout=1)
            webbrowser.open(url)
            return
        except Exception:
            time.sleep(0.5)


def _cleanup_tempfiles():
    """Sprzątnij pliki tymczasowe utworzone przez aplikację."""
    tmp_dir = tempfile.gettempdir()
    try:
        for name in os.listdir(tmp_dir):
            if name.startswith("tmp") and name.endswith((".png", ".jpg", ".jpeg", ".svg")):
                path = os.path.join(tmp_dir, name)
                try:
                    os.unlink(path)
                except OSError:
                    pass
    except OSError:
        pass


_server_instance = None


def _signal_handler(signum, frame):
    """Graceful shutdown przy Ctrl+C lub zamknięciu okna."""
    global _server_instance
    if _server_instance is not None:
        _server_instance.should_exit = True
    else:
        sys.exit(0)


def main():
    global _server_instance

    _setup_path()

    port = _find_free_port()

    atexit.register(_cleanup_tempfiles)
    signal.signal(signal.SIGINT, _signal_handler)
    signal.signal(signal.SIGTERM, _signal_handler)
    if sys.platform == "win32":
        try:
            signal.signal(signal.SIGBREAK, _signal_handler)
        except (AttributeError, OSError):
            pass

    if sys.platform == "win32" and getattr(sys, "frozen", False):
        splash_thread = threading.Thread(target=_show_splash, args=(port,), daemon=True)
        splash_thread.start()

    browser_thread = threading.Thread(target=_open_browser, args=(port,), daemon=True)
    browser_thread.start()

    print(f"Generator identyfikatorów")
    print(f"Serwer: http://{HOST}:{port}")
    print(f"Przeglądarka otworzy się automatycznie.")
    print(f"Aby zatrzymać, naciśnij Ctrl+C lub zamknij to okno.")
    print()

    config = uvicorn.Config(
        "main:app",
        host=HOST,
        port=port,
        log_level="warning",
    )
    _server_instance = uvicorn.Server(config)
    _server_instance.run()


if __name__ == "__main__":
    main()
