from fastapi import FastAPI, Response
from fastapi.staticfiles import StaticFiles
import uvicorn
import socket
import qrcode

PORT = 8000

def get_local_ip() -> str:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    finally:
        s.close()

def generate_qr(url: str):
    qr = qrcode.QRCode()
    qr.add_data(url)
    qr.make()
    qr.print_ascii(invert=True)
    print(f"Scan the QR code above or open {url} in your browser")

class NoCacheStaticFiles(StaticFiles):
    async def get_response(self, path, scope):
        response: Response = await super().get_response(path, scope)
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        response.headers["Pragma"] = "no-cache"
        return response

def create_app() -> FastAPI:
    app = FastAPI()
    app.mount("/", NoCacheStaticFiles(directory=".", html=True), name="static")
    return app

def main():
    IP = get_local_ip()
    URL = f"http://{IP}:{PORT}/"
    generate_qr(URL)
    app = create_app()
    uvicorn.run(app, host=IP, port=PORT)

if __name__ == "__main__":
    main()
