from fastapi import FastAPI, Response
from fastapi.staticfiles import StaticFiles
import uvicorn
import socket
import qrcode
import os

PORT = 8000

# Get LAN IP
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
try:
    s.connect(("8.8.8.8", 80))
    IP = s.getsockname()[0]
finally:
    s.close()

# Generate QR code
URL = f"http://{IP}:{PORT}/"
qr = qrcode.QRCode()
qr.add_data(URL)
qr.make()
qr.print_ascii(invert=True)
print(f"Scan the QR code above or open {URL} in your browser")

# FastAPI app
app = FastAPI()

# Custom StaticFiles to disable caching
class NoCacheStaticFiles(StaticFiles):
    async def get_response(self, path, scope):
        response: Response = await super().get_response(path, scope)
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        response.headers["Pragma"] = "no-cache"
        return response

app.mount("/", NoCacheStaticFiles(directory=".", html=True), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host=IP, port=PORT)
