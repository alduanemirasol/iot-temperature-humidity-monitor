import http.server
import socketserver
import socket

PORT = 8000

s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
try:
    s.connect(("8.8.8.8", 80))
    IP = s.getsockname()[0]
finally:
    s.close()

Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer((IP, PORT), Handler) as httpd:
    print(f"Serving on IP: {IP}, Port: {PORT}")
    print(f"Access your site at http://{IP}:{PORT}/")
    print("Press Ctrl+C to stop")
    httpd.serve_forever()
